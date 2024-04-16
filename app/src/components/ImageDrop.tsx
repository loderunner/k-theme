import clsx from 'clsx';
import { useCallback, useRef, useState } from 'react';

import type {
  ChangeEventHandler,
  DragEventHandler,
  MouseEventHandler,
} from 'react';

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className ?? 'h-6 w-6'}
    >
      <path
        fillRule="evenodd"
        d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type Props = {
  className?: string;
  name: string;
  disabled?: boolean;
};

export default function ImageDrop({ className, name, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    () => inputRef.current?.click(),
    [],
  );

  const [imageURL, setImageURL] = useState<string>();
  const onChangeInput = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const { files } = e.currentTarget;
      if (files && files.length > 0) {
        setImageURL(URL.createObjectURL(files[0]));
      }
    },
    [],
  );

  const [dragging, setDragging] = useState(false);
  const onDragEnter = useCallback<DragEventHandler<HTMLDivElement>>(
    (e) => {
      e.preventDefault();
      if (disabled) {
        return;
      }
      setDragging(true);
    },
    [disabled],
  );
  const onDragOver = useCallback<DragEventHandler<HTMLDivElement>>(
    (e) => {
      e.preventDefault();
      if (disabled) {
        return;
      }
    },
    [disabled],
  );
  const onDragEnd = useCallback<DragEventHandler<HTMLDivElement>>(
    (e) => {
      e.preventDefault();
      if (disabled) {
        return;
      }
      setDragging(false);
    },
    [disabled],
  );
  const onDrop = useCallback<DragEventHandler<HTMLDivElement>>(
    (e) => {
      e.preventDefault();
      if (disabled) {
        return;
      }
      setDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        setImageURL(URL.createObjectURL(file));
        if (inputRef.current) {
          inputRef.current.files = e.dataTransfer.files;
          inputRef.current.dispatchEvent(
            new Event('change', { bubbles: true }),
          );
        }
      }
    },
    [disabled],
  );

  return (
    <button
      className={clsx(
        className,
        'relative',
        'flex',
        'aspect-video',
        'w-full',
        'flex-col',
        'items-center',
        'justify-center',
      )}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      <div
        className={clsx(
          'absolute',
          'z-10',
          'w-full',
          'h-full',
          'box-border',
          imageURL || 'rounded-xl',
          imageURL || 'border-4',
          imageURL || 'border-dashed',
          dragging ? 'bg-gray-500' : 'bg-transparent',
          dragging && 'opacity-25',
        )}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragEnd}
        onDragEnd={onDragEnd}
        onDrop={onDrop}
      />
      {imageURL ? (
        // eslint-disable-next-line jsx-a11y/img-redundant-alt
        <img src={imageURL} alt="uploaded image" />
      ) : (
        <>
          <PhotoIcon className="h-16 w-16" />
          <div className="text-center">
            Click or drop an image file to create a terminal theme
          </div>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        hidden
        name={name}
        accept="image/*"
        onChange={onChangeInput}
      />
    </button>
  );
}
