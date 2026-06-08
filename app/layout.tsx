import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";

// Шрифт Inter с поддержкой кириллицы (казахский) — грузится оптимизированно через next/font
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ҰБТ Дайындық — ҰБТ-ға дайындалудың ең тиімді платформасы",
  description:
    "Мыңдаған тапсырмалар мен тесттер, пробное ҰБТ, рейтинг және прогресс талдауы — ҰБТ-ға толық қазақ тілінде дайындалыңыз.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kk" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Применяем сохранённую тему до отрисовки, чтобы не было «моргания» */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
