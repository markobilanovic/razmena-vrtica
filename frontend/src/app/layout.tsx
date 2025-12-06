import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import PageWrapper from "../components/PageWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Razmena Vrtića - Pronađite savršenu razmenu vrtića",
  description: "Platforma koja povezuje roditelje koji žele da razmene mesta u vrtićima širom Srbije. Brzo, jednostavno i potpuno besplatno.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <Header />
        <PageWrapper>{children}</PageWrapper>
      </body>
    </html>
  );
}
