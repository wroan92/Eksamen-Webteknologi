# Eksamensoppgave i webteknologi 2023

## Innholdsfortegnelse

- [Introduksjon](#introduksjon)
- [Installasjon](#installasjon)
- [Prosess og utvikling](#prosess-og-utvikling)
- [Database](#database)
- [Faglig Refleksjon](#faglig-refleksjon)

## Introduksjon

Oppgaven gikk ut på og skrive backend koden for en bloggplattform ved hjelp av Node.js, Express og SQLite3.

Vi har fått utdelt et NodeJS-prosjekt og en Frontend-løsning som grunnlag. Det har vært essensielt å sørge for at backenden jeg har utviklet fungerer sømløst med den gitt frontend-koden.

Prosjektet legger vekt på viktige aspekter som brukerautentisering, datasikkerhet og effektiv databehandling.

Plattformen støtter brukerpålogging og sikker lagring av brukerdata. For å sikre passordene blir brukerpassord hashet før lagring i databasen. Dette bidrar til å øke sikkerheten og beskyttelsen av brukernes informasjon.

## Installasjon

Påse at Node.js er installert på din datamskin, hvis ikke kan det lastes ned fra [Node.js offisielle nettside.](https://nodejs.org/en)

1. Last ned og pakk ut alle zipede filer til en ønsket mappe
2. Åpne mappen i f.eks Viritual Studio Code.
3. Installer Nødvendige pakker
4. Opprett SQLite3 databasefil (database.db)

### Klone prosjektet

```bash
git clone ........
```

### Installere prosjektet

```bash
npm install
```

Om noen pakker ikke blir installert med npm install kan man installere enkeltpakker ved f.eks

```bash
npm install bcrypt
```

### Kjøre prosjektet

```bash
npm start
```

Når du kjører npm start, leser Node.js index.js filen og utfører innholdet i koden. Dermed kjøres alt som er nødvendig for at applikasjonen skal kjøre, som f.eks å lytte på en spesifikk port.

```bash
npm run dev
```

Kjører index.js ved og bruke nodemon. Nodemon blir brukt for og kunne automatisk restarte serveren hver gang det gjøres endring i filene. Dette er nyttig i utviklingsprosessen for og slippe og manuelt restarte serveren hver gang det gjøres endringer i filene.

## Prosess og utvikling

### Node.js

Node.js er en server side plattform som lar javascript kjøre på serveren.

### Express

Express er et fleksibelt Node.js webapplikasjonsrammeverk som brukes som et verktøy for og bygge webservere. I dette prosjektet brukes Express for og forenkle prosessen med og sette opp serveren og håndtere HTTP forespørsler.

### SQLite3

Brukes for og opprette og håndtere databasen.

### bCrypt

Brukes til og hashe brukerens passord før de lagres i databasen for og øke sikkerheten og beskyttelsen av brukerens informasjon.

### JWT (JSON Web Tokens)

Brukes for og generere en token for å hå¨ndtere brukersesjoner og sikre at kun autentiserte brukere får tilgang til og poste nye innlegg.

### Middleware for autentisering

Et eget middleware er brukt for og sjekke gyldigheten av brukerens token i hver forespørsel som krever autentisering.

## Endepunkter

### <ins> Bruker </ins>

### post/register

Tilater nye brukere og registrere seg. Passordet hashes før det lagres.

### Post/login

Håndterer innlogging av brukere ved og verifisere brukernavn og det hashede passordet.

### post/logout

Logger brukeren ut ved og fjerne brukerens autentiseringstoken.

### <ins> Blogginnlegg </ins>

### get/posts

Henter alle blogginlegg fra databasen

### get/posts:id

Henter ett spesifikt blogginlegg basert på ID

### post/posts

Lar innloggede brukere oprette nye blogginnlegg

### put/post:id

Muliggjør oppdatering av et spesifikt inlegg av brukeren som har oprettet inlegget.

### delete/post:id

Lar brukeren slette sitt eget inlegg.

## Database

I dette prosjektet er det brukt SQLite3 for databasestyring og to tabeller er opprettet. En som heter "users" og en som heter "post".

<ins>Users</ins> inneholder tabellen om brukerne som er registrert. Her lagres en unik id for hver bruker og fungerer som primærnøkkel. "Username" lagrer brukernavnet til registrerte brukere. "password" lager brukerens passord som en hashet string ved hjelp av bCrypt. "email" lagrer brukerens epost, dette er viktig for identifikasjon og sørger for at man kan validere at brukeren kun har en konto ved og sjekke om eposten finnes i databasen. "dateCreated" er datoen og tiden brukerkontoen ble opprettet.

<ins>posts</ins> inneholder tabellen som håndterer lagringen av blogginnlegg. "id" for identifisering av hvert innlegg akkurat som i "users". "userId" som refererer til "id" i users tabellen. Dette feltet er nødvendig for og knytte hvert innlegg til en spesifik bruker. "title" som lagrer tittel feltet for inlegget. "content" som lagrer innholdet i innlegget og "datePostet" som lagrer tiden og datoen innlegget ble publisert.

## Faglig refleksjon

### Evaluering av eget arbeid

Jeg synes det ga noen utfordringer og ikke kunne jobbe med frontenden i prosjektet, sammtidig som det var god læring og måtte sette seg inn i frontenden og forstå hvordan den tok i mot informasjonen fra backenden. Jeg føler jeg har fått til det på en tilfredstillende måte. Jeg har fått implementert de dependencies som var i prosjektet, blant annet bCrypt for hashing og JWT for brukerautentisering. Jeg synes koden er godt organisert, har god struktur og håndterer feil effektivt ved og gi brukeren tilbakemelding ved ulike feilscenarier, noe som er med på og gi en god brukeropplevelse om en feil skulle oppstått.

Nå føler jeg rammene for prosjektet var satt, men om jeg skulle gjort noe annerledes ville det kanskje vært fornuftig og benyttet noe annet en SQLite3 som kanskje har noen begrensninger når det kommer til skalering, f.eks PostgreSQL eller MongoDB for bedre håndtering av større datamengder. Og jobbet mer med frontenden og lagt til flere brukerorienterte funksjoner.

### Veiledning og Justering

Jeg er usikker på hva som menes med "kunne blitt forbedret med veiledning", eksamen er jo en individuell oppgave som skal i utgangspunktet løses uten veiledning.

Jeg synes oppgaven sto godt i stil til pensum som har blitt godt gjennom på skolen, og på den måten har jeg ingenting og kommentere på oppgaven utover det.
