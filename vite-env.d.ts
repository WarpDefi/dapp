/// <reference types="vite/client" />

declare module '@metamask/jazzicon';
declare module '@metamask/jazzicon' {
  export default function (diameter: number, seed: number): HTMLElement;
}

declare module 'fortmatic';

interface Window {
  ethereum?: {
    isMetaMask?: true;
    isCoin98?: true;
    on?: (...args: any[]) => void;
    removeListener?: (...args: any[]) => void;
  };
  web3?: {};
}

declare module 'content-hash' {
  function decode(x: string): string;
  function getCodec(x: string): string;
}

declare module 'multihashes' {
  function decode(buff: Uint8Array): { code: number; name: string; length: number; digest: Uint8Array };
  function toB58String(hash: Uint8Array): string;
}
