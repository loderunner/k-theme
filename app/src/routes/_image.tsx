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
      <Outlet />
    </ImageContext.Provider>
  );
}
