/* Do clique em "Analisar foto" até as 4 músicas: leitura de cor no navegador e buscas reais
   na iTunes Search API por gênero + clima. Se o catálogo falhar, usa o catálogo reserva fictício. */
import { CATALOGO_RESERVA, GENEROS, NOME_CLIMA, PALAVRAS_CLIMA, type Clima, type Genero } from "./dados";
import { climaDe, hash, lerImagem, type FonteImagem, type Medidas } from "./analise";
import { buscar, type Faixa } from "./itunes";

export interface Leitura {
  clima: Clima;
  valencia: number;
  energia: number;
  medidas: Medidas;
}

export interface ResultadoAnalise {
  leitura: Leitura;
  faixas: Faixa[];
  aviso?: string;
}

interface Candidata {
  faixa: Faixa;
  genero: Genero;
  termo: string;
  noGosto: boolean;
}

function generosDe(ids: string[]): Genero[] {
  return ids.map((id) => GENEROS.find((g) => g.id === id)).filter((g): g is Genero => !!g);
}

function noGosto(f: Faixa, g: Genero): boolean {
  return g.catalogo.some((c) => f.genero.toLowerCase().includes(c.toLowerCase()));
}

/* ---------- motivos ---------- */

type Traco = { peso: number; texto: string };

/** Traços da foto (sempre no singular), do mais marcante para o menos marcante. */
function tracosDaFoto(m: Medidas): string[] {
  const t: Traco[] = [
    { peso: Math.abs(m.temperatura - 0.5), texto: m.temperatura >= 0.5 ? "o tom quente da foto" : "o tom frio da foto" },
    { peso: Math.abs(m.brilho - 0.5), texto: m.brilho >= 0.5 ? "a luz forte da foto" : "a pouca luz da foto" },
    { peso: Math.abs(m.saturacao - 0.4), texto: m.saturacao >= 0.4 ? "o colorido intenso da foto" : "o colorido apagado da foto" },
    { peso: Math.abs(m.contraste - 0.5), texto: m.contraste >= 0.5 ? "o contraste marcado da foto" : "a imagem suave da foto" }
  ];
  return t.sort((a, b) => b.peso - a.peso).map((x) => x.texto);
}

const PEDE: Record<Clima, string[]> = {
  euforia: ["pede algo para cima", "chama música para dançar", "tem clima de festa"],
  calmaria: ["pede calma", "combina com algo leve", "tem cara de fim de tarde"],
  tensao: ["pede intensidade", "deixa uma tensão no ar", "chama algo mais pesado"],
  melancolia: ["pede algo introspectivo", "puxa para a saudade", "tem clima de fone e janela"]
};

function minutos(ms: number): string {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Uma frase curta sobre a música a partir da duração e do ano devolvidos pelo iTunes. */
function fraseDaFaixa(f: Faixa, clima: Clima, variante: number): string {
  const opcoes: string[] = [];
  if (f.duracaoMs) {
    const d = minutos(f.duracaoMs);
    const agitado = clima === "euforia" || clima === "tensao";
    if (f.duracaoMs < 165000) opcoes.push(agitado ? `São ${d}, curta e direta.` : `Curta: ${d}.`);
    else if (f.duracaoMs > 270000) opcoes.push(agitado ? `Tem ${d} para crescer.` : `São ${d}, sem pressa.`);
    else opcoes.push(`Dura ${d}.`);
  }
  if (f.ano) {
    const agora = new Date().getFullYear();
    if (f.ano >= agora - 3) opcoes.push(`Saiu em ${f.ano}.`);
    else if (f.ano >= 2000) opcoes.push(`É de ${f.ano}.`);
    else opcoes.push(`Um clássico dos anos ${String(f.ano).slice(2, 3)}0.`);
  }
  return opcoes[variante % Math.max(1, opcoes.length)] ?? "";
}

function frase(c: Candidata, m: Medidas, leitura: Leitura, indice: number): string {
  const { faixa: f, genero, termo } = c;
  const v = Math.round(leitura.valencia * 100);
  const e = Math.round(leitura.energia * 100);
  const tracos = tracosDaFoto(m);
  const foto = tracos[indice % tracos.length] ?? "a foto";
  const pedes = PEDE[leitura.clima];
  const pede = pedes[(hash(f.id) + indice) % pedes.length] ?? "";
  const sobre = fraseDaFaixa(f, leitura.clima, hash(f.id) + indice);
  const gen = f.genero || genero.nome;
  const gosto = c.noGosto ? `É ${gen}, um dos gêneros que você marcou.` : `É ${gen}; veio da busca por "${termo}".`;
  const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
  const modelos = [
    `${cap(foto)} ${pede}. ${gosto} ${sobre}`,
    `Valência ${v} e energia ${e}: ${NOME_CLIMA[leitura.clima].nome.toLowerCase()}. ${gosto} ${sobre}`,
    `${sobre} Combina com ${foto}, que ${pede}. ${gosto}`,
    `${gosto} Entrou porque ${foto} ${pede}. ${sobre}`
  ];
  return (modelos[indice % modelos.length] ?? "").replace(/\s+/g, " ").trim();
}

/* ---------- busca ---------- */

async function buscarPorClima(clima: Clima, generos: Genero[], semente: number): Promise<Candidata[]> {
  const palavras = PALAVRAS_CLIMA[clima];
  const listas = await Promise.all(
    generos.map(async (g, i) => {
      const palavra = palavras[(semente + i) % palavras.length] ?? "";
      const termo = `${g.busca} ${palavra}`;
      const lista = await buscar(termo, 20);
      return lista
        .filter((f) => f.previa)
        .map((f) => ({ faixa: f, genero: g, termo, noGosto: noGosto(f, g) }))
        .sort((a, b) => Number(b.noGosto) - Number(a.noGosto));
    })
  );
  const artistas = new Set<string>();
  const ids = new Set<string>();
  const escolhidas: Candidata[] = [];
  for (let rodada = 0; escolhidas.length < 4 && rodada < 20; rodada++) {
    let achou = false;
    for (const lista of listas) {
      const c = lista[rodada];
      if (!c) continue;
      achou = true;
      const art = c.faixa.artista.toLowerCase();
      if (escolhidas.length >= 4 || ids.has(c.faixa.id) || artistas.has(art)) continue;
      escolhidas.push(c);
      ids.add(c.faixa.id);
      artistas.add(art);
    }
    if (!achou) break;
  }
  return escolhidas;
}

function reserva(leitura: Leitura, generos: string[]): Faixa[] {
  return CATALOGO_RESERVA.map((f, i) => {
    const d = Math.hypot(leitura.valencia - f.valencia, leitura.energia - f.energia) / Math.SQRT2;
    return { f, i, nota: (1 - d) * (generos.includes(f.genero) ? 1 : 0.72) };
  })
    .sort((a, b) => b.nota - a.nota)
    .slice(0, 4)
    .map(({ f, i }) => ({
      id: `reserva-${i}`,
      titulo: f.titulo,
      artista: f.artista,
      album: "",
      capa: "",
      capaPequena: "",
      previa: null,
      genero: GENEROS.find((g) => g.id === f.genero)?.nome ?? f.genero,
      link: "",
      ano: null,
      duracaoMs: null,
      fonte: "reserva" as const,
      motivo: `Música de exemplo (fictícia): valência ${Math.round(f.valencia * 100)} e energia ${Math.round(f.energia * 100)}, perto das da foto.`
    }));
}

export async function analisar(fonte: FonteImagem, idsGeneros: string[]): Promise<ResultadoAnalise> {
  const medidas = lerImagem(fonte);
  const generos = generosDe(idsGeneros);
  const semente = hash(`${medidas.brilho}|${medidas.saturacao}|${medidas.contraste}|${idsGeneros.join()}`);
  const leitura: Leitura = {
    clima: climaDe(medidas.valencia, medidas.energia),
    valencia: medidas.valencia,
    energia: medidas.energia,
    medidas
  };
  try {
    const candidatas = await buscarPorClima(leitura.clima, generos, semente);
    if (candidatas.length === 0) throw new Error("sem resultados");
    const faixas = candidatas.map((c, i) => ({ ...c.faixa, motivo: frase(c, medidas, leitura, i) }));
    return {
      leitura,
      faixas,
      aviso: faixas.length < 4 ? "O catálogo trouxe menos de 4 músicas para esse clima e gosto. Tente outros gêneros." : undefined
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    const conhecido = msg.startsWith("O catálogo") || msg.startsWith("Sem conexão");
    return {
      leitura,
      faixas: reserva(leitura, idsGeneros),
      aviso: `${conhecido ? msg : "O catálogo de músicas não respondeu."} Mostrando músicas de exemplo, sem prévia.`
    };
  }
}
