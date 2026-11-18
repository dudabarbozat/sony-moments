"use client";
/* Um único <audio> para as prévias de 30 s servidas pela Apple. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Faixa } from "./itunes";

interface Player {
  atual: string | null;
  tocando: boolean;
  carregando: boolean;
  tempo: number;
  duracao: number;
  erro: string | null;
  tocar: (f: Faixa, aoTerminar?: () => void) => void;
  alternar: (f: Faixa, aoTerminar?: () => void) => void;
  pausar: () => void;
  parar: () => void;
}

const Ctx = createContext<Player | null>(null);

export function ProvedorPlayer({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const fim = useRef<(() => void) | undefined>(undefined);
  const [atual, setAtual] = useState<string | null>(null);
  const [tocando, setTocando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [tempo, setTempo] = useState(0);
  const [duracao, setDuracao] = useState(30);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const a = new Audio();
    a.preload = "none";
    audio.current = a;
    const aoTempo = () => setTempo(a.currentTime);
    const aoDuracao = () => setDuracao(Number.isFinite(a.duration) && a.duration > 0 ? a.duration : 30);
    const aoTocar = () => { setTocando(true); setCarregando(false); };
    const aoPausar = () => setTocando(false);
    const aoEsperar = () => setCarregando(true);
    const aoPronto = () => setCarregando(false);
    const aoFim = () => { setTocando(false); setTempo(0); fim.current?.(); };
    const aoErro = () => { setTocando(false); setCarregando(false); setErro("Não deu para tocar a prévia desta música."); };
    a.addEventListener("timeupdate", aoTempo);
    a.addEventListener("durationchange", aoDuracao);
    a.addEventListener("playing", aoTocar);
    a.addEventListener("pause", aoPausar);
    a.addEventListener("waiting", aoEsperar);
    a.addEventListener("canplay", aoPronto);
    a.addEventListener("ended", aoFim);
    a.addEventListener("error", aoErro);
    return () => {
      a.pause();
      a.removeAttribute("src");
      a.removeEventListener("timeupdate", aoTempo);
      a.removeEventListener("durationchange", aoDuracao);
      a.removeEventListener("playing", aoTocar);
      a.removeEventListener("pause", aoPausar);
      a.removeEventListener("waiting", aoEsperar);
      a.removeEventListener("canplay", aoPronto);
      a.removeEventListener("ended", aoFim);
      a.removeEventListener("error", aoErro);
    };
  }, []);

  const tocar = useCallback((f: Faixa, aoTerminar?: () => void) => {
    const a = audio.current;
    if (!a || !f.previa) return;
    fim.current = aoTerminar;
    setErro(null);
    if (a.src !== f.previa) {
      a.src = f.previa;
      setTempo(0);
      setDuracao(30);
    }
    setAtual(f.id);
    setCarregando(true);
    a.play().catch((e: unknown) => {
      setCarregando(false);
      if (e instanceof DOMException && e.name === "NotAllowedError") setErro("Toque em play para ouvir.");
      else if (!(e instanceof DOMException && e.name === "AbortError")) setErro("Não deu para tocar a prévia desta música.");
    });
  }, []);

  const pausar = useCallback(() => audio.current?.pause(), []);

  const parar = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    a.pause();
    fim.current = undefined;
    setAtual(null);
    setTempo(0);
  }, []);

  const alternar = useCallback(
    (f: Faixa, aoTerminar?: () => void) => {
      if (atual === f.id && tocando) pausar();
      else tocar(f, aoTerminar);
    },
    [atual, tocando, pausar, tocar]
  );

  const valor = useMemo(
    () => ({ atual, tocando, carregando, tempo, duracao, erro, tocar, alternar, pausar, parar }),
    [atual, tocando, carregando, tempo, duracao, erro, tocar, alternar, pausar, parar]
  );
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function usePlayer(): Player {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePlayer fora do provedor");
  return c;
}
