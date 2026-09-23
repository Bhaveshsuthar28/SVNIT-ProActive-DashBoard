/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRAFFIC_HEATMAP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
