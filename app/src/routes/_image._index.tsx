import { type MetaFunction } from '@remix-run/node';
import { Form, useNavigation } from '@remix-run/react';
import { useCallback, useContext } from 'react';

import { ImageContext } from './_image';

import type { ChangeEventHandler } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: 'K-Theme' },
    { name: 'description', content: 'Generate a terminal theme from an image' },
  ];
};

export default function Index() {
  const [, setImageURL] = useContext(ImageContext);

  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (event.target.files && event.target.files.length) {
        const url = URL.createObjectURL(event.target.files[0]);
        setImageURL(url);
      }
    },
    [setImageURL],
  );

  const navigation = useNavigation();

  return (
    <div>
      {navigation.state === 'loading' || navigation.state === 'submitting' ? (
        <h1>Loading...</h1>
      ) : null}
      <h1>Generate a terminal theme from an image</h1>
      <Form action="/theme" method="POST" encType="multipart/form-data">
        <p>Upload an image to generate a terminal theme from it.</p>
        <label htmlFor="image">
          Image:{' '}
          <input
            type="file"
            name="image"
            // accept="image/*"
            onChange={onChange}
          />
        </label>
        <button type="submit">Generate Theme</button>
      </Form>
    </div>
  );
}
