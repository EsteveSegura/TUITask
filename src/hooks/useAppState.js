import { useReducer } from 'react';
import Board from '../models/Board.js';
import Column from '../models/Column.js';
import Task from '../models/Task.js';

// Helper: get active (non-deleted) tasks
function activeTasks(tasks) {
  return tasks.filter(t => !t.isDeleted);
}

function reducer(state, action) {
  // Clear notification on any action except CLEAR_NOTIFICATION itself
  const base = action.type !== 'CLEAR_NOTIFICATION'
    ? { ...state, notification: null }
    : state;

  switch (action.type) {
    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: null };

    case 'CREATE_BOARD': {
      const board = new Board(action.name);
      const boards = [...base.boards, board];
      return {
        ...base,
        boards,
        activeBoardId: board.id,
        focusedColumnIndex: 0,
        focusedTaskIndex: 0,
        selectedTaskId: null,
        uiMode: 'board',
      };
    }

    case 'CREATE_COLUMN': {
      const { activeBoardId, columns } = base;
      if (!activeBoardId) return base;
      const boardCols = columns.filter(c => c.boardId === activeBoardId);
      const maxOrder = boardCols.length > 0
        ? Math.max(...boardCols.map(c => c.order))
        : -1;
      const isInitial = boardCols.length === 0;
      const col = new Column(action.name, activeBoardId, maxOrder + 1, isInitial);
      return {
        ...base,
        columns: [...columns, col],
        uiMode: 'board',
      };
    }

    case 'CREATE_TASK': {
      const { activeBoardId, columns } = base;
      if (!activeBoardId) return base;
      const initialCol = columns.find(
        c => c.boardId === activeBoardId && c.isInitial
      );
      if (!initialCol) return base;
      const task = new Task(action.title, activeBoardId, initialCol.id, action.description || '');
      return {
        ...base,
        tasks: [...base.tasks, task],
        uiMode: 'board',
      };
    }

    case 'NAVIGATE': {
      const { direction } = action;
      const { activeBoardId, columns, tasks, focusedColumnIndex, focusedTaskIndex } = base;
      const boardCols = columns
        .filter(c => c.boardId === activeBoardId)
        .sort((a, b) => a.order - b.order);

      if (boardCols.length === 0) return base;

      let newColIdx = focusedColumnIndex;
      let newTaskIdx = focusedTaskIndex;

      if (direction === 'left') {
        newColIdx = Math.max(0, focusedColumnIndex - 1);
        const col = boardCols[newColIdx];
        const colTasks = activeTasks(tasks).filter(t => t.columnId === col.id);
        newTaskIdx = Math.min(focusedTaskIndex, Math.max(0, colTasks.length - 1));
      } else if (direction === 'right') {
        newColIdx = Math.min(boardCols.length - 1, focusedColumnIndex + 1);
        const col = boardCols[newColIdx];
        const colTasks = activeTasks(tasks).filter(t => t.columnId === col.id);
        newTaskIdx = Math.min(focusedTaskIndex, Math.max(0, colTasks.length - 1));
      } else if (direction === 'up') {
        newTaskIdx = Math.max(0, focusedTaskIndex - 1);
      } else if (direction === 'down') {
        const col = boardCols[focusedColumnIndex];
        if (col) {
          const colTasks = activeTasks(tasks).filter(t => t.columnId === col.id);
          newTaskIdx = Math.min(colTasks.length - 1, focusedTaskIndex + 1);
          newTaskIdx = Math.max(0, newTaskIdx);
        }
      }

      return {
        ...base,
        focusedColumnIndex: newColIdx,
        focusedTaskIndex: newTaskIdx,
      };
    }

    case 'SELECT_TASK': {
      const { activeBoardId, columns, tasks, focusedColumnIndex, focusedTaskIndex } = base;
      const boardCols = columns
        .filter(c => c.boardId === activeBoardId)
        .sort((a, b) => a.order - b.order);
      const col = boardCols[focusedColumnIndex];
      if (!col) return base;
      const colTasks = activeTasks(tasks).filter(t => t.columnId === col.id);
      const task = colTasks[focusedTaskIndex];
      if (!task) return base;
      return { ...base, selectedTaskId: task.id };
    }

    case 'DESELECT_TASK': {
      return { ...base, selectedTaskId: null };
    }

    case 'MOVE_TASK': {
      const { direction } = action;
      const { selectedTaskId, columns, tasks, activeBoardId, focusedColumnIndex } = base;
      if (!selectedTaskId) return base;

      const boardCols = columns
        .filter(c => c.boardId === activeBoardId)
        .sort((a, b) => a.order - b.order);

      let targetColIdx;
      if (direction === 'left') {
        targetColIdx = focusedColumnIndex - 1;
      } else if (direction === 'right') {
        targetColIdx = focusedColumnIndex + 1;
      } else {
        return base;
      }

      if (targetColIdx < 0 || targetColIdx >= boardCols.length) return base;

      const targetCol = boardCols[targetColIdx];
      const updatedTasks = tasks.map(t => {
        if (t.id === selectedTaskId) {
          const clone = Task.fromJSON({ ...t.toJSON(), updatedAt: new Date().toISOString() });
          clone.moveTo(targetCol.id);
          return clone;
        }
        return t;
      });

      const targetColTasks = activeTasks(updatedTasks).filter(t => t.columnId === targetCol.id);
      const movedTaskIdx = targetColTasks.findIndex(t => t.id === selectedTaskId);

      return {
        ...base,
        tasks: updatedTasks,
        focusedColumnIndex: targetColIdx,
        focusedTaskIndex: movedTaskIdx >= 0 ? movedTaskIdx : 0,
      };
    }

    case 'REQUEST_DELETE': {
      const { deleteType } = action;

      // For columns, check upfront if it has tasks
      if (deleteType === 'column') {
        const { activeBoardId, columns, tasks, focusedColumnIndex } = base;
        const boardCols = columns
          .filter(c => c.boardId === activeBoardId)
          .sort((a, b) => a.order - b.order);
        const col = boardCols[focusedColumnIndex];
        if (!col) return base;
        const colTasks = activeTasks(tasks).filter(t => t.columnId === col.id);
        if (colTasks.length > 0) {
          return {
            ...base,
            notification: `Cannot delete "${col.name}": column has ${colTasks.length} task${colTasks.length > 1 ? 's' : ''}. Move or delete them first.`,
          };
        }
      }

      return {
        ...base,
        pendingDelete: deleteType,
        uiMode: 'confirm_delete',
      };
    }

    case 'CONFIRM_DELETE': {
      const { pendingDelete } = base;
      if (!pendingDelete) return { ...base, uiMode: 'board' };

      if (pendingDelete === 'task') {
        const { selectedTaskId, tasks, columns, activeBoardId, focusedColumnIndex, focusedTaskIndex } = base;
        if (!selectedTaskId) return { ...base, pendingDelete: null, uiMode: 'board' };
        const updatedTasks = tasks.map(t =>
          t.id === selectedTaskId
            ? Task.fromJSON({ ...t.toJSON(), isDeleted: true })
            : t
        );
        const boardCols = columns
          .filter(c => c.boardId === activeBoardId)
          .sort((a, b) => a.order - b.order);
        const col = boardCols[focusedColumnIndex];
        let newTaskIdx = focusedTaskIndex;
        if (col) {
          const remaining = activeTasks(updatedTasks).filter(t => t.columnId === col.id);
          newTaskIdx = Math.min(focusedTaskIndex, Math.max(0, remaining.length - 1));
        }
        return {
          ...base,
          tasks: updatedTasks,
          selectedTaskId: null,
          focusedTaskIndex: newTaskIdx,
          pendingDelete: null,
          uiMode: 'board',
        };
      }

      if (pendingDelete === 'column') {
        const { activeBoardId, columns, focusedColumnIndex } = base;
        const boardCols = columns
          .filter(c => c.boardId === activeBoardId)
          .sort((a, b) => a.order - b.order);
        const col = boardCols[focusedColumnIndex];
        if (!col) return { ...base, pendingDelete: null, uiMode: 'board' };

        const updatedColumns = columns.filter(c => c.id !== col.id);
        const remainingBoardCols = updatedColumns.filter(c => c.boardId === activeBoardId);
        if (col.isInitial && remainingBoardCols.length > 0) {
          const first = remainingBoardCols.sort((a, b) => a.order - b.order)[0];
          const idx = updatedColumns.findIndex(c => c.id === first.id);
          updatedColumns[idx] = Column.fromJSON({ ...first.toJSON(), isInitial: true });
        }
        const newColIdx = Math.min(focusedColumnIndex, Math.max(0, remainingBoardCols.length - 1));
        return {
          ...base,
          columns: updatedColumns,
          focusedColumnIndex: newColIdx,
          focusedTaskIndex: 0,
          pendingDelete: null,
          uiMode: 'board',
        };
      }

      if (pendingDelete === 'board') {
        const { activeBoardId, boards } = base;
        if (!activeBoardId) return { ...base, pendingDelete: null, uiMode: 'board' };
        const updatedBoards = boards.map(b =>
          b.id === activeBoardId
            ? Board.fromJSON({ ...b.toJSON(), isDeleted: true })
            : b
        );
        const remaining = updatedBoards.filter(b => !b.isDeleted);
        const nextBoard = remaining[0] || null;
        return {
          ...base,
          boards: updatedBoards,
          activeBoardId: nextBoard ? nextBoard.id : null,
          focusedColumnIndex: 0,
          focusedTaskIndex: 0,
          selectedTaskId: null,
          pendingDelete: null,
          uiMode: 'board',
        };
      }

      return { ...base, pendingDelete: null, uiMode: 'board' };
    }

    case 'CANCEL_DELETE': {
      return { ...base, pendingDelete: null, uiMode: 'board' };
    }

    case 'EDIT_BOARD': {
      const { activeBoardId } = base;
      if (!activeBoardId) return base;
      return {
        ...base,
        boards: base.boards.map(b =>
          b.id === activeBoardId
            ? Board.fromJSON({ ...b.toJSON(), name: action.name })
            : b
        ),
        uiMode: 'board',
      };
    }

    case 'EDIT_COLUMN': {
      const { activeBoardId, columns, focusedColumnIndex } = base;
      const boardCols = columns
        .filter(c => c.boardId === activeBoardId)
        .sort((a, b) => a.order - b.order);
      const col = boardCols[focusedColumnIndex];
      if (!col) return base;
      return {
        ...base,
        columns: columns.map(c =>
          c.id === col.id
            ? Column.fromJSON({ ...c.toJSON(), name: action.name })
            : c
        ),
        uiMode: 'board',
      };
    }

    case 'EDIT_TASK': {
      const { selectedTaskId } = base;
      if (!selectedTaskId) return base;
      return {
        ...base,
        tasks: base.tasks.map(t =>
          t.id === selectedTaskId
            ? Task.fromJSON({
                ...t.toJSON(),
                title: action.title,
                description: action.description !== undefined ? action.description : t.description,
                updatedAt: new Date().toISOString(),
              })
            : t
        ),
        selectedTaskId: null,
        uiMode: 'board',
      };
    }

    case 'OPEN_MENU':
      return { ...base, uiMode: 'menu' };

    case 'CLOSE_MENU':
      return { ...base, uiMode: 'board' };

    case 'OPEN_MODAL':
      return { ...base, uiMode: action.mode };

    case 'CLOSE_MODAL':
      return { ...base, uiMode: 'board' };

    case 'OPEN_BOARD_SWITCHER':
      return { ...base, uiMode: 'board_switcher' };

    case 'SWITCH_BOARD': {
      return {
        ...base,
        activeBoardId: action.boardId,
        focusedColumnIndex: 0,
        focusedTaskIndex: 0,
        selectedTaskId: null,
        uiMode: 'board',
      };
    }

    default:
      return base;
  }
}

export default function useAppState(initialData) {
  const activeBoards = initialData.boards.filter(b => !b.isDeleted);
  const firstBoard = activeBoards[0] || null;
  const initialState = {
    boards: initialData.boards,
    columns: initialData.columns,
    tasks: initialData.tasks,
    activeBoardId: firstBoard ? firstBoard.id : null,
    focusedColumnIndex: 0,
    focusedTaskIndex: 0,
    selectedTaskId: null,
    uiMode: 'board',
    notification: null,
    pendingDelete: null,
  };

  return useReducer(reducer, initialState);
}
