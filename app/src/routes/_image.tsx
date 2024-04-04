import { Outlet } from '@remix-run/react';
import { createContext, useState } from 'react';

export const ImageContext = createContext<[string, (url: string) => void]>([
  '',
  () => {},
]);

export default function ImageLayout() {
  const [imageURL, setImageURL] = useState('');
  return (
    <ImageContext.Provider value={[imageURL, setImageURL]}>
      {imageURL ? <img src={imageURL} style={{ height: '400px' }} /> : null}
      <Outlet />
    </ImageContext.Provider>
  );
}
