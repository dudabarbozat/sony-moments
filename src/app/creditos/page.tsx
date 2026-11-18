import type { Metadata } from "next";
import { CreditosTela } from "@/components/CreditosTela";

export const metadata: Metadata = { title: "Créditos das fotos" };

export default function Pagina() {
  return <CreditosTela />;
}
