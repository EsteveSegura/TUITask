import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';

const LABELS = {
  modal_board: 'New Board name',
  modal_column: 'New Column name',
  modal_task: 'New Task title',
  modal_edit_board: 'Edit Board name',
  modal_edit_column: 'Edit Column name',
  modal_edit_task: 'Edit Task title',
};

const PAYLOADS = {
  modal_board: (val) => ({ type: 'CREATE_BOARD', name: val }),
  modal_column: (val) => ({ type: 'CREATE_COLUMN', name: val }),
  modal_task: (val) => ({ type: 'CREATE_TASK', title: val }),
  modal_edit_board: (val) => ({ type: 'EDIT_BOARD', name: val }),
  modal_edit_column: (val) => ({ type: 'EDIT_COLUMN', name: val }),
  modal_edit_task: (val) => ({ type: 'EDIT_TASK', title: val }),
};

export default function ModalInput({ mode, dispatch, isActive, initialValue }) {
  const [value, setValue] = useState(initialValue || '');

  useInput((input, key) => {
    if (!isActive) return;
    if (key.escape) {
      dispatch({ type: 'CLOSE_MODAL' });
    }
  }, { isActive });

  const handleSubmit = (val) => {
    const trimmed = val.trim();
    if (trimmed) {
      dispatch(PAYLOADS[mode](trimmed));
    } else {
      dispatch({ type: 'CLOSE_MODAL' });
    }
  };

  const label = LABELS[mode] || 'Input';

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="magenta"
      paddingX={2}
      paddingY={1}
      alignSelf="center"
    >
      <Text bold color="magenta">{label}:</Text>
      <Box marginTop={1}>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          focus={isActive}
        />
      </Box>
      <Text dimColor marginTop={1}>Enter to confirm, Esc to cancel</Text>
    </Box>
  );
}
