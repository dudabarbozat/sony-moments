/* Busca no catálogo público da iTunes Search API (https://itunes.apple.com/search), sem chave.
   A API responde com CORS liberado; se o fetch falhar por rede/CORS, tenta JSONP (parâmetro callback). */

export interface Faixa {
  id: string;
  titulo: string;
  artista: string;
  album: string;
  capa: string; /* 600x600 */
  capaPequena: string; /* 100x100 */
  previa: string | null; /* prévia de 30 s servida pela Apple */
  genero: string;
  link: string;
  ano: number | null;
  duracaoMs: number | null;
  fonte: "catalogo" | "reserva";
  motivo?: string;
}

interface ResultadoItunes {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  primaryGenreName?: string;
  trackViewUrl?: string;
  releaseDate?: string;
  trackTimeMillis?: number;
  kind?: string;
}

interface RespostaItunes {
  resultCount: number;
  results: ResultadoItunes[];
}

const BASE = "https://itunes.apple.com/search";
const TEMPO_LIMITE = 8000;
const CACHE = "sony-moments.itunes.";

export class ErroCatalogo extends Error {}

function converter(r: ResultadoItunes): Faixa | null {
  if (!r.trackId || !r.trackName || !r.artistName) return null;
  const capaPequena = r.artworkUrl100 ?? "";
  return {
    id: String(r.trackId),
    titulo: r.trackName,
    artista: r.artistName,
    album: r.collectionName ?? "",
    capa: capaPequena.replace("100x100bb", "600x600bb"),
    capaPequena,
    previa: r.previewUrl ?? null,
    genero: r.primaryGenreName ?? "",
    link: r.trackViewUrl ?? "",
    ano: r.releaseDate ? Number(r.releaseDate.slice(0, 4)) || null : null,
    duracaoMs: r.trackTimeMillis ?? null,
    fonte: "catalogo"
  };
}

function lerCache(chave: string): RespostaItunes | null {
  try {
    const t = sessionStorage.getItem(CACHE + chave);
    return t ? (JSON.parse(t) as RespostaItunes) : null;
  } catch {
    return null;
  }
}

function gravarCache(chave: string, valor: RespostaItunes): void {
  try {
    sessionStorage.setItem(CACHE + chave, JSON.stringify(valor));
  } catch {
    /* sem espaço: segue sem cache */
  }
}

async function viaFetch(url: string): Promise<RespostaItunes> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TEMPO_LIMITE);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (r.status === 403 || r.status === 429) throw new ErroCatalogo("O catálogo de músicas pediu uma pausa. Tente de novo em um minuto.");
    if (!r.ok) throw new ErroCatalogo("O catálogo de músicas não respondeu.");
    return (await r.json()) as RespostaItunes;
  } finally {
    clearTimeout(timer);
  }
}

let contadorJsonp = 0;
function viaJsonp(url: string): Promise<RespostaItunes> {
  return new Promise((resolve, reject) => {
    const nome = `__sonyMoments${Date.now()}${contadorJsonp++}`;
    const janela = window as unknown as Record<string, unknown>;
    const script = document.createElement("script");
    const limpar = () => {
      delete janela[nome];
      script.remove();
      clearTimeout(timer);
    };
    const timer = setTimeout(() => {
      limpar();
      reject(new ErroCatalogo("O catálogo de músicas demorou demais para responder."));
    }, TEMPO_LIMITE);
    janela[nome] = (dados: RespostaItunes) => {
      limpar();
      resolve(dados);
    };
    script.onerror = () => {
      limpar();
      reject(new ErroCatalogo("Sem conexão com o catálogo de músicas."));
    };
    script.src = `${url}&callback=${nome}`;
    document.head.appendChild(script);
  });
}

export async function buscar(termo: string, limite = 15): Promise<Faixa[]> {
  const params = new URLSearchParams({ term: termo, media: "music", entity: "song", limit: String(limite), country: "BR" });
  const url = `${BASE}?${params.toString()}`;
  const chave = params.toString();
  let dados = lerCache(chave);
  if (!dados) {
    try {
      dados = await viaFetch(url);
    } catch (e) {
      if (e instanceof ErroCatalogo) throw e;
      dados = await viaJsonp(url); /* rede ou CORS: tenta JSONP */
    }
    gravarCache(chave, dados);
  }
  return dados.results.filter((r) => !r.kind || r.kind === "song").map(converter).filter((f): f is Faixa => f !== null);
}
