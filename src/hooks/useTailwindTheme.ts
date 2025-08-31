import { useMemo } from 'react';
import { customTheme } from 'tailwind.config';

export function useTailwindTheme() {
  return useMemo(() => customTheme, []);
}
