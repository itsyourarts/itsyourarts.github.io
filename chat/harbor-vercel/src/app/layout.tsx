import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = Outfit({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Harbor", template: "%s · Harbor" },
  description: "Phone-verified private chat with a separate admin console and official WhatsApp Business Platform support.",
};

const themeBoot = `try{var t=localStorage.getItem("harbor-theme");if(!t){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}document.documentElement.dataset.theme=t;}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
        <a className="skip" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
