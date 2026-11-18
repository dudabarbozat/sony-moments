/* Dados de apoio. Amigos, salas com artistas e o catálogo reserva são fictícios. */

export type Clima = "euforia" | "calmaria" | "tensao" | "melancolia";

export interface Genero {
  id: string;
  nome: string;
  /** palavra usada na busca do catálogo */
  busca: string;
  /** nomes de gênero do catálogo que contam como "do seu gosto" */
  catalogo: string[];
}

export const GENEROS: Genero[] = [
  { id: "mpb", nome: "MPB", busca: "mpb", catalogo: ["MPB", "Bossa Nova"] },
  { id: "pop", nome: "Pop", busca: "pop", catalogo: ["Pop", "Pop Latino"] },
  { id: "rock", nome: "Rock", busca: "rock", catalogo: ["Rock", "Alternativo", "Hard Rock"] },
  { id: "eletronica", nome: "Eletrônica", busca: "electronic", catalogo: ["Eletrônica", "Dance", "House"] },
  { id: "samba", nome: "Samba e pagode", busca: "samba", catalogo: ["Samba", "Pagode"] },
  { id: "funk", nome: "Funk", busca: "funk", catalogo: ["Baile Funk", "Funk"] },
  { id: "sertanejo", nome: "Sertanejo", busca: "sertanejo", catalogo: ["Sertanejo"] },
  { id: "indie", nome: "Indie", busca: "indie", catalogo: ["Alternativo", "Indie Pop", "Indie Rock"] },
  { id: "rap", nome: "Rap", busca: "rap", catalogo: ["Hip-Hop/Rap", "Rap"] },
  { id: "jazz", nome: "Jazz e lo-fi", busca: "jazz", catalogo: ["Jazz", "Jazz latino", "Lo-Fi"] }
];

/** Palavras que costumam aparecer em títulos de músicas de cada clima. */
export const PALAVRAS_CLIMA: Record<Clima, string[]> = {
  euforia: ["festa", "verão", "sol", "dançar", "alegria"],
  calmaria: ["mar", "domingo", "paz", "tarde", "brisa"],
  tensao: ["noite", "cidade", "fogo", "tempestade", "corre"],
  melancolia: ["saudade", "chuva", "lua", "sozinho", "adeus"]
};

export const NOME_CLIMA: Record<Clima, { nome: string; frase: string }> = {
  euforia: { nome: "Euforia", frase: "clara, quente e agitada" },
  calmaria: { nome: "Calmaria", frase: "clara e tranquila" },
  tensao: { nome: "Tensão", frase: "escura e intensa" },
  melancolia: { nome: "Melancolia", frase: "fria e contida" }
};

export interface Amigo { id: string; nome: string; cor: string }

export const AMIGOS: Amigo[] = [
  { id: "bia", nome: "Bia", cor: "#e7cff0" },
  { id: "caio", nome: "Caio", cor: "#b492b5" },
  { id: "lena", nome: "Lena", cor: "#f0b6e2" },
  { id: "rafa", nome: "Rafa", cor: "#c7d3dd" },
  { id: "teo", nome: "Téo", cor: "#d9a7d4" }
];

export const VOTOS_PARA_PULAR = 4;
export const PRECO_SEGURAR = 0.99;
export const PERFIL = "Tina";

export interface SalaArtista { id: string; artista: string; titulo: string; quando: string; preco: string; vagas: number }

export const SALAS_ARTISTAS: SalaArtista[] = [
  { id: "s1", artista: "Lume Ferraz", titulo: "Varanda acústica", quando: "sáb · 21h", preco: "R$ 12", vagas: 38 },
  { id: "s2", artista: "Selva Néon", titulo: "Set de madrugada", quando: "sex · 23h30", preco: "R$ 15", vagas: 112 },
  { id: "s3", artista: "Quintal Aberto", titulo: "Roda ao vivo", quando: "dom · 16h", preco: "R$ 10", vagas: 64 }
];

/** Catálogo reserva, inventado, usado só quando o catálogo real não responde. */
export const CATALOGO_RESERVA: { titulo: string; artista: string; genero: string; valencia: number; energia: number }[] = [
  { titulo: "Varanda às seis", artista: "Lume Ferraz", genero: "mpb", valencia: 0.72, energia: 0.3 },
  { titulo: "Saudade de concreto", artista: "Lume Ferraz", genero: "mpb", valencia: 0.25, energia: 0.28 },
  { titulo: "Maré cheia", artista: "Duo Maresia", genero: "mpb", valencia: 0.8, energia: 0.55 },
  { titulo: "Néon na pele", artista: "Kaio Satélite", genero: "pop", valencia: 0.85, energia: 0.82 },
  { titulo: "Céu de papel", artista: "Bruma Alta", genero: "pop", valencia: 0.3, energia: 0.45 },
  { titulo: "Asfalto quente", artista: "Concreto Azul", genero: "rock", valencia: 0.5, energia: 0.92 },
  { titulo: "Último trem", artista: "Os Ventiladores", genero: "rock", valencia: 0.35, energia: 0.6 },
  { titulo: "Pulso 128", artista: "Selva Néon", genero: "eletronica", valencia: 0.6, energia: 0.95 },
  { titulo: "Vidro fosco", artista: "Halo Prisma", genero: "eletronica", valencia: 0.4, energia: 0.35 },
  { titulo: "Roda de domingo", artista: "Quintal Aberto", genero: "samba", valencia: 0.92, energia: 0.75 },
  { titulo: "Chuva no cais", artista: "Celeste Moura", genero: "samba", valencia: 0.35, energia: 0.4 },
  { titulo: "Baile da laje", artista: "MC Centelha", genero: "funk", valencia: 0.8, energia: 0.94 },
  { titulo: "Coração de vidro", artista: "DJ Orvalho", genero: "funk", valencia: 0.3, energia: 0.72 },
  { titulo: "Estrada de terra", artista: "Serra e Rio", genero: "sertanejo", valencia: 0.6, energia: 0.55 },
  { titulo: "Copo vazio", artista: "Serra e Rio", genero: "sertanejo", valencia: 0.22, energia: 0.5 },
  { titulo: "Polaroide", artista: "Cinema Mudo", genero: "indie", valencia: 0.58, energia: 0.45 },
  { titulo: "Domingo cinza", artista: "Cinema Mudo", genero: "indie", valencia: 0.18, energia: 0.3 },
  { titulo: "Linha 4", artista: "Vulto Norte", genero: "rap", valencia: 0.3, energia: 0.78 },
  { titulo: "Primeiro salário", artista: "Rima Larga", genero: "rap", valencia: 0.7, energia: 0.66 },
  { titulo: "Café às duas", artista: "Trio Fumaça", genero: "jazz", valencia: 0.5, energia: 0.2 },
  { titulo: "Sol de vitrine", artista: "Íris Quartzo", genero: "jazz", valencia: 0.75, energia: 0.38 }
];
