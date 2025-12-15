import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import "./globals.css"
import Header from "../components/Header"
import PageWrapper from "../components/PageWrapper"
import QueryProvider from "../components/QueryProvider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Razmena Vrtića - Pronađite savršenu razmenu vrtića",
  description:
    "Platforma koja povezuje roditelje koji žele da razmene mesta u vrtićima širom Srbije. Brzo, jednostavno i potpuno besplatno.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sr">
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${inter.variable} ${outfit.variable}`}>
        <QueryProvider>
          <Header />
          <PageWrapper>{children}</PageWrapper>
        </QueryProvider>
      </body>
    </html>
  )
}
