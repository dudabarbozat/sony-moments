/* Cartão musical no formato do mockup do pitch: foto com play, legenda, capa da música e convite.
   Canvas 1080x976. A capa vem do servidor de imagens da Apple, que libera CORS; se falhar, o cartão sai sem capa. */
import type { Faixa } from "./itunes";
import type { FonteImagem } from "./analise";

const L = 1080;
const A = 976;
const FOTO = 692;
const R = 36;

const ONDA =
  "M47 57 L67 57.3 C72.5 57.6 73.5 60.5 75 66.5 C76.6 73 80.2 74 82 67.5 L88.6 41.5 C90 36.6 92.6 36.6 93.8 41.5 L101.6 79.2 C103 84.6 106.2 84.6 107.2 79 L113.6 33.6 C114.8 27.6 118 27.6 119.4 33.6 L123.4 48.8 C125 54.6 127 55.4 131 55.4 L149.5 55.4";

export function carregarCapa(url: string): Promise<HTMLImageElement | null> {
  if (!url) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const t = setTimeout(() => resolve(null), 8000);
    img.onload = () => { clearTimeout(t); resolve(img); };
    img.onerror = () => { clearTimeout(t); resolve(null); };
    img.src = url;
  });
}

function cobrir(ctx: CanvasRenderingContext2D, img: FonteImagem, x: number, y: number, w: number, h: number) {
  const iw = "naturalWidth" in img ? img.naturalWidth : img.width;
  const ih = "naturalHeight" in img ? img.naturalHeight : img.height;
  const e = Math.max(w / iw, h / ih);
  const sw = w / e, sh = h / e;
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
}

function arredondado(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function simbolo(ctx: CanvasRenderingContext2D, x: number, y: number, largura: number, cor: string) {
  const e = largura / 196;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(e, e);
  ctx.strokeStyle = cor;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.ellipse(98.2, 57.5, 52.8, 54.3, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 8;
  ctx.stroke(new Path2D(ONDA));
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(14, 57); ctx.lineTo(46, 56.6);
  ctx.moveTo(150, 55.6); ctx.lineTo(182, 56);
  ctx.stroke();
  ctx.restore();
}

function quebrar(ctx: CanvasRenderingContext2D, texto: string, largura: number): string[] {
  const linhas: string[] = [];
  let atual = "";
  for (const p of texto.split(" ")) {
    const teste = atual ? `${atual} ${p}` : p;
    if (ctx.measureText(teste).width > largura && atual) {
      linhas.push(atual);
      atual = p;
    } else atual = teste;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

function cortar(ctx: CanvasRenderingContext2D, texto: string, largura: number): string {
  if (ctx.measureText(texto).width <= largura) return texto;
  let t = texto;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > largura) t = t.slice(0, -1);
  return `${t}…`;
}

export async function carregarFontes(): Promise<void> {
  if (!document.fonts?.load) return;
  const familia = getComputedStyle(document.documentElement).getPropertyValue("--fonte-ui").trim() || "sans-serif";
  await Promise.all([document.fonts.load(`400 44px ${familia}`), document.fonts.load(`500 44px ${familia}`)]).catch(() => undefined);
}

export function desenharCartao(
  canvas: HTMLCanvasElement,
  foto: FonteImagem | null,
  capa: HTMLImageElement | null,
  faixa: Faixa,
  opcoes: { perfil: string; link: string }
): void {
  canvas.width = L;
  canvas.height = A;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const fonte = getComputedStyle(document.documentElement).getPropertyValue("--fonte-ui").trim() || "system-ui, sans-serif";
  ctx.clearRect(0, 0, L, A);
  ctx.save();
  arredondado(ctx, 0, 0, L, A, R);
  ctx.clip();

  ctx.fillStyle = "#978a97";
  ctx.fillRect(0, 0, L, A);
  if (foto) cobrir(ctx, foto, 0, 0, L, FOTO);
  else {
    ctx.fillStyle = "#4b2d49";
    ctx.fillRect(0, 0, L, FOTO);
  }
  const veu = ctx.createLinearGradient(0, FOTO * 0.6, 0, FOTO);
  veu.addColorStop(0, "rgba(51,23,50,0)");
  veu.addColorStop(1, "rgba(51,23,50,0.6)");
  ctx.fillStyle = veu;
  ctx.fillRect(0, 0, L, FOTO);

  /* play */
  const cx = L / 2, cy = FOTO / 2 - 20, raio = 124;
  const g = ctx.createRadialGradient(cx - 40, cy - 40, 10, cx, cy, raio);
  g.addColorStop(0, "#e64fcb");
  g.addColorStop(0.5, "#df23bc");
  g.addColorStop(1, "#b0179a");
  ctx.shadowColor = "rgba(60,0,50,0.45)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, raio, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 13;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 34, cy - 58);
  ctx.lineTo(cx + 60, cy);
  ctx.lineTo(cx - 34, cy + 58);
  ctx.closePath();
  ctx.stroke();

  /* capa da música, como selo sobre a borda da foto */
  const lado = 200, capaX = L - 38 - lado, capaY = 38;
  if (capa) {
    ctx.save();
    ctx.shadowColor = "rgba(20,4,20,0.5)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    arredondado(ctx, capaX - 6, capaY - 6, lado + 12, lado + 12, 22);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();
    ctx.save();
    arredondado(ctx, capaX, capaY, lado, lado, 16);
    ctx.clip();
    ctx.drawImage(capa, capaX, capaY, lado, lado);
    ctx.restore();
  }
  const largTexto = L - 76;

  /* legenda sobre a foto */
  simbolo(ctx, 38, FOTO - 74, 92, "#ffffff");
  ctx.fillStyle = "#ffffff";
  ctx.font = `400 42px ${fonte}`;
  ctx.textBaseline = "alphabetic";
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 8;
  ctx.fillText(cortar(ctx, `${faixa.titulo} - ${faixa.artista}`, largTexto - 104), 142, FOTO - 26);
  ctx.shadowColor = "transparent";

  /* convite */
  ctx.fillStyle = "#331832";
  ctx.font = `400 48px ${fonte}`;
  let y = FOTO + 74;
  const linhas = quebrar(ctx, `Curta esse cartão musical da ${opcoes.perfil}. Conheça essa música e mais outras no`, largTexto);
  for (const linha of linhas.slice(0, 3)) {
    ctx.fillText(linha, 38, y);
    y += 64;
  }
  ctx.font = `500 48px ${fonte}`;
  const link = cortar(ctx, opcoes.link, L - 76);
  ctx.fillText(link, 38, y);
  ctx.fillRect(38, y + 8, ctx.measureText(link).width, 3);
  ctx.restore();
}

export function nomeArquivo(faixa: Faixa): string {
  const slug = faixa.titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `sony-moments-${slug || "cartao"}.png`;
}

export function paraBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG"))), "image/png"));
}

export function baixarBlob(blob: Blob, nome: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
