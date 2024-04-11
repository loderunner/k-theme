import { type MetaFunction } from '@remix-run/node';
import { Form, useNavigation, useSubmit } from '@remix-run/react';
import { useCallback, useContext, useState } from 'react';

import ImageDrop from '~/components/ImageDrop';

import { ImageContext } from './_image';

import type { ChangeEventHandler } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: 'K-Theme' },
    { name: 'description', content: 'Generate a terminal theme from an image' },
  ];
};

export default function Index() {
  const submit = useSubmit();
  return (
    <div>
      <Form
        action="/theme"
        method="POST"
        encType="multipart/form-data"
        onChange={(e) => submit(e.currentTarget)}
      >
        <ImageDrop />
      </Form>
    </div>
  );
}
