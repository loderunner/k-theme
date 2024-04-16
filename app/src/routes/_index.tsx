import {
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import {
  Form,
  json,
  useActionData,
  useFetcher,
  useFetchers,
  useNavigate,
  useNavigation,
  useSubmit,
} from '@remix-run/react';
import clsx from 'clsx';
import { useCallback } from 'react';

import ImageDrop from '~/components/ImageDrop';
import Theme from '~/components/Theme';

import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import type { FormEventHandler } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: 'K-Theme' },
    { name: 'description', content: 'Generate a terminal theme from an image' },
  ];
};
export async function action({ request }: ActionFunctionArgs) {
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
  return { themes: await res.json() };
}

export default function Index() {
  const fetcher = useFetcher<typeof action>();

  const onChange = useCallback<FormEventHandler<HTMLFormElement>>(
    (e) => fetcher.submit(e.currentTarget),
    [fetcher],
  );

  return (
    <div>
      <fetcher.Form
        className="relative"
        method="POST"
        encType="multipart/form-data"
        onChange={onChange}
      >
        {fetcher.state !== 'idle' && (
          <div
            className={clsx(
              'absolute',
              'z-10',
              'flex',
              'h-full',
              'w-full',
              'flex-col',
              'items-center',
              'justify-center',
              'bg-black',
              'bg-opacity-70',
              'text-gray-200',
            )}
          >
            <span className="text-5xl">Loading...</span>
          </div>
        )}
        <ImageDrop
          className="absolute z-0"
          name="image"
          disabled={fetcher.state !== 'idle'}
        />
      </fetcher.Form>
      {fetcher.data ? <Theme themes={fetcher.data.themes} /> : null}
    </div>
  );
}
