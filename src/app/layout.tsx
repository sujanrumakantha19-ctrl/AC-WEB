import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReduxProvider } from "@/redux/provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("vks-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);var s=parseFloat(localStorage.getItem("vks-font-scale")||"1");if(!isNaN(s)&&s>=0.8&&s<=1.2){document.documentElement.style.fontSize=(16*s)+"px";}}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export const metadata: Metadata = {
  title: "VKS Autoservices | Premium Automotive Auction Platform",
  description: "Experience the thrill of acquiring premium SUVs and luxury sedans through India's most trusted offering platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light h-full antialiased ${inter.className}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container">
        <ReduxProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
