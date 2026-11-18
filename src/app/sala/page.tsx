import type { Metadata } from "next";
import { SalaTela } from "@/components/SalaTela";

export const metadata: Metadata = { title: "Sala musical" };

export default function Pagina() {
  return <SalaTela />;
}
