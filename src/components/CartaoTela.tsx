"use client";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/estado";
import { PERFIL } from "@/lib/dados";
import { hash } from "@/lib/analise";
import { baixarBlob, carregarCapa, carregarFontes, desenharCartao, nomeArquivo, paraBlob } from "@/lib/cartao";
import type { Faixa } from "@/lib/itunes";
import { Icone, type NomeIcone } from "./Icone";
import { Carregando, Vazio } from "./MomentoTela";
import ui from "./ui.module.css";
import s from "./CartaoTela.module.css";

function linkPlaylist(f: Faixa, nome: string): string {
  const n = (hash(f.id + nome) % 9000) + 1000;
  return `app.sonymoments/playlist${n}.com`;
}

const OPCOES: { id: string; nome: string; icone: NomeIcone }[] = [
  { id: "mensagem", nome: "Mensagem", icone: "mensagem" },
  { id: "stories", nome: "Stories", icone: "stories" },
  { id: "link", nome: "Copiar convite", icone: "link" }
];

export function CartaoTela() {
  const { estado, hidratado, atualizar, fonte, avisar } = useApp();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [pronto, setPronto] = useState(false);
  const [semCapa, setSemCapa] = useState(false);
  const faixa = estado.sugestoes.find((f) => f.id === estado.faixaCartao) ?? estado.sugestoes[0];

  useEffect(() => {
    let vivo = true;
    if (!faixa || !canvas.current) return;
    setPronto(false);
    Promise.all([carregarFontes(), carregarCapa(faixa.capa)]).then(([, capa]) => {
      if (!vivo || !canvas.current) return;
      desenharCartao(canvas.current, fonte, capa, faixa, { perfil: PERFIL, link: linkPlaylist(faixa, estado.fotoNome) });
      setSemCapa(!capa && !!faixa.capa);
      setPronto(true);
    });
    return () => {
      vivo = false;
    };
  }, [faixa, fonte, estado.fotoNome, hidratado]);

  if (!hidratado) return <Carregando />;
  if (!faixa) return <Vazio titulo="Sem foto, sem cartão" texto="Analise uma foto para criar o cartão musical." />;

  const texto = `Curta esse cartão musical da ${PERFIL}: "${faixa.titulo}", de ${faixa.artista}. ${faixa.link || linkPlaylist(faixa, estado.fotoNome)}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      avisar("Convite copiado.");
    } catch {
      avisar("Não deu para copiar. Selecione e copie o texto do cartão.");
    }
  }

  async function compartilhar() {
    if (!canvas.current || !faixa) return;
    try {
      const blob = await paraBlob(canvas.current);
      const arquivo = new File([blob], nomeArquivo(faixa), { type: "image/png" });
      if (navigator.canShare?.({ files: [arquivo] })) {
        await navigator.share({ files: [arquivo], text: texto, title: "Sony Moments" });
        return;
      }
      baixarBlob(blob, nomeArquivo(faixa));
      await navigator.clipboard?.writeText(texto).catch(() => undefined);
      avisar("Este navegador não compartilha arquivos. O PNG foi baixado e o convite copiado.");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      avisar("Não deu para compartilhar agora.");
    }
  }

  async function baixar() {
    if (!canvas.current || !faixa) return;
    try {
      baixarBlob(await paraBlob(canvas.current), nomeArquivo(faixa));
      avisar("Cartão salvo em PNG.");
    } catch {
      avisar("Não deu para gerar o PNG.");
    }
  }

  return (
    <>
      <h1 className="visualmente-oculto">Cartão musical</h1>
      <div className={s.moldura}>
        <canvas
          ref={canvas}
          className={`${s.cartao} ${pronto ? "" : s.oculto}`}
          width={1080}
          height={976}
          role="img"
          aria-label={`Cartão musical: sua foto com ${faixa.titulo}, de ${faixa.artista}. Curta esse cartão musical da ${PERFIL}.`}
        />
        {!pronto && <div className={`${ui.esqueleto} ${s.esqueleto}`} aria-hidden="true" />}
      </div>
      {semCapa && <p className={ui.nota}>A capa não carregou; o cartão saiu sem ela.</p>}

      <fieldset className={s.trocar}>
        <legend className="visualmente-oculto">Música do cartão</legend>
        <div className={s.trocarLista}>
          {estado.sugestoes.map((f) => (
            <label key={f.id} className={ui.chip}>
              <input type="radio" name="faixa-cartao" value={f.id} checked={f.id === faixa.id} onChange={() => atualizar(() => ({ faixaCartao: f.id }))} />
              <span>{f.titulo}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <ul className={`${ui.lista} ${s.opcoes}`}>
        {OPCOES.map((o) => (
          <li key={o.id}>
            <button type="button" className={ui.linha} onClick={o.id === "link" ? copiar : compartilhar} disabled={!pronto}>
              <span className={ui.linhaIco}><Icone nome={o.icone} tamanho={24} /></span>
              <span className={ui.linhaTxt}><b>{o.nome}</b></span>
              <span className={ui.linhaAcao} aria-hidden="true"><Icone nome="enviar" /></span>
            </button>
          </li>
        ))}
      </ul>

      <div className={ui.centro}>
        <button type="button" className={ui.botao} onClick={baixar} disabled={!pronto}>
          Baixar
        </button>
        <p className={ui.nota}>Quem recebe abre o link e ouve a música no app. O PNG é gerado no seu aparelho.</p>
      </div>
    </>
  );
}
