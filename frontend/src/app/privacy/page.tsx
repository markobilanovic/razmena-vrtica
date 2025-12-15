import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Politika privatnosti - Razmena Vrtića",
  description: "Politika privatnosti za platformu Razmena Vrtića - kako čuvamo i koristimo vaše podatke.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-orange-500 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Politika privatnosti</h1>
            <p className="text-blue-100">Poslednje ažuriranje: 2025.</p>
          </div>
          
          <main className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
                1. O projektu
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Razmena Vrtića je platforma namenjena roditeljima za povezivanje i razmenu
                informacija u vezi sa promenom vrtića u okviru lokalne zajednice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
                2. Podaci koje prikupljamo
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Korisnik može uneti sledeće podatke:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>ime deteta</li>
                <li>vrtić koji dete trenutno pohađa</li>
                <li>željeni vrtić</li>
                <li>email adresu roditelja ili staratelja</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4 font-medium">
                Ne prikupljamo nikakve dodatne podatke.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
                3. Svrha obrade podataka
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Uneti podaci se koriste isključivo radi pronalaženja podudaranja između
                korisnika i omogućavanja kontakta između roditelja kada dođe do
                podudaranja.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
                4. Deljenje podataka
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Email adresa korisnika se automatski deli isključivo sa korisnikom sa
                kojim je ostvaren match, i to samo u svrhu međusobne komunikacije.
              </p>
              <p className="text-gray-700 leading-relaxed font-medium">
                Podaci se ne dele sa trećim licima, organizacijama ili servisima van
                platforme.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
                5. Podaci o deci
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Platforma je namenjena isključivo roditeljima ili zakonskim
                starateljima. Unosom podataka korisnik potvrđuje da ima pravo da unese
                podatke o detetu.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
                6. Čuvanje i zaštita podataka
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Podaci se čuvaju na bezbedan način i dostupni su samo administratorima
                platforme i korisnicima koji su ostvarili match.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
                7. Period čuvanja
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Podaci se čuvaju dok korisnik koristi platformu ili dok ne zatraži
                brisanje svojih podataka.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
                8. Prava korisnika
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Korisnik ima pravo da:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>zatraži uvid u svoje podatke</li>
                <li>zatraži ispravku ili brisanje podataka</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
                9. Izmene politike privatnosti
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Politika privatnosti može biti povremeno ažurirana. Sve izmene biće
                objavljene na ovoj stranici.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
                10. Kontakt
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Za sva pitanja u vezi sa zaštitom podataka možete nas kontaktirati putem
                emaila:
                <br />
                <strong className="text-blue-600">info@razmenavrtića.rs</strong>
              </p>
            </section>
          </main>
          
          <div className="bg-gray-50 p-6 border-t border-gray-100">
            <div className="flex justify-center">
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                ← Nazad na početnu
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}