import { DataSource } from 'typeorm';
import { Kindergarten } from '../entities/kindergarten.entity';

export async function seedKindergartens(dataSource: DataSource) {
    const kindergartenRepository = dataSource.getRepository(Kindergarten);

    const kindergartensData = [
        { "name": "Palčica", "street": "Branimira Ćosića 40" },
        { "name": "Čuperak", "street": "Save Kovačevića 7" },
        { "name": "Zvončica", "street": "Save Kovačevića 14" },
        { "name": "Vendi", "street": "Braće Dronjak bb" },
        { "name": "Zlatna ribica", "street": "Marodićeva 4a" },
        { "name": "Zeka", "street": "Budisava, Vuka Karadžića bb" },
        { "name": "Neven", "street": "Kovilj, Vojvođanskih brigada 14" },
        { "name": "Zvončić", "street": "Kać, Save Maleševa b.b." },
        { "name": "Kolibri", "street": "Bulevar Jaše Tomića 3" },
        { "name": "Bambi", "street": "Karađorđeva 55" },
        { "name": "Vrtić Srna", "street": "Radoja Domanovića 24" },
        { "name": "Detelina sa 4 lista", "street": "Kalmana Langa 2" },
        { "name": "Pinokio", "street": "Begeč, Kralja Petra l, 45" },
        { "name": "Švrća", "street": "Jerneja Kopitara 1" },
        { "name": "Lane", "street": "Heroja Pinkija 25" },
        { "name": "Crvenkapa", "street": "Futog III, Proleterska 2" },
        { "name": "Biberče", "street": "Futog IV, Voj. Mišića bb" },
        { "name": "Radosnica", "street": "Adice, S. Šolaje bb" },
        { "name": "Dunavski cvet", "street": "Ćirila i Metodija 69" },
        { "name": "Kockica", "street": "Karlovačkih đaka 31a Sremski Karlovci" },
        { "name": "Čigra", "street": "Jože Vlahovića, bb" },
        { "name": "Cvrčak", "street": "Palmotićeva 1" },
        { "name": "Zeka", "street": "Bukovac, Vidovdanska 8" },
        { "name": "Čika Jova", "street": "Sremska Kamenica, Zmajevac 2" },
        { "name": "Zmaj", "street": "Sremska Kamenica II, Bul. 23. Oktobra 2" },
        { "name": "Plavi čuperak", "street": "Sremska Kamenica III, S. Miletića bb" },
        { "name": "Izvorčić", "street": "Stari Ledinci, V. Karadžića 63" },
        { "name": "Čarobnjak", "street": "Novi Ledinci, Đurđevdanska 1" },
        { "name": "Bubamara", "street": "Čenejska 50" },
        { "name": "Čarobni breg", "street": "Klisanski put 165" },
        { "name": "Vidovdanski zvončić", "street": "Vidovdansko naselje" },
        { "name": "Lasta", "street": "Čenej, Partizanska 2" },
        { "name": "Krcko oraščić", "street": "Orahova" },
        { "name": "Duga", "street": "Šangaj, VIII ulica br. 6" },
        { "name": "Veverica", "street": "Visarionova 4a" },
        { "name": "Đurđevak", "street": "Beogradski kej 37" },
        { "name": "Plavi zec", "street": "Miletićeva 22" },
        { "name": "Sigridrug", "street": "Almaška 24" },
        { "name": "Različak", "street": "Narodnog Fronta 45" },
        { "name": "Suncokret", "street": "Alekse Šantića 32" },
        { "name": "Poletarac", "street": "Puškinova 19" },
        { "name": "Zlatokosa", "street": "Veternik, Kralja Aleksandra, 62" },
        { "name": "Roda", "street": "Veternik, Paunova" },
        { "name": "Kamičak", "street": "Veternik, Milana Tepića" },
        { "name": "Novosađanče", "street": "Banović Strahinje bb" },
        { "name": "Zvezdani gaj", "street": "Stepanovićevo" },
        { "name": "Lienka", "street": "Kisač, Jana Amosa Komenskog" },
        { "name": "Veseli patuljci", "street": "Rumenka, P. Šandora 25" },
        { "name": "Plava Zvezda", "street": "Sajlovo 37" },
        { "name": "Petar Pan", "street": "Janka Čmelika 87" },
        { "name": "Cvrčak i mrav", "street": "Trg Majke Jevrosime 2" },
        { "name": "Kalimero", "street": "Dragiše Brašovana 16" },
        { "name": "Mrvica", "street": "Jirečekova 9" },
        { "name": "Veseli vrtić", "street": "Dr Ilije Đuričića 2" },
        { "name": "Čarolija", "street": "Sonje Marinković 1" },
        { "name": "Veseljko", "street": "Trg Komenskog 9" },
        { "name": "Maslačak", "street": "Narodnog fronta 42" },
        { "name": "Svitac", "street": "Stojana Novakovića bb" },
        { "name": "Guliver", "street": "Bate Brkića 1a" },
        { "name": "Bistričak I", "street": "Seljačkih Buna 63" },
        { "name": "Bistričak II", "street": "Seljačkih Buna 65" },
        { "name": "Zvezdan", "street": "Seljačkih Buna 51" },
        { "name": "Bajka", "street": "Stevana Hristića 15" },
        { "name": "Veseli vozić", "street": "Janka Čmelika 110" },
        { "name": "Vilenjak", "street": "Radnička 20" },
        { "name": "Meda", "street": "Radnička 47" },
        { "name": "Zlatna greda", "street": "Zlatne Grede 6" },
        { "name": "Vila", "street": "Vojvođanskih Brigada 14" },
        { "name": "Pčelica", "street": "Laze Kostića 5" },
        { "name": "Bubica", "street": "Pap Pavla 9" },
        { "name": "Panda", "street": "Nikole Tesle 4" },
        { "name": "Leptirić", "street": "Braće Krkljuš 15" },
        { "name": "Sunce", "street": "Gagarinova 10" },
        { "name": "Spomenak", "street": "Antona Urbana 2" },
        { "name": "Pužić", "street": "Vršačka 23" }
    ];

    // Helper function to extract city from street
    function extractCityAndAddress(street: string): { city: string; address: string } {
        // List of known neighborhoods/suburbs that should remain part of the address but are in Novi Sad
        const noviSadNeighborhoods = [
            'Futog', 'Veternik', 'Kać', 'Begeč', 'Čenej', 'Budisava', 'Kovilj',
            'Adice', 'Bukovac', 'Kisač', 'Rumenka', 'Šangaj', 'Stepanovićevo',
            'Sajlovo', 'Vidovdansko naselje', 'Orahova', 'Klisanski put'
        ];

        // Check for explicit city names in the address
        if (street.includes('Sremski Karlovci')) {
            return {
                city: 'Sremski Karlovci',
                address: street
            };
        }

        if (street.includes('Sremska Kamenica')) {
            return {
                city: 'Sremska Kamenica',
                address: street
            };
        }

        if (street.includes('Ledinci')) {
            const city = street.includes('Stari Ledinci') ? 'Stari Ledinci' : 'Novi Ledinci';
            return {
                city: city,
                address: street
            };
        }

        // Default to Novi Sad for all others
        return {
            city: 'Novi Sad',
            address: street
        };
    }

    const kindergartens = kindergartensData.map(k => {
        const { city, address } = extractCityAndAddress(k.street);
        const kindergarten = new Kindergarten();
        kindergarten.name = k.name;
        kindergarten.city = city;
        kindergarten.address = address;
        kindergarten.latitude = null;
        kindergarten.longitude = null;
        return kindergarten;
    });

    // Clear existing kindergartens before seeding
    const existingCount = await kindergartenRepository.count();
    if (existingCount > 0) {
        console.log(`Deleting ${existingCount} existing kindergartens...`);
        await kindergartenRepository.createQueryBuilder()
            .delete()
            .from(Kindergarten)
            .execute();
        console.log('Kindergarten table cleared.');
    }

    await kindergartenRepository.save(kindergartens);
    console.log(`Successfully seeded ${kindergartens.length} kindergartens!`);
}
