"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useApp } from "@/lib/estado";
import { usePlayer } from "@/lib/player";
import { NOME_CLIMA } from "@/lib/dados";
import { cobrirCanvas } from "@/lib/analise";
import { Icone, Simbolo } from "./Icone";
import { FaixaLinha } from "./FaixaLinha";
import ui from "./ui.module.css";
import s from "./MomentoTela.module.css";

export function Vazio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className={s.vazio}>
      <h1 className={ui.titulo}>{titulo}</h1>
      <p className={ui.lead}>{texto}</p>
      <div className={ui.centro}>
        <Link href="/" className={ui.botao}>
          <Icone nome="camera" tamanho={18} />
          Escolher foto
        </Link>
      </div>
    </div>
  );
}

export function Carregando() {
  return (
    <div aria-busy="true" aria-label="Carregando">
      <div className={`${ui.esqueleto} ${s.esqTitulo}`} />
      <div className={`${ui.esqueleto} ${s.esqCartao}`} />
      {[0, 1, 2].map((i) => (
        <div key={i} className={s.esqLinha}>
          <div className={ui.esqueleto} />
          <div className={ui.esqueleto} />
        </div>
      ))}
    </div>
  );
}

export function MomentoTela() {
  const { estado, hidratado, atualizar, fonte } = useApp();
  const p = usePlayer();
  const router = useRouter();
  const mini = useRef<HTMLCanvasElement>(null);
  const l = estado.leitura;

  useEffect(() => {
    if (mini.current) cobrirCanvas(mini.current, fonte);
  }, [fonte, l]);

  if (!hidratado) return <Carregando />;
  if (!l || estado.sugestoes.length === 0) {
    return <Vazio titulo="Qual a trilha desse momento?" texto="Escolha uma foto e o seu gosto. As 4 músicas aparecem aqui." />;
  }

  const clima = NOME_CLIMA[l.clima];
  const medidas: [string, number][] = [
    ["Brilho", l.medidas.brilho],
    ["Saturação", l.medidas.saturacao],
    ["Temperatura", l.medidas.temperatura],
    ["Contraste", l.medidas.contraste]
  ];

  function criarSala() {
    const fila = estado.sugestoes.filter((f) => f.previa);
    atualizar(() => ({ sala: { fila: fila.length ? fila : estado.sugestoes, atual: 0, votos: [], segurada: false } }));
    p.parar();
    router.push("/sala/");
  }

  return (
    <>
      <h1 className={ui.titulo}>
        Seu momento: <span className={ui.destaque}>{clima.nome}</span>
      </h1>
      <p className={ui.lead}>Uma foto {clima.frase}. Estas são as 4 músicas que mais combinam com ela no seu gosto.</p>
      {estado.aviso && (
        <p className={`${ui.faixa} ${ui.faixaErro}`} role="status">
          <Icone nome="alerta" tamanho={18} />
          <span>{estado.aviso}</span>
        </p>
      )}

      <div className={ui.cartao}>
        <div className={ui.cartaoFoto}>
          <canvas ref={mini} width={608} height={390} aria-hidden="true" />
          <p className={ui.rotulo}>
            <Simbolo largura={22} cor="#ffffff" />
            <span>{estado.fotoNome}</span>
          </p>
        </div>
        <div className={`${ui.cartaoTexto} ${s.leitura}`}>
          <div className={s.quadro} role="img" aria-label={`Valência ${Math.round(l.valencia * 100)} de 100, energia ${Math.round(l.energia * 100)} de 100: ${clima.nome}`}>
            <span className={s.q1}>Tensão</span>
            <span className={s.q2}>Euforia</span>
            <span className={s.q3}>Melancolia</span>
            <span className={s.q4}>Calmaria</span>
            <i style={{ left: `${l.valencia * 100}%`, top: `${(1 - l.energia) * 100}%` }} />
          </div>
          <div className={s.numeros}>
            <p><b>{Math.round(l.valencia * 100)}</b> valência</p>
            <p><b>{Math.round(l.energia * 100)}</b> energia</p>
            <dl className={s.medidas}>
              {medidas.map(([nome, v]) => (
                <div key={nome}>
                  <dt>{nome}</dt>
                  <dd>{Math.round(v * 100)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <p className={ui.nota}>
        Brilho, saturação, temperatura e contraste são medidos no seu navegador e viram valência e energia por regras fixas. Não há reconhecimento de imagem.
      </p>

      <h2 className={ui.secao}>4 músicas para esse momento</h2>
      {p.erro && (
        <p className={`${ui.faixa} ${ui.faixaErro}`} role="alert">
          <Icone nome="alerta" tamanho={18} />
          <span>{p.erro}</span>
        </p>
      )}
      <div>
        {estado.sugestoes.map((f) => (
          <FaixaLinha
            key={f.id}
            faixa={f}
            acao={
              <button
                type="button"
                className={ui.linhaAcao}
                aria-label={`Criar cartão com ${f.titulo}`}
                onClick={() => {
                  atualizar(() => ({ faixaCartao: f.id }));
                  router.push("/cartao/");
                }}
              >
                <Icone nome="enviar" />
              </button>
            }
            extra={
              <p className={s.motivo}>
                {f.motivo}
                {f.link && (
                  <>
                    {" "}
                    <a href={f.link} target="_blank" rel="noopener noreferrer" className={s.externo}>
                      Música completa<span className="visualmente-oculto"> de {f.titulo} (abre em nova aba)</span>
                      <Icone nome="externo" tamanho={13} />
                    </a>
                  </>
                )}
              </p>
            }
          />
        ))}
      </div>
      <p className={ui.nota}>Prévias de 30 s, capas e nomes vêm da busca pública do iTunes.</p>

      <div className={ui.centro}>
        <button type="button" className={`${ui.botao} ${ui.botaoLargo}`} onClick={criarSala}>
          <Icone nome="pessoas" tamanho={18} />
          Criar sala
        </button>
        <p className={ui.nota}>A sala toca essas músicas com os seus amigos.</p>
      </div>
    </>
  );
}
