import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from '@remix-run/react';

import './root.css';

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  if (isRouteErrorResponse(error)) {
    return (
      <h1>
        {error.status} {error.statusText}
      </h1>
    );
  } else {
    return <h1>{(error as Error).message}</h1>;
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-50">
        <main className="container mx-auto my-12 flex max-w-screen-md flex-col bg-gray-100 px-8 py-8">
          <h1 className="py-8 text-center text-4xl">
            Terminal Theme Generator
          </h1>
          {children}
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
