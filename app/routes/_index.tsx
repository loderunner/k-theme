import { Form } from '@remix-run/react';
import { put } from '@vercel/blob';
import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import {
  redirect,
  unstable_createFileUploadHandler,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { nanoid } from 'nanoid';

export const meta: MetaFunction = () => {
  return [
    { title: 'K-Theme' },
    { name: 'description', content: 'Generate a terminal theme from an image' },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 20000000,
      filter: ({ contentType }) =>
        contentType === 'image/jpeg' || contentType === 'image/png',
    }),
    unstable_createMemoryUploadHandler(),
  );
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler,
  );

  const file = formData.get('image') as File;
  const id = nanoid(12);
  const extension = file.type === 'image.jpeg' ? 'jpg' : 'png';

  console.log(`uploading ${file.name} (${file.size}B) as ${id}.${extension}`);
  const blob = await put(`${id}.${extension}`, file, {
    addRandomSuffix: false,
    access: 'public',
    contentType: file.type,
  });

  console.log(`finished uploading ${id}.${extension}: ${blob.url}`);

  console.log(`uploading JSON entry as ${id}.json`);
  await put(`${id}.json`, JSON.stringify({ url: blob.url }), {
    addRandomSuffix: false,
    access: 'public',
    contentType: 'application/json',
    multipart: true,
  });

  console.log(`finished uploading ${id}.json`);
  console.log(`redirecting to /${id}`);

  return redirect(`/${id}`);
}

export default function Index() {
  return (
    <div>
      <h1>Generate a terminal theme from an image</h1>
      <Form action="" method="POST" encType="multipart/form-data">
        <p>Upload an image to generate a terminal theme from it.</p>
        <label>
          Image: <input type="file" name="image" />
        </label>
        <button type="submit">Generate Theme</button>
      </Form>
    </div>
  );
}
