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
  title: "Razmena Mesta u Vrtićima | Besplatna Platforma za Roditelje",
  description:
    `Platforma koja povezuje roditelje koji žele da razmene mesta u PU „Radosno detinjstvo". Brzo, jednostavno i potpuno besplatno.`,
  keywords: [
    "razmena mesta u vrtićima",
    "razmena vrtića",
    "PU Radosno detinjstvo",
    "vrtić Novi Sad",
    "razmena mesta",
    "roditelji",
    "deca",
    "vrtić",
    "upis u vrtić",
    "promena vrtića"
  ],
  authors: [{ name: "Razmena Vrtica" }],
  creator: "Razmena Vrtica",
  publisher: "Razmena Vrtica",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "sr_RS",
    url: "https://razmena-vrtica.vercel.app",
    siteName: "Razmena Mesta u Vrtićima",
    title: "Razmena Mesta u Vrtićima | Besplatna Platforma za Roditelje",
    description: `Platforma koja povezuje roditelje koji žele da razmene mesta u PU „Radosno detinjstvo". Brzo, jednostavno i potpuno besplatno.`,
  
  },
  twitter: {
    card: "summary_large_image",
    title: "Razmena Mesta u Vrtićima | Besplatna Platforma za Roditelje",
    description: `Platforma koja povezuje roditelje koji žele da razmene mesta u PU „Radosno detinjstvo". Brzo, jednostavno i potpuno besplatno.`,
    // images: ["/og-image.png"], // Same image as OpenGraph
  },
  alternates: {
    canonical: "https://razmena-vrtica.vercel.app",
  },
  category: "education",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Razmena Mesta u Vrtićima",
              "description": `Platforma koja po roditelje koji žele da razmene mesta u PU „Radosno detinjstvo". Brzo, jednostavno i potpuno besplatno.`,
              "url": "https://razmenavrtića.rs",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "RSD"
              },
              "audience": {
                "@type": "Audience",
                "audienceType": "Parents"
              },
              "inLanguage": "sr"
            })
          }}
        />
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
