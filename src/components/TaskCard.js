import React from 'react';
import { Box, Text } from 'ink';

export default function TaskCard({ title, isFocused, isSelected }) {
  let borderColor = undefined;
  let borderStyle = 'single';
  let prefix = '  ';

  if (isSelected) {
    borderColor = 'green';
    borderStyle = 'bold';
    prefix = '>> ';
  } else if (isFocused) {
    borderColor = 'yellow';
  }

  return (
    <Box borderStyle={borderStyle} borderColor={borderColor} paddingX={1}>
      <Text>{prefix}{title}</Text>
    </Box>
  );
}
