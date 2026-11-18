/* Leitura da foto no navegador (regras sobre brilho, cor e contraste). */
import type { Clima } from "./dados";

export interface Medidas {
  brilho: number;
  saturacao: number;
  temperatura: number;
  contraste: number;
  valencia: number;
  energia: number;
}

export type FonteImagem = HTMLCanvasElement | HTMLImageElement;

export function limitar(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export function hash(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function climaDe(valencia: number, energia: number): Clima {
  if (valencia >= 0.5 && energia >= 0.5) return "euforia";
  if (valencia >= 0.5) return "calmaria";
  if (energia >= 0.5) return "tensao";
  return "melancolia";
}

/* ---------- leitura ---------- */
function arred(x: number): number {
  return Math.round(x * 100) / 100;
}

export function lerImagem(fonte: FonteImagem): Medidas {
  const fw = "naturalWidth" in fonte ? fonte.naturalWidth : fonte.width;
  const fh = "naturalHeight" in fonte ? fonte.naturalHeight : fonte.height;
  const escala = 128 / Math.max(fw, fh, 1);
  const w = Math.max(1, Math.round(fw * escala));
  const h = Math.max(1, Math.round(fh * escala));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas indisponível");
  ctx.drawImage(fonte, 0, 0, w, h);
  const px = ctx.getImageData(0, 0, w, h).data;

  let n = 0, somaL = 0, somaL2 = 0, somaS = 0, somaT = 0;
  for (let i = 0; i < px.length; i += 4) {
    if ((px[i + 3] ?? 0) < 16) continue;
    const r = (px[i] ?? 0) / 255, g = (px[i + 1] ?? 0) / 255, b = (px[i + 2] ?? 0) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const sat = max === 0 ? 0 : (max - min) / max;
    somaL += l;
    somaL2 += l * l;
    somaS += sat * Math.min(1, max * 2.5); /* pixel muito escuro não conta como saturado */
    somaT += r - b;
    n++;
  }
  if (!n) n = 1;
  const mL = somaL / n;
  const desvio = Math.sqrt(Math.max(0, somaL2 / n - mL * mL));
  const brilho = limitar(mL);
  const saturacao = limitar(somaS / n);
  const temperatura = limitar(0.5 + (somaT / n) * 1.6);
  const contraste = limitar(desvio / 0.3);
  const valencia = limitar((0.42 * brilho + 0.33 * temperatura + 0.25 * saturacao - 0.12) / 0.66);
  const energia = limitar((0.45 * contraste + 0.4 * saturacao + 0.15 * brilho - 0.08) / 0.7);
  return {
    brilho: arred(brilho),
    saturacao: arred(saturacao),
    temperatura: arred(temperatura),
    contraste: arred(contraste),
    valencia: arred(valencia),
    energia: arred(energia)
  };
}

export function cobrirCanvas(canvas: HTMLCanvasElement, fonte: FonteImagem | null): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#4b2d49";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!fonte) return;
  const iw = "naturalWidth" in fonte ? fonte.naturalWidth : fonte.width;
  const ih = "naturalHeight" in fonte ? fonte.naturalHeight : fonte.height;
  const e = Math.max(canvas.width / iw, canvas.height / ih);
  const sw = canvas.width / e, sh = canvas.height / e;
  ctx.drawImage(fonte, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, canvas.width, canvas.height);
}
