import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

export default function BoardSwitcher({ boards, activeBoardId, dispatch, isActive }) {
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const idx = boards.findIndex(b => b.id === activeBoardId);
    return idx >= 0 ? idx : 0;
  });

  useInput((input, key) => {
    if (!isActive) return;

    if (key.upArrow) {
      setSelectedIndex(i => Math.max(0, i - 1));
    } else if (key.downArrow) {
      setSelectedIndex(i => Math.min(boards.length - 1, i + 1));
    } else if (key.return) {
      dispatch({ type: 'SWITCH_BOARD', boardId: boards[selectedIndex].id });
    } else if (input.toUpperCase() === 'Q' || key.escape) {
      dispatch({ type: 'CLOSE_MENU' });
    }
  }, { isActive });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="green"
      paddingX={2}
      paddingY={1}
      alignSelf="center"
    >
      <Text bold color="green">── Switch Board ──</Text>
      <Text> </Text>
      {boards.map((board, idx) => {
        const pointer = idx === selectedIndex ? '>' : ' ';
        const isActive = board.id === activeBoardId;
        return (
          <Text key={board.id}>
            <Text color={idx === selectedIndex ? 'yellow' : undefined}>
              {pointer} {board.name}
            </Text>
            {isActive ? <Text dimColor> (current)</Text> : null}
          </Text>
        );
      })}
      <Text> </Text>
      <Text dimColor>↑↓ Navigate, Enter Select, Q/Esc Back</Text>
    </Box>
  );
}
