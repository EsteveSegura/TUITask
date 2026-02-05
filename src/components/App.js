import React, { useEffect, useRef } from 'react';
import { Box, Text, useInput, useApp, useStdout } from 'ink';
import useAppState from '../hooks/useAppState.js';
import Storage from '../services/Storage.js';
import BoardView from './BoardView.js';
import MenuOverlay from './MenuOverlay.js';
import ModalInput from './ModalInput.js';
import BoardSwitcher from './BoardSwitcher.js';

export default function App() {
  const initialData = useRef(Storage.load()).current;
  const [state, dispatch] = useAppState(initialData);
  const { exit } = useApp();
  const { stdout } = useStdout();

  const {
    boards, columns, tasks,
    activeBoardId, focusedColumnIndex, focusedTaskIndex,
    selectedTaskId, uiMode, notification, pendingDelete,
  } = state;

  // Persist data changes
  useEffect(() => {
    Storage.save({ boards, columns, tasks });
  }, [boards, columns, tasks]);

  // Board navigation (no task selected)
  const boardInputActive = uiMode === 'board' && !selectedTaskId;
  useInput((input, key) => {
    if (key.leftArrow) {
      dispatch({ type: 'NAVIGATE', direction: 'left' });
    } else if (key.rightArrow) {
      dispatch({ type: 'NAVIGATE', direction: 'right' });
    } else if (key.upArrow) {
      dispatch({ type: 'NAVIGATE', direction: 'up' });
    } else if (key.downArrow) {
      dispatch({ type: 'NAVIGATE', direction: 'down' });
    } else if (input.toUpperCase() === 'M') {
      dispatch({ type: 'OPEN_MENU' });
    } else if (input.toUpperCase() === 'D') {
      dispatch({ type: 'REQUEST_DELETE', deleteType: 'column' });
    } else if (input.toUpperCase() === 'E') {
      dispatch({ type: 'OPEN_MODAL', mode: 'modal_edit_column' });
    } else if (input.toUpperCase() === 'S') {
      dispatch({ type: 'SELECT_TASK' });
    } else if (input.toUpperCase() === 'Q') {
      exit();
    }
  }, { isActive: boardInputActive });

  // Task selected mode
  const selectedInputActive = uiMode === 'board' && !!selectedTaskId;
  useInput((input, key) => {
    if (key.leftArrow) {
      dispatch({ type: 'MOVE_TASK', direction: 'left' });
    } else if (key.rightArrow) {
      dispatch({ type: 'MOVE_TASK', direction: 'right' });
    } else if (input.toUpperCase() === 'D') {
      dispatch({ type: 'REQUEST_DELETE', deleteType: 'task' });
    } else if (input.toUpperCase() === 'E') {
      dispatch({ type: 'OPEN_MODAL', mode: 'modal_edit_task' });
    } else if (input.toUpperCase() === 'S') {
      dispatch({ type: 'DESELECT_TASK' });
    }
  }, { isActive: selectedInputActive });

  // Confirm delete mode
  const confirmActive = uiMode === 'confirm_delete';
  useInput((input, key) => {
    if (input.toUpperCase() === 'Y') {
      dispatch({ type: 'CONFIRM_DELETE' });
    } else if (input.toUpperCase() === 'N' || key.escape) {
      dispatch({ type: 'CANCEL_DELETE' });
    }
  }, { isActive: confirmActive });

  // Get board columns sorted
  const boardColumns = columns
    .filter(c => c.boardId === activeBoardId)
    .sort((a, b) => a.order - b.order);

  const boardTasks = tasks.filter(t => t.boardId === activeBoardId && !t.isDeleted);
  const activeBoard = boards.find(b => b.id === activeBoardId);
  const visibleBoards = boards.filter(b => !b.isDeleted);

  // Status bar text
  let statusText = '';
  if (!activeBoardId) {
    statusText = 'No board. Press M to open menu.';
  } else if (selectedTaskId) {
    statusText = '← → Move task | E Edit | D Delete | S Deselect';
  } else {
    statusText = '← → ↑ ↓ Navigate | S Select | E Edit | D Del Column | M Menu | Q Quit';
  }

  // Compute confirm delete message
  let confirmMessage = '';
  if (uiMode === 'confirm_delete') {
    if (pendingDelete === 'task' && selectedTaskId) {
      const task = tasks.find(t => t.id === selectedTaskId);
      confirmMessage = `Delete task "${task?.title}"?`;
    } else if (pendingDelete === 'column') {
      const col = boardColumns[focusedColumnIndex];
      confirmMessage = `Delete column "${col?.name}"?`;
    } else if (pendingDelete === 'board' && activeBoard) {
      confirmMessage = `Delete board "${activeBoard.name}"?`;
    }
  }

  // Compute initialValue for edit modals
  let modalInitialValue = '';
  if (uiMode === 'modal_edit_board' && activeBoard) {
    modalInitialValue = activeBoard.name;
  } else if (uiMode === 'modal_edit_column') {
    const col = boardColumns[focusedColumnIndex];
    modalInitialValue = col ? col.name : '';
  } else if (uiMode === 'modal_edit_task' && selectedTaskId) {
    const task = tasks.find(t => t.id === selectedTaskId);
    modalInitialValue = task ? task.title : '';
  }

  return (
    <Box flexDirection="column" width={stdout.columns} height={stdout.rows}>
      {/* Header */}
      <Box paddingX={1}>
        <Text bold color="cyan">
          TUITask
          {activeBoard ? ` - ${activeBoard.name}` : ''}
        </Text>
      </Box>

      {/* Board */}
      <Box flexGrow={1} flexDirection="column">
        {!activeBoardId ? (
          <Box justifyContent="center" paddingY={2}>
            <Text dimColor>No boards yet. Press M to create one.</Text>
          </Box>
        ) : (
          <BoardView
            columns={boardColumns}
            tasks={boardTasks}
            focusedColumnIndex={focusedColumnIndex}
            focusedTaskIndex={focusedTaskIndex}
            selectedTaskId={selectedTaskId}
          />
        )}
      </Box>

      {/* Notification */}
      {notification && (
        <Box paddingX={1}>
          <Text color="red">{notification}</Text>
        </Box>
      )}

      {/* Status bar */}
      <Box paddingX={1}>
        <Text dimColor>─ {statusText}</Text>
      </Box>

      {/* Overlays */}
      {uiMode === 'menu' && (
        <Box position="absolute" flexDirection="column" justifyContent="center" alignItems="center" width="100%" height="100%">
          <MenuOverlay
            hasBoards={visibleBoards.length > 0}
            dispatch={dispatch}
            isActive={uiMode === 'menu'}
          />
        </Box>
      )}

      {uiMode.startsWith('modal_') && (
        <Box position="absolute" flexDirection="column" justifyContent="center" alignItems="center" width="100%" height="100%">
          <ModalInput
            key={uiMode}
            mode={uiMode}
            dispatch={dispatch}
            isActive={uiMode.startsWith('modal_')}
            initialValue={modalInitialValue}
          />
        </Box>
      )}

      {uiMode === 'confirm_delete' && (
        <Box position="absolute" flexDirection="column" justifyContent="center" alignItems="center" width="100%" height="100%">
          <Box flexDirection="column" borderStyle="round" borderColor="red" paddingX={2} paddingY={1} alignSelf="center">
            <Text bold color="red">{confirmMessage}</Text>
            <Text> </Text>
            <Text><Text bold color="yellow">Y</Text> - Yes  <Text bold color="yellow">N</Text> - No</Text>
          </Box>
        </Box>
      )}

      {uiMode === 'board_switcher' && (
        <Box position="absolute" flexDirection="column" justifyContent="center" alignItems="center" width="100%" height="100%">
          <BoardSwitcher
            boards={visibleBoards}
            activeBoardId={activeBoardId}
            dispatch={dispatch}
            isActive={uiMode === 'board_switcher'}
          />
        </Box>
      )}
    </Box>
  );
}
