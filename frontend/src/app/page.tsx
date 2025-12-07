"use client"

import { useState } from "react"

export default function Home() {
  const [email, setEmail] = useState("")

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Email submitted:", email)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full">
                <span className="text-sm font-semibold text-blue-600">
                  🎉 Nova platforma za roditelje
                </span>
              </div>
              <h1 className="mb-6">
                Pronađite idealnu{" "}
                <span className="gradient-text">razmenu vrtića</span> za vaše
                dete
              </h1>
              <p className="text-xl text-color-text-muted mb-8 leading-relaxed">
                Povezujemo roditelje koji žele da razmene mesta u vrtićima.
                Brzo, jednostavno i potpuno besplatno.
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
                      <span className="text-2xl">👥</span>
                    </div>
                    <div>
                      <p className="text-sm text-color-text-muted">
                        Aktivnih roditelja
                      </p>
                      <p className="text-2xl font-bold">500+</p>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute -bottom-6 -right-6 glass-card rounded-2xl p-4 animate-pulse-glow"
                  style={{ animationDelay: "1s" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div>
                      <p className="text-sm text-color-text-muted">
                        Uspešnih razmena
                      </p>
                      <p className="text-2xl font-bold">150+</p>
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="mb-6">
              Šta kažu <span className="gradient-text">roditelji</span>?
            </h2>
            <p className="text-xl text-color-text-muted max-w-2xl mx-auto">
              Pročitajte iskustva roditelja koji su uspešno razmenili vrtić
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                name: "Marija Petrović",
                location: "Beograd",
                text: "Neverovatno! Za samo nedelju dana sam pronašla savršenu razmenu. Moj sin sada ide u vrtić blizu mog posla.",
                rating: 5,
              },
              {
                name: "Stefan Nikolić",
                location: "Novi Sad",
                text: "Platforma je izuzetno jednostavna za korišćenje. Preporučujem svim roditeljima!",
                rating: 5,
              },
              {
                name: "Ana Jovanović",
                location: "Niš",
                text: "Konačno smo našli vrtić u našem komšiluku. Hvala ekipi Razmene Vrtića!",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="feature-card">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-color-text-muted mb-6 italic">
                  &quot;{testimonial.text}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-color-text-muted">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-white mb-8">
            Spremni da pronađete savršenu razmenu?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Pridružite se stotinama zadovoljnih roditelja koji su našli idealan
            vrtić za svoju decu
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="btn-primary bg-white text-blue-600 hover:bg-blue-50">
              <span>Registrujte se besplatno</span>
            </button>
            <button className="btn-secondary border-white text-white hover:bg-white hover:text-blue-600">
              Saznajte više
            </button>
          </div>

          <p className="text-sm text-blue-100 mt-6">
            Registracija traje manje od 2 minuta
          </p>
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
                Povezujemo roditelje i olakšavamo razmenu vrtića širom Srbije.
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
