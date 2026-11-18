"use client";
import type { ReactNode } from "react";
import type { Faixa } from "@/lib/itunes";
import { usePlayer } from "@/lib/player";
import { Icone } from "./Icone";
import ui from "./ui.module.css";
import s from "./FaixaLinha.module.css";

/** Linha de música: capa com play da prévia de 30 s, título, artista e uma ação à direita. */
export function FaixaLinha({ faixa, sub, acao, extra }: { faixa: Faixa; sub?: string; acao?: ReactNode; extra?: ReactNode }) {
  const p = usePlayer();
  const ativa = p.atual === faixa.id;
  const tocando = ativa && p.tocando;
  const semPrevia = !faixa.previa;
  return (
    <div className={s.bloco}>
      <div className={ui.linha} style={{ gridTemplateColumns: "56px minmax(0, 1fr) auto" }}>
        <button
          type="button"
          className={s.capa}
          onClick={() => p.alternar(faixa)}
          disabled={semPrevia}
          aria-label={semPrevia ? `${faixa.titulo}: sem prévia` : `${tocando ? "Pausar" : "Ouvir"} prévia de ${faixa.titulo}, de ${faixa.artista}`}
        >
          {faixa.capaPequena ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={faixa.capaPequena} alt="" width={56} height={56} loading="lazy" />
          ) : (
            <span className={s.semCapa}><Icone nome="nota" /></span>
          )}
          {!semPrevia && (
            <span className={`${s.capaPlay} ${tocando ? s.capaPlayAtiva : ""}`} aria-hidden="true">
              <Icone nome={tocando ? "pausa" : "tocar"} tamanho={20} />
            </span>
          )}
        </button>
        <span className={ui.linhaTxt}>
          <b>{faixa.titulo}</b>
          <small>{sub ?? `${faixa.artista}${faixa.genero ? ` · ${faixa.genero}` : ""}`}</small>
        </span>
        {acao}
      </div>
      {ativa && (
        <div
          className={s.progresso}
          role="progressbar"
          aria-label={`Prévia de ${faixa.titulo}`}
          aria-valuemin={0}
          aria-valuemax={Math.round(p.duracao)}
          aria-valuenow={Math.round(p.tempo)}
        >
          <i style={{ width: `${Math.min(100, (p.tempo / (p.duracao || 30)) * 100)}%` }} />
        </div>
      )}
      {extra}
    </div>
  );
}
