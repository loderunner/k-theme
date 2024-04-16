import { useFloating } from '@floating-ui/react-dom';
import { Popover } from '@headlessui/react';
import clsx from 'clsx';
import { useCallback, useState } from 'react';

import type { APITheme, ColorScheme } from './Theme';
import type { Property } from 'csstype';
import type { MouseEventHandler } from 'react';

type Props = {
  theme: APITheme;
  scheme: ColorScheme;
  className?: string;
};

const colors: (keyof APITheme)[] = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'brightBlack',
  'brightRed',
  'brightGreen',
  'brightYellow',
  'brightBlue',
  'brightMagenta',
  'brightCyan',
  'brightWhite',
];

const colorNames = [
  'Black',
  'Red',
  'Green',
  'Yellow',
  'Blue',
  'Magenta',
  'Cyan',
  'White',
  'Bright Black',
  'Bright Red',
  'Bright Green',
  'Bright Yellow',
  'Bright Blue',
  'Bright Magenta',
  'Bright Cyan',
  'Bright White',
];

function Swatch({
  color,
  backgroundColor,
  foregroundColor,
  brightForegroundColor,
  i,
}: {
  color: Property.Color;
  backgroundColor: Property.Color;
  foregroundColor: Property.Color;
  brightForegroundColor: Property.Color;
  i: number;
}) {
  const [mouseOver, setMouseOver] = useState(false);
  const onMouseOver = useCallback<MouseEventHandler<HTMLButtonElement>>(
    () => setMouseOver(true),
    [],
  );
  const onMouseOut = useCallback<MouseEventHandler<HTMLButtonElement>>(
    () => setMouseOver(false),
    [],
  );
  const { refs, floatingStyles } = useFloating();
  return (
    <Popover className="aspect-square flex-1">
      {({ open }) => (
        <>
          <Popover.Button
            ref={refs.setReference}
            className="h-full w-full"
            style={{ backgroundColor: color }}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
          />
          {(open || mouseOver) && (
            <Popover.Panel
              static
              ref={refs.setFloating}
              className="z-10 flex flex-col items-center"
              style={floatingStyles}
            >
              <div
                className="border-b-8 border-l-8 border-r-8 border-l-transparent border-r-transparent"
                style={{ borderBottomColor: backgroundColor }}
              />
              <div
                className={clsx(
                  'flex',
                  'w-fit',
                  'flex-col',
                  'items-center',
                  'rounded-lg',
                  'py-6',
                  'px-9',
                  'shadow-2xl',
                )}
                style={{ backgroundColor }}
              >
                <div
                  className="mb-1 text-center text-sm"
                  style={{ color: foregroundColor }}
                >
                  Ansi Color {i}
                </div>
                <div
                  className="mb-2 text-center font-bold"
                  style={{ color: brightForegroundColor }}
                >
                  {colorNames[i]}
                </div>
                <div
                  className="text-center font-mono text-sm"
                  style={{ color: foregroundColor }}
                >
                  {color}
                </div>
              </div>
            </Popover.Panel>
          )}
        </>
      )}
    </Popover>
  );
}

export default function Palette({ theme, scheme, className }: Props) {
  return (
    <div className={clsx(className, 'flex')}>
      {colors.map((c, i) => (
        <Swatch
          key={colorNames[i]}
          color={theme[c]}
          backgroundColor={scheme === 'light' ? theme.black : theme.brightWhite}
          foregroundColor={scheme === 'light' ? theme.white : theme.brightBlack}
          brightForegroundColor={
            scheme === 'light' ? theme.brightWhite : theme.black
          }
          i={i}
        />
      ))}
    </div>
  );
}
