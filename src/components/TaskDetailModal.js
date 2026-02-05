import React from 'react';
import { Box, Text, useInput } from 'ink';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

export default function TaskDetailModal({ task, dispatch, isActive }) {
  useInput((input, key) => {
    if (!isActive) return;
    if (input.toUpperCase() === 'Q' || key.escape) {
      dispatch({ type: 'CLOSE_MODAL' });
    }
  }, { isActive });

  if (!task) return null;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
      alignSelf="center"
      width={56}
    >
      <Text bold color="cyan">Task Detail</Text>

      <Box marginTop={1} flexDirection="column">
        <Text bold>Title:</Text>
        <Text>  {task.title}</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text bold>Description:</Text>
        <Text>  {task.description || '(none)'}</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text dimColor>Created: {formatDate(task.createdAt)}</Text>
        <Text dimColor>Updated: {formatDate(task.updatedAt)}</Text>
      </Box>

      <Text dimColor marginTop={1}>Q or Esc to close</Text>
    </Box>
  );
}
