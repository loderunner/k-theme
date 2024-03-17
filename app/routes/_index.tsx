import { Form, useActionData } from '@remix-run/react';
import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@vercel/remix';
import type { ActionFunctionArgs, MetaFunction } from '@vercel/remix';

export const meta: MetaFunction = () => {
  return [
    { title: 'K-Theme' },
    { name: 'description', content: 'Generate a terminal theme from an image' },
  ];
};

export async function clientAction({ request }: ActionFunctionArgs) {
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 20 * (1 << 20),
  });
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler,
  );

  const file = formData.get('image') as File;

  return { imageURL: URL.createObjectURL(file) };
}

function InputForm() {
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

function ThemePreview({ imageURL }: { imageURL: string }) {
  return <img src={imageURL} alt="" />;
}

export default function Index() {
  const actionData = useActionData<typeof clientAction>();
  if (actionData) {
    return <ThemePreview imageURL={actionData.imageURL} />;
  } else {
    return <InputForm />;
  }
}
