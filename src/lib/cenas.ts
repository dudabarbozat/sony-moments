/* Cenas de exemplo: fotos do Wikimedia Commons (autor, licença e página tirados da API do Commons), em public/img/cenas/. */

export interface Cena {
  id: string;
  nome: string;
  arquivo: string;
  titulo: string;
  autor: string;
  licenca: string;
  licencaUrl: string;
  pagina: string;
  largura: number;
  altura: number;
  /** o que foi feito na foto além de redimensionar e converter para WebP */
  ajuste?: string;
}

export const CENAS: Cena[] = [
  {
    id: "praia",
    nome: "Praia ao meio-dia",
    arquivo: "praia.webp",
    titulo: "Avalon Beach (246149691).jpeg",
    autor: "Matt Langbehn",
    licenca: "CC BY-SA 3.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    pagina: "https://commons.wikimedia.org/wiki/File:Avalon_Beach_(246149691).jpeg",
    largura: 800,
    altura: 600
  },
  {
    id: "por-do-sol",
    nome: "Pôr do sol na laje",
    arquivo: "por-do-sol.webp",
    titulo: "Sunset over Penn rooftops, Wolverhampton - geograph.org.uk - 3774137.jpg",
    autor: "Roger Kidd",
    licenca: "CC BY-SA 2.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    pagina: "https://commons.wikimedia.org/wiki/File:Sunset_over_Penn_rooftops,_Wolverhampton_-_geograph.org.uk_-_3774137.jpg",
    largura: 800,
    altura: 380
  },
  {
    id: "festa",
    nome: "Festa na garagem",
    arquivo: "festa.webp",
    titulo: "Carnival (8499157519).jpg",
    autor: "Moyan Brenn from Italy",
    licenca: "CC BY 2.0",
    licencaUrl: "https://creativecommons.org/licenses/by/2.0",
    pagina: "https://commons.wikimedia.org/wiki/File:Carnival_(8499157519).jpg",
    largura: 800,
    altura: 505,
    ajuste: "faixa inferior com a marca d'água do autor recortada"
  },
  {
    id: "chuva",
    nome: "Chuva na janela",
    arquivo: "chuva.webp",
    titulo: "Rain drops on window 03 ies.jpg",
    autor: "Frank Vincentz",
    licenca: "CC BY-SA 3.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    pagina: "https://commons.wikimedia.org/wiki/File:Rain_drops_on_window_03_ies.jpg",
    largura: 800,
    altura: 600
  },
  {
    id: "madrugada",
    nome: "Madrugada na cidade",
    arquivo: "madrugada.webp",
    titulo: "Münster, Liudgerhaus und Diözesanbibliothek -- 2014 -- 0303.jpg",
    autor: "Dietmar Rabich",
    licenca: "CC BY-SA 4.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    pagina: "https://commons.wikimedia.org/wiki/File:M%C3%BCnster,_Liudgerhaus_und_Di%C3%B6zesanbibliothek_--_2014_--_0303.jpg",
    largura: 600,
    altura: 900
  },
  {
    id: "neblina",
    nome: "Serra com neblina",
    arquivo: "neblina.webp",
    titulo: "Neblina na Serra do Itajaí.jpg",
    autor: "Paulo Marcelo Adamek",
    licenca: "CC BY-SA 4.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    pagina: "https://commons.wikimedia.org/wiki/File:Neblina_na_Serra_do_Itaja%C3%AD.jpg",
    largura: 800,
    altura: 600
  }
];

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function acharCena(id: string): Cena | undefined {
  return CENAS.find((c) => c.id === id);
}

export function urlCena(c: Cena): string {
  return `${BASE}/img/cenas/${c.arquivo}`;
}

/** Carrega a foto da cena (mesma origem, então a leitura por canvas funciona). */
export function carregarCena(id: string): Promise<HTMLImageElement> {
  const c = acharCena(id);
  if (!c) return Promise.reject(new Error(`Cena desconhecida: ${id}`));
  return new Promise((resolver, rejeitar) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolver(img);
    img.onerror = () => rejeitar(new Error(`Falha ao carregar ${c.arquivo}`));
    img.src = urlCena(c);
  });
}
