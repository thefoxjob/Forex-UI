/// <reference types="vite/client" />


interface ImportMetaEnv {
  readonly VITE_ONE_FRAME_API_ENDPOINT: string;
  readonly VITE_ONE_FRAME_API_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
