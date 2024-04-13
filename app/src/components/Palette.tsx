type Props = {
  theme: Record<string, string>;
  className?: string;
};

const colors = [
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
