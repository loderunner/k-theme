import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';

import terminalOutput from '~/assets/terminal-output';
import Palette from '~/components/Palette';
import Term from '~/components/Term';

import type { CSSProperties, MouseEventHandler } from 'react';
import type { Theme } from '~/components/Term';

import './theme.css';

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
    background: scheme === 'light' ? theme.brightWhite : theme.black,
    foreground: scheme === 'light' ? theme.black : theme.white,
    selection: scheme === 'light' ? theme.white : theme.brightBlack,
    selectedText: scheme === 'light' ? theme.black : theme.white,
    lightFontWeight: 'lighter',
    normalFontWeight: 'normal',
    boldFontWeight: 'bold',
  };
}

type Props = {
  theme: APITheme;
};

function LightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className ?? ''}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
      />
    </svg>
  );
}

function DarkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className ?? ''}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
      />
    </svg>
  );
}

export default function Theme({ theme }: Props) {
  const [scheme, setScheme] = useState<ColorScheme>('light');
  const Icon = useMemo(
    () => (scheme === 'light' ? LightIcon : DarkIcon),
    [scheme],
  );
  const onClickSchemeButton = useCallback<MouseEventHandler<HTMLButtonElement>>(
    () => setScheme(scheme === 'light' ? 'dark' : 'light'),
    [scheme],
  );
  const termTheme = useMemo(() => apiToTerm(theme, scheme), [scheme, theme]);

  return (
    <>
      <Palette theme={theme} />
      <div
        className="m-8 overflow-clip rounded-xl shadow-2xl shadow-gray-800"
        style={{ backgroundColor: termTheme.background }}
      >
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex">
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
          <button
            className="scheme-button h-6 w-6 rounded-full p-1"
            style={
              {
                borderColor: termTheme.foreground,
                '--theme-scheme-button-color': termTheme.foreground,
                '--theme-scheme-button-hover-color': termTheme.background,
              } as CSSProperties
            }
            onClick={onClickSchemeButton}
          >
            <Icon />
          </button>
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
