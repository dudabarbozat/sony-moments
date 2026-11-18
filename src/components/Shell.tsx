"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { useApp } from "@/lib/estado";
import { Icone, Simbolo } from "./Icone";
import s from "./Shell.module.css";
import ui from "./ui.module.css";

const VOLTAR: Record<string, { href: string; rotulo: string }> = {
  "/momento": { href: "/", rotulo: "Voltar para a foto" },
  "/cartao": { href: "/momento/", rotulo: "Voltar para as músicas" },
  "/creditos": { href: "/", rotulo: "Voltar para a foto" }
};

export function Shell({ children }: { children: ReactNode }) {
  const bruto = usePathname() ?? "/";
  const rota = bruto.length > 1 ? bruto.replace(/\/$/, "") : bruto;
  const router = useRouter();
  const { aviso, restaurar } = useApp();
  const conteudo = useRef<HTMLElement>(null);
  const primeira = useRef(true);
  const voltar = VOLTAR[rota];

  useEffect(() => {
    const el = conteudo.current;
    if (!el) return;
    el.scrollTop = 0;
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    const h = el.querySelector("h1");
    if (h) {
      h.setAttribute("tabindex", "-1");
      h.focus({ preventScroll: true });
    }
  }, [rota]);

  return (
    <div className={s.aparelho}>
      <div className={s.app}>
        <div className={s.status} aria-hidden="true">
          <span>9:41</span>
          <span className={s.statusIcones}>
            <svg viewBox="0 0 18 12" width="18" height="12"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor" /><rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor" /><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" /></svg>
            <svg viewBox="0 0 16 12" width="16" height="12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.4 1.4a4.5 4.5 0 0 0-6.4 0zM1 4.4a10 10 0 0 1 14 0l-1.4 1.4a8 8 0 0 0-11.2 0z" fill="currentColor" /></svg>
            <svg viewBox="0 0 27 12" width="27" height="12"><rect x="0.5" y="0.5" width="23" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="20" height="8" rx="2" fill="currentColor" /></svg>
          </span>
        </div>

        <header className={s.topo}>
          {voltar ? (
            <button type="button" className={s.voltar} onClick={() => router.push(voltar.href)} aria-label={voltar.rotulo}>
              <Icone nome="voltar" tamanho={26} />
            </button>
          ) : (
            <Link href="/" className={s.marca} aria-label="Sony Moments, início">
              <Simbolo largura={44} />
              <span>Sony Moments</span>
            </Link>
          )}
          <span className={s.perfil} role="img" aria-label="Perfil de Tina">
            <span aria-hidden="true">T</span>
          </span>
        </header>

        <main id="conteudo" ref={conteudo} className={s.conteudo} tabIndex={-1}>
          <div key={rota}>{children}</div>
          <footer className={s.rodape}>
            <p>
              Protótipo de portfólio. Não é um produto oficial da Sony. Músicas e capas vêm da busca pública do iTunes; fotos de exemplo, do
              Wikimedia Commons (<Link href="/creditos/" className={s.rodapeLink}>créditos</Link>); amigos e salas são fictícios.
            </p>
            <button type="button" className={ui.linkDiscreto} onClick={restaurar}>
              Restaurar dados de exemplo
            </button>
          </footer>
        </main>

        <nav className={s.abas} aria-label="Navegação principal">
          <Link href="/momento/" className={s.aba} aria-current={rota === "/momento" || rota === "/cartao" ? "page" : undefined}>
            <Icone nome="casa" />
            <span className="visualmente-oculto">Seu momento</span>
          </Link>
          <Link href="/" className={`${s.aba} ${s.abaCamera}`} aria-current={rota === "/" ? "page" : undefined}>
            <span className={s.bolha}>
              <Icone nome="camera" />
            </span>
            <span className="visualmente-oculto">Nova foto</span>
          </Link>
          <Link href="/sala/" className={s.aba} aria-current={rota === "/sala" ? "page" : undefined}>
            <Icone nome="pessoas" />
            <span className="visualmente-oculto">Sala musical</span>
          </Link>
        </nav>

        <div className={`${s.aviso} ${aviso ? s.avisoVisivel : ""}`} role="status" aria-live="polite">
          {aviso}
        </div>
      </div>
    </div>
  );
}
