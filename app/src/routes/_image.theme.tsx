import {
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { json, useActionData } from '@remix-run/react';

import type { ActionFunctionArgs } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
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

export default function Theme() {
  const actionData = useActionData<typeof action>();
  return actionData ? (
    <pre>{JSON.stringify(actionData.theme, undefined, '  ')}</pre>
  ) : null;
}
