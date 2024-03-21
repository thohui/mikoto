import { chakra } from '@chakra-ui/react';

export const Tooltip = chakra('div', {
  baseStyle: {
    color: 'white',
    backgroundColor: 'gray.900',
    borderRadius: '4px',
    padding: '6px 8px',
    fontWeight: '600',
    fontSize: '14px',
    boxShadow: 'rgba(0, 0, 0, 0.2) 0 8px 24px',
  },
});
