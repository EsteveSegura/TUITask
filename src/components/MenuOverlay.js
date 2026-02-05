import React from 'react';
import { Box, Text, useInput } from 'ink';

export default function MenuOverlay({ hasBoards, dispatch, isActive }) {
  useInput((input, key) => {
    if (!isActive) return;
    const ch = input.toUpperCase();
    if (ch === 'B') {
      dispatch({ type: 'OPEN_MODAL', mode: 'modal_board' });
    } else if (ch === 'C') {
      dispatch({ type: 'OPEN_MODAL', mode: 'modal_column' });
    } else if (ch === 'T') {
      dispatch({ type: 'OPEN_MODAL', mode: 'modal_task' });
    } else if (ch === 'E' && hasBoards) {
      dispatch({ type: 'OPEN_MODAL', mode: 'modal_edit_board' });
    } else if (ch === 'D' && hasBoards) {
      dispatch({ type: 'REQUEST_DELETE', deleteType: 'board' });
    } else if (ch === 'S' && hasBoards) {
      dispatch({ type: 'OPEN_BOARD_SWITCHER' });
    } else if (ch === 'Q' || key.escape) {
      dispatch({ type: 'CLOSE_MENU' });
    }
  }, { isActive });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
      alignSelf="center"
    >
      <Text bold color="cyan">── Menu ──</Text>
      <Text> </Text>
      <Text><Text bold color="yellow">B</Text> - New Board</Text>
      <Text><Text bold color="yellow">C</Text> - New Column</Text>
      <Text><Text bold color="yellow">T</Text> - New Task</Text>
      {hasBoards && (
        <Text><Text bold color="yellow">E</Text> - Edit Board</Text>
      )}
      {hasBoards && (
        <Text><Text bold color="yellow">D</Text> - Delete Board</Text>
      )}
      {hasBoards && (
        <Text><Text bold color="yellow">S</Text> - Switch Board</Text>
      )}
      <Text> </Text>
      <Text><Text bold color="yellow">Q</Text> - Close Menu</Text>
    </Box>
  );
}
