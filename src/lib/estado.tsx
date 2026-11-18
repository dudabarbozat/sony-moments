"use client";
/* Estado do app salvo no localStorage (com try/catch), foto atual em memória (cenas de exemplo carregadas sob demanda) e avisos. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Faixa } from "./itunes";
import type { Leitura } from "./recomendar";
import type { FonteImagem } from "./analise";
import { acharCena, carregarCena } from "./cenas";

export interface Sala {
  fila: Faixa[];
  atual: number;
  votos: string[];
  segurada: boolean;
}

export interface Historico {
  faixa: Faixa;
  plays: number;
  pulos: number;
}

export interface Estado {
  generos: string[];
  exemplo: string | null;
  foto: string | null;
  fotoNome: string;
  leitura: Leitura | null;
  sugestoes: Faixa[];
  aviso: string | null;
  faixaCartao: string | null;
  sala: Sala;
  premium: boolean;
  gastoSegurar: number;
  ingressos: string[];
  historico: Record<string, Historico>;
  orientado: boolean;
}

export const ESTADO_PADRAO: Estado = {
  generos: ["mpb", "pop"],
  exemplo: "praia",
  foto: null,
  fotoNome: "Praia ao meio-dia",
  leitura: null,
  sugestoes: [],
  aviso: null,
  faixaCartao: null,
  sala: { fila: [], atual: 0, votos: [], segurada: false },
  premium: false,
  gastoSegurar: 0,
  ingressos: [],
  historico: {},
  orientado: false
};

const CHAVE = "sony-moments.v2";

interface Contexto {
  estado: Estado;
  hidratado: boolean;
  atualizar: (fn: (e: Estado) => Partial<Estado>) => void;
  restaurar: () => void;
  fonte: FonteImagem | null;
  definirFoto: (fonte: FonteImagem, dados: { dataUrl?: string | null; nome: string }) => void;
  escolherCena: (id: string) => void;
  /** foto de cena de exemplo ainda carregando */
  carregandoFoto: boolean;
  erroFoto: string;
  aviso: string;
  avisar: (msg: string) => void;
}

const Ctx = createContext<Contexto | null>(null);

function carregar(): Estado {
  try {
    const t = localStorage.getItem(CHAVE);
    if (t) return { ...ESTADO_PADRAO, ...(JSON.parse(t) as Partial<Estado>) };
  } catch {
    /* armazenamento indisponível */
  }
  return { ...ESTADO_PADRAO };
}

function gravar(e: Estado): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(e));
  } catch {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ ...e, foto: null }));
    } catch {
      /* ignora */
    }
  }
}

export function ProvedorEstado({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(ESTADO_PADRAO);
  const [hidratado, setHidratado] = useState(false);
  const [fonte, setFonte] = useState<FonteImagem | null>(null);
  const [aviso, setAviso] = useState("");
  const [carregandoFoto, setCarregandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* cada troca de foto ganha um número; carregamento que chega atrasado é descartado */
  const pedido = useRef(0);

  const carregarFonte = useCallback((e: Estado) => {
    const n = ++pedido.current;
    setErroFoto("");
    setFonte(null);
    if (e.exemplo) {
      setCarregandoFoto(true);
      carregarCena(e.exemplo)
        .then((img) => {
          if (n === pedido.current) setFonte(img);
        })
        .catch(() => {
          if (n === pedido.current) setErroFoto("Não deu para carregar a cena de exemplo. Verifique a conexão e toque na cena de novo.");
        })
        .finally(() => {
          if (n === pedido.current) setCarregandoFoto(false);
        });
    } else if (e.foto) {
      setCarregandoFoto(false);
      const img = new Image();
      img.onload = () => {
        if (n === pedido.current) setFonte(img);
      };
      img.src = e.foto;
    } else {
      setCarregandoFoto(false);
    }
  }, []);

  useEffect(() => {
    const e = carregar();
    setEstado(e);
    carregarFonte(e);
    setHidratado(true);
  }, [carregarFonte]);

  useEffect(() => {
    if (hidratado) gravar(estado);
  }, [estado, hidratado]);

  const atualizar = useCallback((fn: (e: Estado) => Partial<Estado>) => {
    setEstado((e) => ({ ...e, ...fn(e) }));
  }, []);

  const avisar = useCallback((msg: string) => {
    setAviso(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAviso(""), 3200);
  }, []);

  const restaurar = useCallback(() => {
    try {
      localStorage.removeItem(CHAVE);
    } catch {
      /* ignora */
    }
    const e = { ...ESTADO_PADRAO, orientado: true };
    setEstado(e);
    carregarFonte(e);
    avisar("Dados de exemplo restaurados.");
  }, [avisar, carregarFonte]);

  const definirFoto = useCallback((f: FonteImagem, dados: { dataUrl?: string | null; nome: string }) => {
    pedido.current++;
    setCarregandoFoto(false);
    setErroFoto("");
    setFonte(f);
    setEstado((e) => ({ ...e, exemplo: null, foto: dados.dataUrl ?? null, fotoNome: dados.nome }));
  }, []);

  const escolherCena = useCallback(
    (id: string) => {
      const c = acharCena(id);
      if (!c) return;
      const e = { exemplo: c.id, foto: null, fotoNome: c.nome };
      setEstado((atual) => ({ ...atual, ...e }));
      carregarFonte({ ...ESTADO_PADRAO, ...e });
    },
    [carregarFonte]
  );

  const valor = useMemo(
    () => ({ estado, hidratado, atualizar, restaurar, fonte, definirFoto, escolherCena, carregandoFoto, erroFoto, aviso, avisar }),
    [estado, hidratado, atualizar, restaurar, fonte, definirFoto, escolherCena, carregandoFoto, erroFoto, aviso, avisar]
  );
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useApp(): Contexto {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp fora do provedor");
  return c;
}

export function registrarHistorico(e: Estado, f: Faixa, campo: "plays" | "pulos"): Partial<Estado> {
  const atual = e.historico[f.id] ?? { faixa: f, plays: 0, pulos: 0 };
  return { historico: { ...e.historico, [f.id]: { ...atual, faixa: f, [campo]: atual[campo] + 1 } } };
}
