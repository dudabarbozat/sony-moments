import type { Metadata } from "next";
import { MomentoTela } from "@/components/MomentoTela";

export const metadata: Metadata = { title: "Seu momento" };

export default function Pagina() {
  return <MomentoTela />;
}
