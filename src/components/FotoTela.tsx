"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useApp } from "@/lib/estado";
import { usePlayer } from "@/lib/player";
import { GENEROS } from "@/lib/dados";
import { cobrirCanvas } from "@/lib/analise";
import { CENAS, urlCena } from "@/lib/cenas";
import { analisar } from "@/lib/recomendar";
import { Icone, Simbolo } from "./Icone";
import ui from "./ui.module.css";
import s from "./FotoTela.module.css";

export function FotoTela() {
  const { estado, hidratado, atualizar, fonte, definirFoto, escolherCena, carregandoFoto, erroFoto } = useApp();
  const { parar } = usePlayer();
  const router = useRouter();
  const previa = useRef<HTMLCanvasElement>(null);
  const arquivo = useRef<HTMLInputElement>(null);
  const [analisando, setAnalisando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (previa.current) cobrirCanvas(previa.current, fonte);
  }, [fonte]);

  const temFoto = !!(estado.exemplo || estado.foto) && !!fonte;
  const n = estado.generos.length;
  const pronto = temFoto && n >= 2 && n <= 3 && !analisando && !carregandoFoto;
  const mensagemErro = erro || erroFoto;

  function aoEscolherArquivo(ev: ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    ev.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErro("Esse arquivo não é uma imagem. Escolha uma foto JPG, PNG ou HEIC.");
      return;
    }
    setErro("");
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const e = Math.min(1, 900 / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * e);
      c.height = Math.round(img.naturalHeight * e);
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      let dataUrl: string | null = null;
      try {
        dataUrl = c.toDataURL("image/jpeg", 0.82);
      } catch {
        dataUrl = null;
      }
      definirFoto(c, { dataUrl, nome: f.name });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setErro("Não deu para abrir essa imagem. Tente outra foto.");
    };
    img.src = url;
  }

  function alternarGenero(id: string, marcado: boolean) {
    atualizar((e) => {
      const lista = marcado ? [...e.generos, id] : e.generos.filter((g) => g !== id);
      return { generos: lista.slice(0, 3) };
    });
  }

  async function iniciarAnalise() {
    if (!fonte || !pronto) return;
    setAnalisando(true);
    setErro("");
    parar();
    try {
      const r = await analisar(fonte, estado.generos);
      atualizar(() => ({
        leitura: r.leitura,
        sugestoes: r.faixas,
        aviso: r.aviso ?? null,
        faixaCartao: r.faixas[0]?.id ?? null,
        orientado: true
      }));
      router.push("/momento/");
    } catch {
      setErro("Não deu para analisar a foto. Tente de novo.");
      setAnalisando(false);
    }
  }

  return (
    <>
      <h1 className={ui.titulo}>Qual a trilha desse momento?</h1>
      <p className={ui.lead}>Envie uma foto e receba 4 músicas que combinam com ela.</p>

      {hidratado && !estado.orientado && (
        <section className={s.orientacao} aria-labelledby="como-funciona">
          <h2 id="como-funciona" className={s.orientacaoTitulo}>Como funciona</h2>
          <ol>
            <li><b>Escolha uma foto</b> do aparelho ou uma cena de exemplo.</li>
            <li><b>Marque 2 ou 3 gêneros</b> que você curte.</li>
            <li><b>Ouça as 4 músicas</b>, faça o cartão e chame os amigos para a sala.</li>
          </ol>
          <button type="button" className={ui.linkDiscreto} onClick={() => atualizar(() => ({ orientado: true }))}>
            Entendi
          </button>
        </section>
      )}

      <div className={ui.cartao}>
        <div className={`${ui.cartaoFoto} ${analisando ? s.lendo : ""}`}>
          <canvas ref={previa} width={720} height={462} role="img" aria-label={temFoto ? `Foto escolhida: ${estado.fotoNome}` : "Nenhuma foto escolhida"} />
          {(!hidratado || carregandoFoto) && <div className={`${ui.esqueleto} ${s.cobre}`} aria-hidden="true" />}
          {hidratado && !temFoto && !carregandoFoto && (
            <button type="button" className={`${ui.play} ${ui.playCentro}`} onClick={() => arquivo.current?.click()} aria-label="Escolher foto do aparelho">
              <Icone nome="camera" tamanho={32} />
            </button>
          )}
          <span className={s.varredura} aria-hidden="true" />
          <p className={ui.rotulo}>
            <Simbolo largura={22} cor="#ffffff" />
            <span>{carregandoFoto ? `Carregando ${estado.fotoNome}…` : temFoto ? estado.fotoNome : "Nenhuma foto ainda"}</span>
          </p>
        </div>
        <div className={ui.cartaoTexto}>
          A foto fica no seu aparelho. Só o gênero e o clima vão para a busca de músicas.
        </div>
      </div>

      <div className={ui.centro}>
        <input ref={arquivo} id="arquivo" type="file" accept="image/*" className={`visualmente-oculto ${s.arquivo}`} onChange={aoEscolherArquivo} />
        <label htmlFor="arquivo" className={`${ui.botao} ${ui.botaoContorno}`}>
          <Icone nome="camera" tamanho={18} />
          {temFoto ? "Trocar foto" : "Escolher foto"}
        </label>
      </div>

      <h2 className={ui.secao}>Ou use uma cena de exemplo</h2>
      <div className={s.exemplos}>
        {CENAS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={s.exemplo}
            aria-pressed={estado.exemplo === c.id}
            disabled={analisando}
            onClick={() => {
              setErro("");
              escolherCena(c.id);
            }}
          >
            <img src={urlCena(c)} width={82} height={82} alt="" loading="lazy" decoding="async" />
            <span>{c.nome}</span>
          </button>
        ))}
      </div>
      <p className={`${ui.nota} ${s.fonteFotos}`}>
        Fotos do Wikimedia Commons. <Link href="/creditos/" className={s.creditos}>Créditos das fotos</Link>
      </p>

      <fieldset className={s.gosto}>
        <legend className={ui.secao}>
          Seu gosto <span className={ui.secaoSub}>2 ou 3 gêneros</span>
        </legend>
        <div className={ui.chips}>
          {GENEROS.map((g) => {
            const marcado = estado.generos.includes(g.id);
            return (
              <label key={g.id} className={ui.chip}>
                <input type="checkbox" checked={marcado} disabled={!marcado && n >= 3} onChange={(e) => alternarGenero(g.id, e.target.checked)} />
                <span>{g.nome}</span>
              </label>
            );
          })}
        </div>
        <p className={ui.nota} aria-live="polite">
          {n < 2 ? `Escolha mais ${2 - n}.` : `${n} de 3 escolhidos.`}
        </p>
      </fieldset>

      {mensagemErro && (
        <p className={`${ui.faixa} ${ui.faixaErro}`} role="alert">
          <Icone nome="alerta" tamanho={18} />
          <span>{mensagemErro}</span>
        </p>
      )}

      <div className={ui.centro}>
        <button type="button" className={`${ui.botao} ${ui.botaoLargo}`} onClick={iniciarAnalise} disabled={!pronto} aria-describedby="dica-analisar">
          {analisando ? "Analisando…" : "Analisar foto"}
        </button>
        <p id="dica-analisar" className={ui.nota} aria-live="polite">
          {analisando
            ? "Lendo luz e cor da foto e buscando as músicas."
            : carregandoFoto
              ? "Carregando a cena de exemplo."
              : !temFoto
              ? "Falta a foto."
              : n < 2
                ? "Falta escolher o gosto."
                : " "}
        </p>
      </div>
      {analisando && <span className="visualmente-oculto" role="status">Analisando a foto</span>}
      {!analisando && hidratado && estado.sugestoes.length > 0 && (
        <div className={ui.centro}>
          <button type="button" className={ui.linkDiscreto} onClick={() => router.push("/momento/")}>
            Ver as músicas da última foto
          </button>
        </div>
      )}
    </>
  );
}
