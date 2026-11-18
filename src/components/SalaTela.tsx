"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { registrarHistorico, useApp } from "@/lib/estado";
import { usePlayer } from "@/lib/player";
import { AMIGOS, PRECO_SEGURAR, SALAS_ARTISTAS, VOTOS_PARA_PULAR } from "@/lib/dados";
import { cobrirCanvas, hash } from "@/lib/analise";
import type { Faixa } from "@/lib/itunes";
import { Icone, Simbolo } from "./Icone";
import { FaixaLinha } from "./FaixaLinha";
import { Carregando } from "./MomentoTela";
import ui from "./ui.module.css";
import s from "./SalaTela.module.css";

const DURACAO_PADRAO = 30;
const real = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const tempo = (seg: number) => `${Math.floor(seg / 60)}:${String(Math.floor(seg % 60)).padStart(2, "0")}`;

/** Amigos fictícios que votam para pular em momentos fixos de cada prévia (0 a 3 votos). */
function votosAgendados(f: Faixa): { amigo: string; em: number }[] {
  const h = hash(`${f.id}votos`);
  const quantos = h % 4;
  const inicio = (h >>> 3) % AMIGOS.length;
  return Array.from({ length: quantos }, (_, k) => ({
    amigo: AMIGOS[(inicio + k) % AMIGOS.length]?.id ?? "bia",
    em: Math.round(DURACAO_PADRAO * (0.18 + k * 0.17 + ((h >>> (k + 6)) & 7) / 100))
  }));
}

function nomePessoa(id: string): string {
  return id === "voce" ? "Você" : (AMIGOS.find((a) => a.id === id)?.nome ?? id);
}

function Avatar({ id, mini }: { id: string; mini?: boolean }) {
  const cor = id === "voce" ? "#efdeef" : (AMIGOS.find((a) => a.id === id)?.cor ?? "#b492b5");
  return (
    <span className={`${s.avatar} ${mini ? s.avatarMini : ""}`} style={{ background: cor }} title={nomePessoa(id)} aria-hidden="true">
      {nomePessoa(id).charAt(0)}
    </span>
  );
}

export function SalaTela() {
  const { estado, hidratado, atualizar, fonte, avisar } = useApp();
  const p = usePlayer();
  const capa = useRef<HTMLCanvasElement>(null);
  const [aba, setAba] = useState<"musicas" | "artistas">("musicas");
  const [tempoSim, setTempoSim] = useState(0);
  const [simulando, setSimulando] = useState(false);
  const sala = estado.sala;
  const faixa = sala.fila[sala.atual];

  useEffect(() => {
    if (capa.current) cobrirCanvas(capa.current, fonte);
  }, [fonte, hidratado, faixa]);

  /* sai da sala: para o som */
  const parar = p.parar;
  useEffect(() => () => parar(), [parar]);

  const avancar = useCallback(
    (motivo: "fim" | "pulo" | "manual") => {
      setTempoSim(0);
      atualizar((e) => {
        const atual = e.sala.fila[e.sala.atual];
        const hist = atual ? registrarHistorico(e, atual, motivo === "pulo" ? "pulos" : "plays") : {};
        const prox = e.sala.fila.length ? (e.sala.atual + 1) % e.sala.fila.length : 0;
        return { ...(motivo === "manual" ? {} : hist), sala: { ...e.sala, atual: prox, votos: [], segurada: false } };
      });
    },
    [atualizar]
  );
  const avancarRef = useRef(avancar);
  avancarRef.current = avancar;

  const tocandoAgora = faixa ? (faixa.previa ? p.atual === faixa.id && p.tocando : simulando) : false;
  const t = faixa ? (faixa.previa ? (p.atual === faixa.id ? p.tempo : 0) : tempoSim) : 0;
  const dur = faixa?.previa && p.atual === faixa.id ? p.duracao : DURACAO_PADRAO;

  /* quando a faixa muda e a sala estava tocando, segue tocando a próxima */
  const deveTocar = useRef(false);
  useEffect(() => {
    if (!faixa || !deveTocar.current) return;
    if (faixa.previa) p.tocar(faixa, () => avancarRef.current("fim"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faixa?.id]);

  /* relógio simulado para músicas sem prévia (catálogo reserva) */
  useEffect(() => {
    if (!simulando || !faixa || faixa.previa) return;
    const id = setInterval(() => {
      setTempoSim((x) => {
        if (x + 1 >= DURACAO_PADRAO) {
          avancarRef.current("fim");
          return 0;
        }
        return x + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [simulando, faixa]);

  /* votos dos amigos durante a prévia */
  useEffect(() => {
    if (!faixa || sala.segurada || !tocandoAgora) return;
    const novos = votosAgendados(faixa).filter((v) => t >= v.em && !sala.votos.includes(v.amigo));
    if (!novos.length) return;
    novos.forEach((v) => avisar(`${nomePessoa(v.amigo)} votou para pular.`));
    atualizar((e) => ({ sala: { ...e.sala, votos: [...e.sala.votos, ...novos.map((v) => v.amigo)] } }));
  }, [t, faixa, sala.segurada, sala.votos, tocandoAgora, atualizar, avisar]);

  /* quatro votos: pula */
  useEffect(() => {
    if (!faixa || sala.segurada || sala.votos.length < VOTOS_PARA_PULAR) return;
    avisar(`A sala pulou "${faixa.titulo}".`);
    avancarRef.current("pulo");
  }, [sala.votos.length, sala.segurada, faixa, avisar]);

  if (!hidratado) return <Carregando />;

  const pessoas = ["voce", ...AMIGOS.map((a) => a.id)];
  const n = sala.votos.length;
  const votei = sala.votos.includes("voce");

  function alternarTocar() {
    if (!faixa) return;
    if (faixa.previa) {
      deveTocar.current = !(p.atual === faixa.id && p.tocando);
      p.alternar(faixa, () => avancarRef.current("fim"));
    } else {
      deveTocar.current = !simulando;
      setSimulando((x) => !x);
    }
  }

  function votar() {
    atualizar((e) => ({
      sala: { ...e.sala, votos: e.sala.votos.includes("voce") ? e.sala.votos.filter((v) => v !== "voce") : [...e.sala.votos, "voce"] }
    }));
  }

  function segurar() {
    atualizar((e) => ({ sala: { ...e.sala, segurada: true, votos: [] }, gastoSegurar: Math.round((e.gastoSegurar + PRECO_SEGURAR) * 100) / 100 }));
    avisar(`Música segurada. Cobrança de ${real(PRECO_SEGURAR)} simulada.`);
  }

  /* ranking local: execuções completas valem 2, pulos tiram 1 */
  const historico = Object.values(estado.historico);
  const ranking =
    aba === "musicas"
      ? historico.map((h) => ({ nome: h.faixa.titulo, sub: h.faixa.artista, valor: h.plays * 2 - h.pulos }))
      : Object.entries(
          historico.reduce<Record<string, number>>((acc, h) => {
            acc[h.faixa.artista] = (acc[h.faixa.artista] ?? 0) + h.plays * 2 - h.pulos;
            return acc;
          }, {})
        ).map(([nome, valor]) => ({ nome, sub: "", valor }));
  ranking.sort((a, b) => b.valor - a.valor);
  const top = ranking.slice(0, 6);
  const max = Math.max(1, ...top.map((r) => Math.abs(r.valor)));

  return (
    <>
      <h1 className={ui.titulo}>Sala musical</h1>
      <p className={s.sub}>Ao vivo · {pessoas.length} pessoas ouvindo a trilha da sua foto</p>
      <ul className={s.pessoas} aria-label="Quem está na sala">
        {pessoas.map((id) => (
          <li key={id}>
            <Avatar id={id} />
            <span>{nomePessoa(id)}</span>
          </li>
        ))}
      </ul>

      {!faixa ? (
        <div className={ui.faixa}>
          <Icone nome="nota" tamanho={18} />
          <span>
            A sala está vazia. Analise uma foto e toque em <b>Criar sala</b> para ouvir as 4 músicas com os amigos.{" "}
            <Link href="/">Escolher foto</Link>
          </span>
        </div>
      ) : (
        <>
          <section className={ui.cartao} aria-labelledby="tocando-titulo">
            <div className={ui.cartaoFoto}>
              {faixa.capa ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={faixa.capa} alt="" className={s.capaFundo} />
              ) : (
                <canvas ref={capa} width={608} height={390} aria-hidden="true" />
              )}
              <button type="button" className={`${ui.play} ${ui.playCentro}`} onClick={alternarTocar} aria-label={tocandoAgora ? "Pausar" : "Tocar"}>
                <Icone nome={tocandoAgora ? "pausa" : "tocar"} tamanho={32} />
              </button>
              <p className={ui.rotulo}>
                <Simbolo largura={22} cor="#ffffff" />
                <span>{tocandoAgora ? "Tocando agora" : "Pausado"}</span>
              </p>
            </div>
            <div className={`${ui.cartaoTexto} ${s.info}`}>
              <h2 id="tocando-titulo" className={s.faixaTitulo}>
                {faixa.titulo} - {faixa.artista}
              </h2>
              <p className={s.faixaSub}>{faixa.previa ? "Prévia de 30 s" : "Música de exemplo, sem áudio"}</p>
              <div
                className={s.progresso}
                role="progressbar"
                aria-label="Progresso da música"
                aria-valuemin={0}
                aria-valuemax={Math.round(dur)}
                aria-valuenow={Math.round(t)}
                aria-valuetext={`${tempo(t)} de ${tempo(dur)}`}
              >
                <i style={{ width: `${Math.min(100, (t / dur) * 100)}%` }} />
              </div>
              <div className={s.tempos}>
                <span>{tempo(t)}</span>
                <span>{tempo(dur)}</span>
              </div>
            </div>
          </section>
          {p.erro && faixa.previa && (
            <p className={`${ui.faixa} ${ui.faixaErro}`} role="alert">
              <Icone nome="alerta" tamanho={18} />
              <span>{p.erro}</span>
            </p>
          )}

          <div className={s.votacao}>
            <div className={s.votosLinha}>
              <p className={s.votosNum} aria-live="polite">
                {sala.segurada ? (
                  <><b>Segurada</b> · votação anulada</>
                ) : (
                  <><b>{n}</b>/{VOTOS_PARA_PULAR} votos para pular</>
                )}
              </p>
              <ul className={s.votantes} aria-label="Quem votou">
                {sala.votos.map((v) => (
                  <li key={v}>
                    <Avatar id={v} mini />
                    <span className="visualmente-oculto">{nomePessoa(v)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={s.votosBarra} aria-hidden="true">
              <i style={{ width: `${sala.segurada ? 0 : (n / VOTOS_PARA_PULAR) * 100}%` }} />
            </div>
            <div className={ui.acoes}>
              <button type="button" className={`${ui.botao} ${ui.botaoContorno}`} onClick={votar} disabled={sala.segurada} aria-pressed={votei}>
                <Icone nome="pular" tamanho={18} />
                {votei ? "Tirar meu voto" : "Votar para pular"}
              </button>
              <button type="button" className={ui.botao} onClick={segurar} disabled={sala.segurada}>
                <Icone nome="cadeado" tamanho={18} />
                Segurar · {real(PRECO_SEGURAR)}
              </button>
            </div>
            <p className={ui.nota}>
              {sala.segurada
                ? "Você pagou para manter esta música até o fim. Na próxima, a votação volta."
                : n === VOTOS_PARA_PULAR - 1
                  ? "Falta um voto para pular."
                  : `Com ${VOTOS_PARA_PULAR} votos a música pula. Pagando, dá para anular a votação.`}
            </p>
          </div>
        </>
      )}

      <div className={s.plano}>
        <label className={s.chave}>
          <input type="checkbox" checked={estado.premium} onChange={(e) => atualizar(() => ({ premium: e.target.checked }))} />
          <span className={s.trilho} aria-hidden="true" />
          <span>
            Premium <small>(simulado)</small>
          </span>
        </label>
        <p className={ui.nota}>
          {estado.gastoSegurar > 0
            ? `Pagamentos de votação: ${real(estado.gastoSegurar)}`
            : estado.premium
              ? "Sem anúncios e com ingressos."
              : "Plano gratuito, com anúncios."}
        </p>
      </div>
      {!estado.premium && (
        <aside className={s.anuncio} aria-label="Anúncio">
          <span className={s.anuncioTag}>Anúncio</span>
          <p>Na versão gratuita entra um anúncio a cada 3 músicas.</p>
        </aside>
      )}

      {sala.fila.length > 1 && (
        <>
          <div className={s.secaoLinha}>
            <h2 className={ui.secao}>Próximas</h2>
            <button type="button" className={ui.linhaAcao} onClick={() => avancar("manual")} aria-label="Avançar para a próxima música">
              <Icone nome="pular" />
            </button>
          </div>
          <div>
            {sala.fila.slice(1).map((_, k) => {
              const f = sala.fila[(sala.atual + 1 + k) % sala.fila.length];
              return f ? <FaixaLinha key={`${f.id}-${k}`} faixa={f} acao={<span className={ui.linhaDir}>{k + 1}ª</span>} /> : null;
            })}
          </div>
        </>
      )}

      <div className={s.secaoLinha}>
        <h2 className={ui.secao}>Ranking</h2>
        <div className={s.segmentado} role="group" aria-label="Tipo de ranking">
          <button type="button" aria-pressed={aba === "musicas"} onClick={() => setAba("musicas")}>Músicas</button>
          <button type="button" aria-pressed={aba === "artistas"} onClick={() => setAba("artistas")}>Artistas</button>
        </div>
      </div>
      {top.length === 0 ? (
        <p className={ui.faixa}>
          <Icone nome="nota" tamanho={18} />
          <span>O ranking aparece quando a sala ouvir as primeiras músicas. Música ouvida até o fim soma pontos; pulada perde.</span>
        </p>
      ) : (
        <ol className={ui.lista}>
          {top.map((r, i) => (
            <li key={r.nome} className={ui.linha}>
              <span className={ui.linhaN}>{i + 1}</span>
              <span className={ui.linhaTxt}>
                <b>{r.nome}</b>
                {r.sub && <small>{r.sub}</small>}
                <span className={s.rankBarra} aria-hidden="true">
                  <i style={{ width: `${Math.max(4, (Math.max(0, r.valor) / max) * 100)}%` }} />
                </span>
              </span>
              <span className={ui.linhaDir}>{r.valor} pts</span>
            </li>
          ))}
        </ol>
      )}

      <h2 className={ui.secao}>Salas com artistas</h2>
      <ul className={s.salas}>
        {SALAS_ARTISTAS.map((sa) => {
          const tem = estado.ingressos.includes(sa.id);
          return (
            <li key={sa.id} className={s.salaArtista}>
              <div>
                <p className={s.quando}>{sa.quando}</p>
                <h3>{sa.titulo}</h3>
                <p className={s.artista}>{sa.artista} · {sa.vagas} lugares</p>
              </div>
              <button
                type="button"
                className={`${ui.botao} ${ui.botaoPequeno} ${tem ? ui.botaoFeito : ""}`}
                aria-pressed={tem}
                onClick={() => {
                  if (!estado.premium && !tem) {
                    avisar("Ingressos fazem parte do Premium. Ative o Premium (simulado) acima.");
                    return;
                  }
                  atualizar((e) => ({ ingressos: tem ? e.ingressos.filter((x) => x !== sa.id) : [...e.ingressos, sa.id] }));
                  avisar(tem ? "Ingresso cancelado." : `Ingresso garantido para ${sa.titulo} (simulado).`);
                }}
              >
                {tem ? "Garantido" : `Ingresso ${sa.preco}`}
              </button>
            </li>
          );
        })}
      </ul>
      <p className={ui.nota}>Artistas e salas fictícios. Compra simulada, nenhum pagamento é feito.</p>
    </>
  );
}
