import { CENAS, urlCena } from "@/lib/cenas";
import ui from "./ui.module.css";
import s from "./CreditosTela.module.css";

export function CreditosTela() {
  return (
    <>
      <h1 className={ui.titulo}>Créditos das fotos</h1>
      <p className={ui.lead}>
        As cenas de exemplo são fotos do{" "}
        <a href="https://commons.wikimedia.org/" target="_blank" rel="noreferrer" className={s.link}>
          Wikimedia Commons
        </a>
        , redimensionadas e convertidas para WebP. Os nomes das cenas são do app, não dos autores.
      </p>
      <ul className={s.lista}>
        {CENAS.map((c) => (
          <li key={c.id} className={s.item}>
            <img src={urlCena(c)} alt="" width={64} height={64} loading="lazy" decoding="async" className={s.mini} />
            <div className={s.texto}>
              <p className={s.nome}>{c.nome}</p>
              <p>
                <a href={c.pagina} target="_blank" rel="noreferrer" className={s.link}>
                  {c.titulo}
                </a>
              </p>
              <p className={s.meta}>
                {c.autor} ·{" "}
                <a href={c.licencaUrl} target="_blank" rel="noreferrer" className={s.link}>
                  {c.licenca}
                </a>
                {c.ajuste ? ` · ${c.ajuste}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
