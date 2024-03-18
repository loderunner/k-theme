import { useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ params }: LoaderFunctionArgs) {
  let res = await fetch(
    `${process.env.BLOB_STORAGE_URL}/${params.themeId}.json`,
  );
  if (!res.ok) {
    throw res;
  }

  const entry = await res.json();

  return { url: entry.url };
}

export default function PaletteViewer() {
  const { url } = useLoaderData<typeof loader>();
  return <img src={url} alt="" />;
}
