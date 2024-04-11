import clsx from 'clsx';
import { useCallback, useRef, useState } from 'react';

import type { ChangeEventHandler, MouseEventHandler } from 'react';

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
  name: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

export default function ImageDrop({ onChange, name }: Props) {
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
      if (onChange) {
        onChange(e);
      }
    },
    [onChange],
  );

  return (
    <button
      className={clsx(
        'flex',
        'aspect-video',
        'w-full',
        'flex-col',
        'items-center',
        'justify-center',
        imageURL || 'rounded-xl',
        imageURL || 'border-4',
        imageURL || 'border-dashed',
        imageURL || 'p-8',
      )}
      type="button"
      onClick={onClick}
    >
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
