import { useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { getDownloadUrl } from '@vercel/blob';

export async function loader({ params }: LoaderFunctionArgs) {
  const imageURL = await getDownloadUrl(params.paletteId ?? '');
  return { imageURL };
}

export default function PaletteViewer() {
  const { imageURL } = useLoaderData<typeof loader>();
  return <img src={imageURL} />;
}
