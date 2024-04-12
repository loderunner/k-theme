import type { Property } from 'csstype';
import type { CSSProperties } from 'react';

import './term.css';

export type Theme = {
  background: Property.Color;
  foreground: Property.Color;
  selection: Property.Color;
  selectedText: Property.Color;
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
  lightFontWeight: Property.FontWeight;
  normalFontWeight: Property.FontWeight;
  boldFontWeight: Property.FontWeight;
};

export const DefaultTheme: Theme = {
  background: '#586069',
  foreground: '#d1d5da',
  selection: '#959da5',
  selectedText: '#d1d5da',
  black: '#586069',
  red: '#ea4a5a',
  green: '#34d058',
  yellow: '#ffea7f',
  blue: '#2188ff',
  magenta: '#b392f0',
  cyan: '#39c5cf',
  white: '#d1d5da',
  brightBlack: '#959da5',
  brightRed: '#f97583',
  brightGreen: '#85e89d',
  brightYellow: '#ffea7f',
  brightBlue: '#79b8ff',
  brightMagenta: '#b392f0',
  brightCyan: '#56d4dd',
  brightWhite: '#fafbfc',
  lightFontWeight: 'lighter',
  normalFontWeight: 'normal',
  boldFontWeight: 'bold',
};

type Color =
  | 'default'
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'bright-black'
  | 'bright-red'
  | 'bright-green'
  | 'bright-yellow'
  | 'bright-blue'
  | 'bright-magenta'
  | 'bright-cyan'
  | 'bright-white'
  | { r: number; g: number; b: number };

type FontWeight = 'normal' | 'bold' | 'faint';
type FontVariant = 'normal' | 'italic';

type Rendering = {
  foreground: Color;
  background: Color;
  weight: FontWeight;
  variant: FontVariant;
};

type Span = {
  rendering: Rendering;
  text: string;
};

/**
 * Parses a string of text containing ANSI control sequences, and returns a list
 * of `Span`s for each sequence of similarly-rendered characters.
 * @param content
 * @returns
 */
function splitSpans(content: string): Span[] {
  let index = 0;
  const spans: Span[] = [];
  let rendering: Rendering = {
    foreground: 'default',
    background: 'default',
    weight: 'normal',
    variant: 'italic',
  };

  while (index >= 0 && index < content.length) {
    if (content[index] !== '\x1b') {
      // Not a control character
      const nextIndex = content.indexOf('\x1b', index);
      if (index === -1) {
        // Last span
        spans.push({
          rendering,
          text: content.slice(index),
        });
        break;
      }

      // Current span
      spans.push({
        rendering,
        text: content.slice(index, nextIndex),
      });
      index = nextIndex;
      continue;
    }

    // Is a control character
    index++;
    if (content[index] !== '[') {
      // not a control sequence start
      index++;
      continue;
    }

    // parse control sequence
    const nextIndex = index + content.slice(index).search(/[a-zA-Z]/);
    if (nextIndex === -1) {
      // unterminated control sequence
      break;
    }
    if (content[nextIndex] !== 'm') {
      // not a graphic rendition control sequence
      index = nextIndex + 1;
      continue;
    }
    rendering = {
      ...rendering,
      ...parseControlSequence(content.slice(index + 1, nextIndex)),
    };
    index = nextIndex + 1;
  }
  return spans;
}

function parseControlSequence(seq: string): Partial<Rendering> {
  let rendering: Partial<Rendering> = {};
  const codes = seq.split(';').map((s) => parseInt(s));
  let r = 0,
    g = 0,
    b = 0;
  let field: 'foreground' | 'background' = 'foreground';
  let parsing: 'code' | 'color-type' | 'ansi' | 'r' | 'g' | 'b' = 'code';
  for (let code of codes) {
    switch (parsing) {
      case 'color-type':
        switch (code) {
          case 2:
            parsing = 'r';
            break;
          case 5:
            parsing = 'ansi';
            break;
          default:
            parsing = 'code';
        }
        break;
      case 'ansi':
        if (code >= 16 && code < 232) {
          const r = Math.floor(code / 36);
          code = code % 36;
          const g = Math.floor(code / 6);
          const b = code % 6;
          rendering.foreground = { r: r * 51, g: g * 51, b: b * 51 };
        } else if (code < 256) {
          const v = Math.floor(((code - 232) * 255) / 24);
          rendering.foreground = { r: v, g: v, b: v };
        }
        parsing = 'code';
        break;
      case 'r':
        r = code;
        parsing = 'g';
        break;
      case 'g':
        g = code;
        parsing = 'b';
        break;
      case 'b':
        b = code;
        if (field === 'foreground') {
          rendering.foreground = { r, g, b };
        } else if (field === 'background') {
          rendering.background = { r, g, b };
        }
        parsing = 'code';
        break;
      case 'code':
        switch (code) {
          case 0:
            rendering = {
              foreground: 'default',
              background: 'default',
              weight: 'normal',
              variant: 'italic',
            };
            break;
          case 1:
            rendering.weight = 'bold';
            break;
          case 2:
            rendering.weight = 'faint';
            break;
          case 3:
            rendering.variant = 'italic';
            break;
          case 22:
            rendering.weight = 'normal';
            break;
          case 30:
            rendering.foreground = 'black';
            break;
          case 31:
            rendering.foreground = 'red';
            break;
          case 32:
            rendering.foreground = 'green';
            break;
          case 33:
            rendering.foreground = 'yellow';
            break;
          case 34:
            rendering.foreground = 'blue';
            break;
          case 35:
            rendering.foreground = 'magenta';
            break;
          case 36:
            rendering.foreground = 'cyan';
            break;
          case 37:
            rendering.foreground = 'white';
            break;
          case 38:
            field = 'foreground';
            parsing = 'color-type';
            break;
          case 39:
            rendering.foreground = 'default';
            break;
          case 40:
            rendering.background = 'black';
            break;
          case 41:
            rendering.background = 'red';
            break;
          case 42:
            rendering.background = 'green';
            break;
          case 43:
            rendering.background = 'yellow';
            break;
          case 44:
            rendering.background = 'blue';
            break;
          case 45:
            rendering.background = 'magenta';
            break;
          case 46:
            rendering.background = 'cyan';
            break;
          case 47:
            rendering.background = 'white';
            break;
          case 48:
            field = 'background';
            parsing = 'color-type';
            break;
          case 49:
            rendering.background = 'default';
            break;
          case 90:
            rendering.foreground = 'bright-black';
            break;
          case 91:
            rendering.foreground = 'bright-red';
            break;
          case 92:
            rendering.foreground = 'bright-green';
            break;
          case 93:
            rendering.foreground = 'bright-yellow';
            break;
          case 94:
            rendering.foreground = 'bright-blue';
            break;
          case 95:
            rendering.foreground = 'bright-magenta';
            break;
          case 96:
            rendering.foreground = 'bright-cyan';
            break;
          case 97:
            rendering.foreground = 'bright-white';
            break;
          case 100:
            rendering.background = 'bright-black';
            break;
          case 101:
            rendering.background = 'bright-red';
            break;
          case 102:
            rendering.background = 'bright-green';
            break;
          case 103:
            rendering.background = 'bright-yellow';
            break;
          case 104:
            rendering.background = 'bright-blue';
            break;
          case 105:
            rendering.background = 'bright-magenta';
            break;
          case 106:
            rendering.background = 'bright-cyan';
            break;
          case 107:
            rendering.background = 'bright-white';
            break;
        }
    }
  }
  return rendering;
}

function colorFromTheme(color: Color, theme: Theme) {
  switch (color) {
    case 'default':
      return theme.foreground;
    case 'black':
      return theme.black;
    case 'red':
      return theme.red;
    case 'green':
      return theme.green;
    case 'yellow':
      return theme.yellow;
    case 'blue':
      return theme.blue;
    case 'magenta':
      return theme.magenta;
    case 'cyan':
      return theme.cyan;
    case 'white':
      return theme.white;
    case 'bright-black':
      return theme.brightBlack;
    case 'bright-red':
      return theme.brightRed;
    case 'bright-green':
      return theme.brightGreen;
    case 'bright-yellow':
      return theme.brightYellow;
    case 'bright-blue':
      return theme.brightBlue;
    case 'bright-magenta':
      return theme.brightMagenta;
    case 'bright-cyan':
      return theme.brightCyan;
    case 'bright-white':
      return theme.brightWhite;
    default:
      return (
        '#' + color.r.toString(16) + color.g.toString(16) + color.b.toString(16)
      );
  }
}

function weightFromTheme(weight: FontWeight, theme: Theme) {
  switch (weight) {
    case 'normal':
      return theme.normalFontWeight;
    case 'bold':
      return theme.boldFontWeight;
    case 'faint':
      return theme.lightFontWeight;
  }
}

function styleFromRendering(rendering: Rendering, theme: Theme): CSSProperties {
  const color =
    rendering.foreground === 'default'
      ? theme.foreground
      : colorFromTheme(rendering.foreground, theme);
  const backgroundColor =
    rendering.background === 'default'
      ? theme.background
      : colorFromTheme(rendering.background, theme);
  const fontWeight = weightFromTheme(rendering.weight, theme);
  return {
    color,
    backgroundColor,
    fontWeight,
  };
}

export type Props = {
  content: string;
  theme?: Theme;
  className?: string;
  style?: CSSProperties;
};

export default function Term({
  content,
  theme = DefaultTheme,
  className,
  style = {},
}: Props) {
  const spans = splitSpans(content);
  return (
    <pre
      className={className}
      style={
        {
          ...style,
          color: theme.foreground,
          backgroundColor: theme.background,
          '--term-selection': theme.selection,
          '--term-selected-text': theme.selectedText,
        } as CSSProperties
      }
    >
      {spans.map((span, i) => (
        <span
          className="term-span"
          key={i}
          style={styleFromRendering(span.rendering, theme)}
        >
          {span.text}
        </span>
      ))}
    </pre>
  );
}

export function NoPre({ content, theme = DefaultTheme }: Props) {
  const spans = splitSpans(content);
  return (
    <>
      {spans.map((span, i) => (
        <span key={i} style={styleFromRendering(span.rendering, theme)}>
          {span.text}
        </span>
      ))}
    </>
  );
}
