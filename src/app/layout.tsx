import type { Metadata, Viewport } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "@fontsource/aileron/latin-400.css";
import "@fontsource/aileron/latin-700.css";
import "./globals.css";
import { ProvedorEstado } from "@/lib/estado";
import { ProvedorPlayer } from "@/lib/player";
import { Shell } from "@/components/Shell";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700", "800"], variable: "--fonte-montserrat", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--fonte-poppins", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Sony Moments", template: "%s · Sony Moments" },
  description: "Envie uma foto e receba quatro músicas que combinam com ela. Protótipo de portfólio, não é um produto oficial da Sony."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#331732"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${poppins.variable}`}>
      <body>
        <ProvedorEstado>
          <ProvedorPlayer>
            <Shell>{children}</Shell>
          </ProvedorPlayer>
        </ProvedorEstado>
      </body>
    </html>
  );
}
