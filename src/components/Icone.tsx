const ICONES = {
  voltar: <><path d="M9 5 4 10l5 5" /><path d="M4 10h9.5a6 6 0 0 1 6 6v3" /></>,
  casa: <><path d="M4 11 12 4l8 7" /><path d="M6 9.5V20h12V9.5" /><path d="M10 20v-5.5h4V20" /></>,
  camera: <><path d="M4 8.5h3.2L9 5.5h6l1.8 3H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z" /><circle cx="12" cy="13.5" r="3.6" /></>,
  pessoas: <><circle cx="9" cy="8" r="3.6" /><path d="M2.5 20c0-3.8 2.9-6.4 6.5-6.4s6.5 2.6 6.5 6.4" /><path d="M15.5 4.6a3.6 3.6 0 0 1 0 6.8" /><path d="M18 14c2.2.7 3.5 2.9 3.5 6" /></>,
  enviar: <><path d="M21 3 3 10.4l7.4 2.9L13.6 21z" /><path d="M21 3 10.4 13.3" /></>,
  mensagem: <><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9.5h8M8 12.5h5" /></>,
  stories: <><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="3.6" /><circle cx="16.6" cy="7.4" r=".9" fill="currentColor" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1" /></>,
  baixar: <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />,
  nota: <><path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" /></>,
  cadeado: <><rect x="5" y="11" width="14" height="10" rx="1.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  pular: <path d="M5 5l9 7-9 7zM18 5v14" />,
  tocar: <path d="M8.5 5.5v13a.8.8 0 0 0 1.2.7l10.4-6.5a.8.8 0 0 0 0-1.4L9.7 4.8a.8.8 0 0 0-1.2.7z" />,
  pausa: <path d="M8 5v14M16 5v14" />,
  escudo: <><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  faisca: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="M12 8.5 13.2 11l2.3 1-2.3 1L12 15.5 10.8 13l-2.3-1 2.3-1z" /></>,
  fechar: <path d="M6 6l12 12M18 6 6 18" />,
  alerta: <><path d="M12 4 2.8 19.5h18.4z" /><path d="M12 10v4M12 17h.01" /></>,
  externo: <><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  olho: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  recarregar: <><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 5v6h-6" /></>,
  github: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
} as const;

export type NomeIcone = keyof typeof ICONES;

export function Icone({ nome, tamanho = 22, className }: { nome: NomeIcone; tamanho?: number; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={tamanho}
      height={tamanho}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONES[nome]}
    </svg>
  );
}

/** Símbolo do projeto (círculo com onda), redesenhado a partir do slide de capa do pitch. */
export function Simbolo({ largura = 44, cor = "#c7d3dd" }: { largura?: number; cor?: string }) {
  return (
    <svg viewBox="0 0 196 115" width={largura} height={(largura * 115) / 196} fill="none" aria-hidden="true" focusable="false">
      <path d="M1 56.8 Q24 55 46 54.6 L46 59 Q24 58.6 1 56.8Z" fill={cor} opacity="0.7" />
      <path d="M195 56.8 Q172 55 150 54.6 L150 59 Q172 58.6 195 56.8Z" fill={cor} opacity="0.7" />
      <ellipse cx="98.2" cy="57.5" rx="52.8" ry="54.3" stroke={cor} strokeWidth="6" />
      <path
        d="M47 57 L67 57.3 C72.5 57.6 73.5 60.5 75 66.5 C76.6 73 80.2 74 82 67.5 L88.6 41.5 C90 36.6 92.6 36.6 93.8 41.5 L101.6 79.2 C103 84.6 106.2 84.6 107.2 79 L113.6 33.6 C114.8 27.6 118 27.6 119.4 33.6 L123.4 48.8 C125 54.6 127 55.4 131 55.4 L149.5 55.4"
        stroke={cor}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
