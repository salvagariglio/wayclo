import "./globals.css";
import { Inter, Outfit } from "next/font/google";
import SiteShell from "@/components/SiteShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans`}
        style={{ position: "relative", zIndex: 0 }}
      >
        {/* Shell con NavBar, Footer y Dialog global */}
        <SiteShell>{children}</SiteShell>

      </body>
    </html>
  );
}
