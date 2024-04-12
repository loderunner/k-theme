import clsx from 'clsx';

import terminalOutput from '~/assets/terminal-output';
import Palette from '~/components/Palette';
import Term from '~/components/Term';

import type { Theme } from '~/components/Term';

export type ColorScheme = 'light' | 'dark';

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

function apiToTerm(theme: APITheme, scheme: ColorScheme): Theme {
  return {
    ...theme,
    background: scheme === 'light' ? theme.white : theme.black,
    foreground: scheme === 'light' ? theme.black : theme.white,
    selection: scheme === 'light' ? theme.brightWhite : theme.brightBlack,
    selectedText: scheme === 'light' ? theme.black : theme.white,
    lightFontWeight: 'lighter',
    normalFontWeight: 'normal',
    boldFontWeight: 'bold',
  };
}

type Props = {
  theme: APITheme;
  scheme: ColorScheme;
};

export default function Theme({ theme, scheme }: Props) {
  const termTheme = apiToTerm(theme, scheme);

  return (
    <>
      <Palette theme={theme} />
      <div
        className="m-8 overflow-clip rounded-xl shadow-2xl shadow-gray-800"
        style={{ backgroundColor: termTheme.background }}
      >
        <div className="flex items-start p-3">
          <div
            className={clsx(
              'mr-2',
              'h-3',
              'w-3',
              'rounded-full',
              scheme === 'light' ? 'bg-red-600' : 'bg-red-400',
            )}
          />
          <div
            className={clsx(
              'mr-2',
              'h-3',
              'w-3',
              'rounded-full',
              scheme === 'light' ? 'bg-yellow-500' : 'bg-yellow-400',
            )}
          />
          <div
            className={clsx(
              'mr-2',
              'h-3',
              'w-3',
              'rounded-full',
              scheme === 'light' ? 'bg-green-500' : 'bg-green-400',
            )}
          />
        </div>
        <Term
          className="mx-2 aspect-[4/3] overflow-scroll pb-2 text-xs"
          content={terminalOutput}
          theme={termTheme}
        />
      </div>
    </>
  );
}
