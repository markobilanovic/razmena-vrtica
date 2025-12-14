"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState("")

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      router.push(`/register?email=${encodeURIComponent(email)}`)
    } else {
      router.push("/register")
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div
          className="absolute -top-48 -right-48 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full">
                <span className="text-sm font-semibold text-blue-600">
                  🎉 Za roditelje PU &quot;Radosno detinjstvo&quot;
                </span>
              </div>
              <h1 className="mb-6">
                Pronađite idealnu{" "}
                <span className="gradient-text">razmenu vrtića</span> za vaše
                dete
              </h1>
              <p className="text-xl text-color-text-muted mb-8 leading-relaxed">
                Povezujemo roditelje čija deca idu u vrtiće PU &quot;Radosno
                detinjstvo&quot; u Novom Sadu. Pronađite mesto koje vam više
                odgovara.
              </p>

              <form
                onSubmit={handleGetStarted}
                className="flex flex-col sm:flex-row gap-4 mb-6"
              >
                <input
                  type="email"
                  placeholder="Unesite vašu email adresu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-lg shadow-sm hover:shadow-md bg-white"
                  required
                />
                <button type="submit" className="btn-primary whitespace-nowrap">
                  <span>Započni sada</span>
                </button>
              </form>

              <div className="flex items-center gap-6 text-sm text-color-text-muted">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Potpuno besplatno</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Bez skrivenih troškova</span>
                </div>
              </div>
            </div>

            <div
              className="relative animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="relative">
                {/* Placeholder for hero image */}
                <div className="glass-card rounded-3xl p-8 aspect-square flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🏫</div>
                    <p className="text-2xl font-semibold text-color-text-muted">
                      Vaš novi vrtić čeka
                    </p>
                  </div>
                </div>

                {/* Floating stats */}
                <div className="absolute -top-6 -left-6 glass-card rounded-2xl p-4 animate-pulse-glow">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                      <span className="text-2xl">
                        {/* Show Shield icon if no stats, otherwise Users icon */}
                        �️
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-color-text-muted">
                        Podaci su
                      </p>
                      <p className="text-lg font-bold">Sigurni</p>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute -bottom-6 -right-6 glass-card rounded-2xl p-4 animate-pulse-glow"
                  style={{ animationDelay: "1s" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div>
                      <p className="text-sm text-color-text-muted">
                        Brzo i
                      </p>
                      <p className="text-lg font-bold">Jednostavno</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="mb-6">
              Zašto koristiti{" "}
              <span className="gradient-text">Razmenu Vrtića</span>?
            </h2>
            <p className="text-xl text-color-text-muted max-w-2xl mx-auto">
              Osmislili smo najjednostavniji način da pronađete savršenu razmenu
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                icon: "🔍",
                title: "Lako pretraživanje",
                description:
                  "Pretražite dostupne razmene po gradu, opštini i vrtiću koji vam odgovara.",
              },
              {
                icon: "🔔",
                title: "Notifikacije u realnom vremenu",
                description:
                  "Dobijte obaveštenje čim se pojavi razmena koja odgovara vašim potrebama.",
              },
              {
                icon: "💬",
                title: "Direktna komunikacija",
                description:
                  "Stupite u kontakt sa drugim roditeljima i dogovorite detalje razmene.",
              },
              {
                icon: "🔒",
                title: "Sigurno i pouzdano",
                description:
                  "Vaši podaci su zaštićeni, a svi korisnici su verifikovani.",
              },
              {
                icon: "📱",
                title: "Mobilna aplikacija",
                description:
                  "Pristupite platformi sa bilo kog uređaja, u bilo koje vreme.",
              },
              {
                icon: "⚡",
                title: "Brzo i efikasno",
                description: "Pronađite razmenu za nekoliko minuta, ne meseci.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="feature-card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-color-text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-32 px-6 bg-gradient-to-br from-blue-50 to-purple-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="mb-6">
              Kako to <span className="gradient-text">funkcioniše</span>?
            </h2>
            <p className="text-xl text-color-text-muted max-w-2xl mx-auto">
              Samo 3 jednostavna koraka do vaše idealne razmene
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Registrujte se",
                description:
                  "Napravite nalog i popunite informacije o vrtiću koji trenutno imate i onom koji želite.",
              },
              {
                step: "02",
                title: "Pronađite podudaranje",
                description:
                  "Naš algoritam automatski pronalazi roditelje koji traže ono što vi nudite.",
              },
              {
                step: "03",
                title: "Dogovorite razmenu",
                description:
                  "Stupite u kontakt, dogovorite se i finalizujte razmenu sa drugim roditeljem.",
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="feature-card text-center">
                  <div className="inline-block mb-6">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-color-text-muted">{item.description}</p>
                </div>

                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg
                      className="w-8 h-8 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Circular Exchange Section */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-6">
              Kako funkcioniše <span className="gradient-text">kružna razmena</span>?
            </h2>
            <p className="text-xl text-color-text-muted max-w-2xl mx-auto">
              Naš algoritam ne traži samo direktne zamene, već i kružne razmene
              između tri ili više roditelja kako bi povećali šanse za uspeh.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Direct Exchange */}
            <div className="glass-card p-8 rounded-3xl relative">
              <div className="text-center mb-12">
                <h3 className="text-xl font-bold mb-2">Direktna Razmena</h3>
                <p className="text-sm text-color-text-muted">
                  Klasična zamena između dve strane
                </p>
              </div>

              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="flex flex-col items-center z-10">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-xl">
                    👩
                  </div>
                  <span className="font-semibold mt-3 text-lg">Vi</span>
                </div>

                <div className="flex flex-col gap-2 text-blue-500">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>

                <div className="flex flex-col items-center z-10">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-xl">
                    👨
                  </div>
                  <span className="font-semibold mt-3 text-lg">Osoba B</span>
                </div>
              </div>

              <div className="bg-blue-50/50 rounded-2xl p-6 text-center text-blue-900 leading-relaxed border border-blue-100">
                <p>
                  <strong>Vi</strong> želite vrtić u kom je <strong>Osoba B</strong>.
                </p>
                <p>
                  <strong>Osoba B</strong> želi vrtić u kom ste <strong>Vi</strong>.
                </p>
              </div>
            </div>

            {/* Circular Exchange */}
            <div className="glass-card p-8 rounded-3xl relative border-2 border-green-500/20 bg-green-50/10">
              <div className="absolute -top-4 right-8 bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg">
                Pametno Rešenje
              </div>

              <div className="text-center mb-12">
                <h3 className="text-xl font-bold mb-2">
                  Kružna Razmena (3+ roditelja)
                </h3>
                <p className="text-sm text-color-text-muted">
                  Više strana ispunjava želje u krug
                </p>
              </div>

              <div className="relative h-64 w-full max-w-sm mx-auto mb-8">
                {/* Connecting Circle (Background) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[3px] border-dashed border-green-200 rounded-full"></div>

                {/* Person A (Top) */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow-lg">
                    👩
                  </div>
                  <span className="font-semibold text-sm mt-1 bg-white px-2 rounded-full shadow-sm">
                    Vi (A)
                  </span>
                </div>

                {/* Person B (Right) */}
                <div className="absolute bottom-4 right-0 flex flex-col items-center z-10">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow-lg">
                    👨
                  </div>
                  <span className="font-semibold text-sm mt-1 bg-white px-2 rounded-full shadow-sm">
                    Osoba B
                  </span>
                </div>

                {/* Person C (Left) */}
                <div className="absolute bottom-4 left-0 flex flex-col items-center z-10">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow-lg">
                    👩‍🦰
                  </div>
                  <span className="font-semibold text-sm mt-1 bg-white px-2 rounded-full shadow-sm">
                    Osoba C
                  </span>
                </div>

                {/* Arrow A -> B */}
                <div
                  className="absolute top-[30%] right-[18%] text-green-500"
                  style={{ transform: "rotate(60deg)" }}
                >
                  <svg
                    className="w-8 h-8 animate-pulse"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>

                {/* Arrow B -> C */}
                <div
                  className="absolute bottom-[2%] left-1/2 text-green-500"
                  style={{ transform: "translateX(-50%) rotate(180deg)" }}
                >
                  <svg
                    className="w-8 h-8 animate-pulse"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>

                {/* Arrow C -> A */}
                <div
                  className="absolute top-[30%] left-[18%] text-green-500"
                  style={{ transform: "rotate(-60deg)" }}
                >
                  <svg
                    className="w-8 h-8 animate-pulse"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 text-sm text-center text-green-900 leading-relaxed border border-green-200">
                <p>
                  <strong>Vi</strong> želite B. <strong>B</strong> želi C.{" "}
                  <strong>C</strong> želi Vas.
                </p>
                <p className="mt-1 font-semibold text-green-700">
                  Svi dobijaju željeno mesto!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section (Replacing Testimonials) */}
      <section id="community" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-6">
              Postanite deo <span className="gradient-text">zajednice</span>
            </h2>
            <p className="text-xl text-color-text-muted max-w-2xl mx-auto">
              Budite među prvima koji će pronaći savršenu razmenu vrtića. Vaše
              iskustvo će pomoći drugima!
            </p>
          </div>

          <div className="glass-card rounded-3xl p-12 text-center max-w-4xl mx-auto border-2 border-blue-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
                🚀
              </div>
              <h3 className="text-2xl font-bold mb-4">Lansiramo se!</h3>
              <p className="text-lg text-color-text-muted mb-8 max-w-2xl mx-auto">
                Naša platforma je upravo otvorena za registracije. Pridružite se
                sada, postavite svoj oglas potpuno besplatno i budite pionir u
                modernoj razmeni vrtića u Srbiji.
              </p>

              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Postani prvi član
              </Link>
            </div>

            {/* Decorative circles */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-100 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-100 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">R</span>
                </div>
                <span className="text-xl font-bold">Razmena Vrtića</span>
              </div>
              <p className="text-gray-400">
                Povezujemo roditelje i olakšavamo razmenu mesta u vrtićima PU
                &quot;Radosno detinjstvo&quot;.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Platforma</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pretraga razmena
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Kako funkcioniše
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cenovnik
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Podrška</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Česta pitanja
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Kontakt
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pomoć
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Pravno</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Uslovi korišćenja
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Politika privatnosti
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Kolačići
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Razmena Vrtića. Sva prava zadržana.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
