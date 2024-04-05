type Props = {
  theme: Record<string, string>;
  className?: string;
};

const colors = [
  'black',
  'blue',
  'brightBlack',
  'brightBlue',
  'brightCyan',
  'brightGreen',
  'brightMagenta',
  'brightRed',
  'brightWhite',
  'brightYellow',
  'cyan',
  'green',
  'magenta',
  'red',
  'white',
  'yellow',
];

export default function Palette({ theme, className }: Props) {
  return (
    <div className={`${className ?? ''} flex`}>
      {colors.map((c) => (
        <div
          className="aspect-square flex-1"
          style={{ backgroundColor: theme[c] }}
          key={c}
        />
      ))}
    </div>
  );
}
