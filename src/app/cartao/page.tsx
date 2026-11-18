import type { Metadata } from "next";
import { CartaoTela } from "@/components/CartaoTela";

export const metadata: Metadata = { title: "Cartão musical" };

export default function Pagina() {
  return <CartaoTela />;
}
