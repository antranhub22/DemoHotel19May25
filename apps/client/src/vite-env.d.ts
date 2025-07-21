/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_API_HOST?: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_VAPI_PUBLIC_KEY?: string
  readonly VITE_VAPI_ASSISTANT_ID?: string
  readonly VITE_VAPI_PUBLIC_KEY_FR?: string
  readonly VITE_VAPI_ASSISTANT_ID_FR?: string
  readonly VITE_VAPI_PUBLIC_KEY_ZH?: string
  readonly VITE_VAPI_ASSISTANT_ID_ZH?: string
  readonly VITE_VAPI_PUBLIC_KEY_RU?: string
  readonly VITE_VAPI_ASSISTANT_ID_RU?: string
  readonly VITE_VAPI_PUBLIC_KEY_KO?: string
  readonly VITE_VAPI_ASSISTANT_ID_KO?: string
  readonly VITE_VAPI_PUBLIC_KEY_VI?: string
  readonly VITE_VAPI_ASSISTANT_ID_VI?: string
  readonly VITE_FORCE_VAPI_IN_DEV?: string
  readonly DEV?: boolean
  readonly NODE_ENV?: string
  readonly BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Module declarations for CSS and image files
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.css' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
} 