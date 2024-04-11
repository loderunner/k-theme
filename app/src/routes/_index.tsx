import {
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { Form, json, useActionData, useSubmit } from '@remix-run/react';

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

export default function Index() {
  const actionData = useActionData<typeof action>();
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
      {actionData ? <Theme theme={actionData.theme} /> : null}
    </div>
  );
}
