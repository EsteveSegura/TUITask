import React from 'react';
import { Box, Text } from 'ink';
import ColumnBox from './ColumnBox.js';

export default function BoardView({ columns, tasks, focusedColumnIndex, focusedTaskIndex, selectedTaskId }) {
  if (columns.length === 0) {
    return (
      <Box justifyContent="center" paddingY={2}>
        <Text dimColor>No columns yet. Press M to open menu and create one.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="row" flexGrow={1}>
      {columns.map((col, idx) => {
        const colTasks = tasks.filter(t => t.columnId === col.id);
        return (
          <ColumnBox
            key={col.id}
            column={col}
            tasks={colTasks}
            isFocused={idx === focusedColumnIndex}
            focusedTaskIndex={focusedTaskIndex}
            selectedTaskId={selectedTaskId}
          />
        );
      })}
    </Box>
  );
}
