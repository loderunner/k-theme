import {
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { Form, json, useActionData, useSubmit } from '@remix-run/react';
import { useMemo } from 'react';

import ImageDrop from '~/components/ImageDrop';
import Theme from '~/components/Theme';

import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import type { APITheme } from '~/components/Theme';

export const meta: MetaFunction = () => {
  return [
    { title: 'K-Theme' },
    { name: 'description', content: 'Generate a terminal theme from an image' },
  ];
};

type ActionData = {
  theme: APITheme;
};

export async function action({
  request,
}: ActionFunctionArgs): Promise<ActionData> {
  console.log(`${request.method} ${request.url}`);
  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 25000000,
    }),
    unstable_createMemoryUploadHandler(),
  );
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler,
  );

  const file = formData.get('image') as File | null;
  if (!file) {
    throw json('Missing image data', { status: 422 });
  }

  const fetchFormData = new FormData();
  fetchFormData.append('file', file);

  const res = await fetch(`${process.env.API_URL}/theme`, {
    method: 'POST',
    body: fetchFormData,
  });
  if (!res.ok) {
    throw json((await res.text()) || res.statusText, { status: res.status });
  }
  return { theme: await res.json() };
}

const defaultTheme: APITheme = {
  black: 'rgb(8, 8, 8)',
  blue: 'rgb(78, 112, 135)',
  brightBlack: 'rgb(49, 54, 65)',
  brightBlue: 'rgb(59, 118, 235)',
  brightCyan: 'rgb(67, 130, 247)',
  brightGreen: 'rgb(162, 183, 141)',
  brightMagenta: 'rgb(149, 167, 194)',
  brightRed: 'rgb(172, 70, 71)',
  brightWhite: 'rgb(243, 243, 246)',
  brightYellow: 'rgb(243, 203, 70)',
  cyan: 'rgb(29, 73, 115)',
  green: 'rgb(169, 153, 118)',
  magenta: 'rgb(102, 128, 168)',
  red: 'rgb(164, 96, 103)',
  white: 'rgb(136, 141, 152)',
  yellow: 'rgb(217, 193, 141)',
};

export default function Index() {
  const actionData = useActionData<typeof action>();
  const theme = useMemo(
    () => actionData?.theme ?? defaultTheme,
    [actionData?.theme],
  );
  const submit = useSubmit();
  return (
    <div>
      <Form
        method="POST"
        encType="multipart/form-data"
        onChange={(e) => submit(e.currentTarget)}
      >
        <ImageDrop name="image" />
      </Form>
      <Theme theme={theme} />
    </div>
  );
}
