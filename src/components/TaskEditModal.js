import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';

export default function TaskEditModal({ mode, dispatch, isActive, initialTitle, initialDescription }) {
  const [title, setTitle] = useState(initialTitle || '');
  const [description, setDescription] = useState(initialDescription || '');
  const [focusField, setFocusField] = useState('title');

  const isEdit = mode === 'modal_edit_task';
  const label = isEdit ? 'Edit Task' : 'New Task';

  useInput((input, key) => {
    if (!isActive) return;
    if (key.escape) {
      dispatch({ type: 'CLOSE_MODAL' });
    } else if (key.tab) {
      setFocusField(f => f === 'title' ? 'description' : 'title');
    }
  }, { isActive });

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      dispatch({ type: 'CLOSE_MODAL' });
      return;
    }
    if (isEdit) {
      dispatch({ type: 'EDIT_TASK', title: trimmedTitle, description: description.trim() });
    } else {
      dispatch({ type: 'CREATE_TASK', title: trimmedTitle, description: description.trim() });
    }
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="magenta"
      paddingX={2}
      paddingY={1}
      alignSelf="center"
      width={50}
    >
      <Text bold color="magenta">{label}</Text>

      <Box marginTop={1} flexDirection="column">
        <Text bold color={focusField === 'title' ? 'cyan' : 'white'}>Title:</Text>
        <Box>
          <TextInput
            value={title}
            onChange={setTitle}
            onSubmit={handleSubmit}
            focus={isActive && focusField === 'title'}
          />
        </Box>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text bold color={focusField === 'description' ? 'cyan' : 'white'}>Description:</Text>
        <Box>
          <TextInput
            value={description}
            onChange={setDescription}
            onSubmit={handleSubmit}
            focus={isActive && focusField === 'description'}
          />
        </Box>
      </Box>

      <Text dimColor marginTop={1}>Tab to switch fields, Enter to confirm, Esc to cancel</Text>
    </Box>
  );
}
