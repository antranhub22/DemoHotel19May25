/// <reference types="vite/client" />
// Global type declarations for the project

// CSS Modules declarations
declare module "*.module.css" {
  const styles: { [className: string]: string };
  export default styles;
}

declare module "*.module.scss" {
  const styles: { [className: string]: string };
  export default styles;
}

declare module "*.module.sass" {
  const styles: { [className: string]: string };
  export default styles;
}

// Image file declarations
declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

// Audio file declarations
declare module "*.mp3" {
  const src: string;
  export default src;
}

declare module "*.wav" {
  const src: string;
  export default src;
}

declare module "*.ogg" {
  const src: string;
  export default src;
}

// Font file declarations
declare module "*.woff" {
  const src: string;
  export default src;
}

declare module "*.woff2" {
  const src: string;
  export default src;
}

declare module "*.ttf" {
  const src: string;
  export default src;
}

declare module "*.eot" {
  const src: string;
  export default src;
}

// Video file declarations
declare module "*.mp4" {
  const src: string;
  export default src;
}

declare module "*.webm" {
  const src: string;
  export default src;
}

// Other file types
declare module "*.json" {
  const value: any;
  export default value;
}

// Environment variable augmentation
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      VITE_OPENAI_API_KEY?: string;
      VITE_VAPI_PUBLIC_KEY?: string;
      VITE_VAPI_ASSISTANT_ID?: string;
      VITE_VAPI_PUBLIC_KEY_VI?: string;
      VITE_VAPI_ASSISTANT_ID_VI?: string;
    }
  }
}

declare global {
  interface Window {
    resetSummarySystem?: () => void;
  }
}

export {};
