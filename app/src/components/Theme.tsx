import { Menu } from '@headlessui/react';
import { ChevronDownIcon, MoonIcon, SunIcon } from '@heroicons/react/16/solid';
import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';

import terminalOutput from '~/assets/terminal-output';
import Palette from '~/components/Palette';
import Term from '~/components/Term';

import type { Property } from 'csstype';
import type { CSSProperties, MouseEventHandler } from 'react';
import type { Theme } from '~/components/Term';

import './theme.css';

export type ColorScheme = 'light' | 'dark';

export type APITheme = {
  black: Property.Color;
  red: Property.Color;
  green: Property.Color;
  yellow: Property.Color;
  blue: Property.Color;
  magenta: Property.Color;
  cyan: Property.Color;
  white: Property.Color;
  brightBlack: Property.Color;
  brightRed: Property.Color;
  brightGreen: Property.Color;
  brightYellow: Property.Color;
  brightBlue: Property.Color;
  brightMagenta: Property.Color;
  brightCyan: Property.Color;
  brightWhite: Property.Color;
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
  themes: Record<string, Record<ColorScheme, APITheme>>;
};

export default function Theme({ themes }: Props) {
  const [space, setSpace] = useState<string>('hsl');

  const [scheme, setScheme] = useState<ColorScheme>('light');
  const SchemeIcon = useMemo(
    () => (scheme === 'light' ? SunIcon : MoonIcon),
    [scheme],
  );
  const onClickSchemeButton = useCallback<MouseEventHandler<HTMLButtonElement>>(
    () => setScheme(scheme === 'light' ? 'dark' : 'light'),
    [scheme],
  );

  const termTheme = useMemo(
    () => apiToTerm(themes[space][scheme], scheme),
    [scheme, themes, space],
  );

  const menuItems = useMemo(
    () =>
      Object.keys(themes).map((s) => (
        <Menu.Item
          key={s}
          as="button"
          className="scheme-button px-2 py-1 text-xs"
          style={
            {
              '--theme-scheme-button-color': termTheme.white,
              '--theme-scheme-button-hover-color': termTheme.background,
            } as CSSProperties
          }
          onClick={() => setSpace(s)}
        >
          {s}
        </Menu.Item>
      )),
    [termTheme.background, termTheme.white, themes],
  );

  return (
    <>
      <Palette theme={themes[space][scheme]} scheme={scheme} />
      <div
        className="m-8 overflow-clip rounded-xl shadow-2xl shadow-gray-800"
        style={{ backgroundColor: termTheme.background }}
      >
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center">
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
          <div className="flex items-center">
            <Menu as="div" className="relative mr-2 inline-block">
              <Menu.Button
                className="scheme-button inline-flex h-6 min-w-16 items-stretch justify-end rounded-md px-2 py-1 text-xs ring-1"
                style={
                  {
                    '--tw-ring-color': termTheme.white,
                    '--theme-scheme-button-color': termTheme.white,
                    '--theme-scheme-button-hover-color': termTheme.background,
                  } as CSSProperties
                }
              >
                <span className="px-1">{space}</span>
                <ChevronDownIcon />
              </Menu.Button>
              <Menu.Items
                className="absolute right-0 mt-2 flex w-full origin-top-right flex-col overflow-clip rounded-md ring-1"
                style={
                  {
                    '--tw-ring-color': termTheme.white,
                  } as CSSProperties
                }
              >
                {menuItems}
              </Menu.Items>
            </Menu>
            <button
              className="scheme-button h-6 w-6 rounded-full p-1"
              style={
                {
                  '--theme-scheme-button-color': termTheme.white,
                  '--theme-scheme-button-hover-color': termTheme.background,
                } as CSSProperties
              }
              onClick={onClickSchemeButton}
            >
              <SchemeIcon />
            </button>
          </div>
        </div>
        <Term
          className="mx-2 aspect-[4/3] overflow-scroll pb-2 text-xxs md:text-xs"
          content={terminalOutput}
          theme={termTheme}
        />
      </div>
    </>
  );
}
