import React from 'react';
import { Box, Text } from 'ink';
import TaskCard from './TaskCard.js';

export default function ColumnBox({ column, tasks, isFocused, focusedTaskIndex, selectedTaskId }) {
  const borderColor = isFocused ? 'blue' : 'gray';
  const borderStyle = isFocused ? 'double' : 'single';

  return (
    <Box
      flexDirection="column"
      flexGrow={1}
      borderStyle={borderStyle}
      borderColor={borderColor}
      paddingX={1}
    >
      <Text bold underline>{column.name}</Text>
      <Box flexDirection="column" marginTop={1}>
        {tasks.length === 0 ? (
          <Text dimColor>(empty)</Text>
        ) : (
          tasks.map((task, idx) => (
            <TaskCard
              key={task.id}
              title={task.title}
              isFocused={isFocused && idx === focusedTaskIndex}
              isSelected={task.id === selectedTaskId}
            />
          ))
        )}
      </Box>
    </Box>
  );
}
