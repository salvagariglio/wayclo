import "./globals.css";
import { Inter, Outfit } from "next/font/google";
import SiteShell from "@/components/SiteShell";

export const metadata = {
  title: "CyberCloud Río Cuarto – 15 de diciembre",
  description:
    "La nueva era de la ciberseguridad empresarial: panel, charla sobre IA y networking. Organiza Wayclo.",
  openGraph: {
    title: "CyberCloud Río Cuarto – 15 de diciembre",
    description:
      "Evento de ciberseguridad con panel de expertos, charla sobre IA y networking. Organiza Wayclo.",
    type: "website",
    images: [{ url: "/og-cybercloud.jpg" }],
  },
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans`}
        style={{ position: "relative", zIndex: 0 }}
      >
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
