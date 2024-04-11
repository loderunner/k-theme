import {
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { json, redirect, useActionData } from '@remix-run/react';

import terminalOutput from '~/assets/terminal-output';
import Palette from '~/components/Palette';
import Term from '~/components/Term';

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import type { Theme } from '~/components/Term';

type APITheme = {
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
};

type ActionData = {
  theme: APITheme;
};

export async function action({
  request,
}: ActionFunctionArgs): Promise<ActionData> {
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
  return { theme: await res.json() };
}

function apiToTerm(
  theme: APITheme,
  lightOrDark: 'light' | 'dark' = 'light',
): Theme {
  return {
    ...theme,
    background: lightOrDark === 'light' ? theme.white : theme.black,
    foreground: lightOrDark === 'light' ? theme.black : theme.white,
    lightFontWeight: 'lighter',
    normalFontWeight: 'normal',
    boldFontWeight: 'bold',
  };
}

export default function Theme() {
  const actionData = useActionData<typeof action>();
  return actionData ? (
    <>
      <Palette theme={actionData.theme} />
      <Term
        className="text-sm"
        content={terminalOutput}
        theme={apiToTerm(actionData.theme, 'dark')}
      />
    </>
  ) : null;
}
