import { useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ params }: LoaderFunctionArgs) {
  const url = `${process.env.BLOB_STORAGE_URL}/${params.themeId}.json`;

  console.log(`fetching JSON entry ${url}`);
  let res = await fetch(url);
  if (!res.ok) {
    throw res;
  }

  console.log('fetch successful');

  const entry = await res.json();

  console.log(`${params.themeId}: ${JSON.stringify(entry)}`);

  return { url: entry.url };
}

export default function PaletteViewer() {
  const { url } = useLoaderData<typeof loader>();
  return <img src={url} alt="" />;
}
