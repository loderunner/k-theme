import terminalOutput from '~/assets/terminal-output';
import Palette from '~/components/Palette';
import Term from '~/components/Term';

import type { Theme } from '~/components/Term';

export type APITheme = {
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
};

function apiToTerm(
  theme: APITheme,
  lightOrDark: 'light' | 'dark' = 'light',
): Theme {
  return {
    ...theme,
    background: lightOrDark === 'light' ? theme.white : theme.black,
    foreground: lightOrDark === 'light' ? theme.black : theme.white,
    lightFontWeight: 'lighter',
    normalFontWeight: 'normal',
    boldFontWeight: 'bold',
  };
}

type Props = {
  theme: APITheme;
};

export default function Theme({ theme }: Props) {
  return (
    <>
      <Palette theme={theme} />
      <Term
        className="text-sm"
        content={terminalOutput}
        theme={apiToTerm(theme, 'dark')}
      />
    </>
  );
}
