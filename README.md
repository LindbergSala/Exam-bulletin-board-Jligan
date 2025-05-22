# Jönssons ligas Examinerande SQL-Bulletine

Detta projekt är ett backend-API för en digital anslagstavla där användare kan skapa kanaler, prenumerera på dem och utbyta meddelanden. API:et är byggt med Node.js, Express och PostgreSQL.

### Funktioner

- Skapa och hantera användare
- Skapa kanaler med en ägare
- Prenumerera på kanaler
- Posta meddelanden i kanaler du prenumererar på
- Hämta meddelanden från kanaler

### Teknisk struktur

- Node.js - JavaScript runtime
- Express - Webramverk för API-hantering
- PostgreSQL - Relationsdatabas
- pg - PostgreSQL-klient för Node.js

### Vår databas består av fyra huvudtabeller:

Users - Lagrar användarinformation

- id (PK)
- name
  
Channel - Lagrar kanalinformation

- id (PK)
- name
- owner_id (FK -> Users.id)
  
Subscription - Kopplingstabell för prenumerationer

- id (PK)
- user_id (FK -> Users.id)
- channel_id (FK -> Channel.id)
  
Message - Lagrar meddelanden

- id (PK)
- content
- user_id (FK -> Users.id)
- channel_id (FK -> Channel.id)

# Snabbinstallation

1. Hämta och installera
### Klona projektet
git clone https://github.com/LindbergSala/Exam-bulletin-board-Jligan

### Installera beroenden
npm install

2. Konfigurera
Skapa en .env-fil:

DATABASE_URL=postgres://användarnamn:lösenord@localhost:5432/din databas

Ersätt användarnamn och lösenord med dina PostgreSQL-inloggningsuppgifter, samt namn på din databas.

3. Initiera tabellerna

4. Kör sedan node server.js
