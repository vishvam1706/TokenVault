import { Inter, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap", weight: ["400","500","600","700","800"] });
const spaceMono = Space_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap", weight: ["400","700"] });

export const metadata = {
  title: "TokenVault",
  description: "Track your Antigravity AI accounts and token refresh countdowns across all models in a clean, responsive dashboard.",
  icons: {
    icon: "/tokenvault_logo.svg",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} ${spaceMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#fff",
              border: "1px solid #E4E4E0",
              color: "#111110",
              fontSize: "13px",
              borderRadius: "10px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
