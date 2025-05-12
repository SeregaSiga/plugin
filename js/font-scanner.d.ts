declare module 'font-scanner' {
  export function getAvailableFontsSync(): Array<{
    family: string;
    style: string;
  }>;
}