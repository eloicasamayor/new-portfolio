---
layout: ../layouts/ArticleLayout.astro
title: "Hello, World!"
author: "Matthew Phillips"
date: "09 Aug 2022"
---

# Procés de desenvolupament de myLeague

## Taula de continguts

<details open>
<summary><a href='#bbdd'>Disseny i desenvolupament de la base de dades</a></summary>

1.  [Primers taules de la base de dades](#primers-passos)
1.  [Lògica d’actualització de les dades](#logica-actualitzacio)
1.  [Afegir les taules “players i “leagues”](#afegir-taules)
1.  [Reptes i possibles millores futures](#futures-millores)
</details>
<details open>
<summary><a href='#front-end'>Desenvolupament del front-end</summary>

1.  [Objectius](#primers-passos)
1.  [Elecció de framework i llibreries](#eleccio-llibreries)
1.  [Estructura del projecte](#logica-actualitzacio)
</details>

## My-league és una plataforma que permet per una banda la creació administració de lligues de futbol i per l’altra visualització i seguiment dels resultats i estadístiques de les lligues.

L’objectiu principal d’aquest projecte ha sigut i és l’aprenentatge. Vaig començar-lo l’octubre del 2022 i l’he anat fent en el temps lliure. Per això ha anat evolucionant a ratxes: segons el temps i la motivació que tenia en cada moment. Tot i això, estic molt content de la constància que he tingut, i orgullós del resultat obtingut fins ara. No el considero un projecte acabat, sé que hi ha moltes coses que es poden millorar, però igualment n’estic content.

## Disseny i desenvolupament de la base de dades<a id='bbdd'></a>

## Primers taules de la base de dades <a id='primers-passos'></a>

Vaig triar supabase perquè facilita molt el disseny i creació d’una base de dades. No has d’instal·lar res i a més a més t’ofereix una api REST per llegir i escriure des del client. Fa servir la bbdd postgreSQL, que ho tenia molt fresc perquè feia poc havia fet de profe de bbdd. I ofereix un plugin per consumir la API des de javascript. Així que ho vaig trobar molt adient pel meu projecte.

Vaig començar doncs amb la creació de les primeres taules“teams” i “matches”, la mínima expressió del projecte:

- teams: id, nom, points
- matches: id, date, local_team, visitor_team, result

Després vaig adonar-me que havia de definir una lògica que s’encarregués d’actualitzar la informació: quan s’actualitza un partit, s’ha d’actualitzar la informació dels equips que hi han participat. Vaig considerar dues opcions: tenir aquesta lògica en el frontend, o tenir-la en la bbdd. Vaig optar per la segona perquè vaig considerar que era més fàcil evitar errors de sincronització. Feia relativament poc que havia deixat de ser profe de bases de dades i tenia bastant fresca la programació en postgresql. Impartint l’assignatura em va quedar molt clar que si una cosa bona té SQL és la coherència de dades. I just ara fent memòria, recordo una parauleta màgica que els vaig fer aprendre als meus alumnes: “ACID”: atomicitat, coherència, aïllament i durabilitat.

## Lògica d’actualització de les dades <a id='logica-actualitzacio'></a>

Doncs bé, vaig començar a desenvolupar la lògica que s’encarregaria d’actualizar la informació cada cop que s’actualitzava un partit. Vaig tenir clar que havia de ser una funció postgre que es cridaria en qualsevol actualització de la taula matches.

A mesura que feia la lògica d'actualització de les dades, vaig anar afegint més complexitat per afegir informació que trobava que era important:

- A “matches” hi vaig afegir local_goals, visitor_goals, match_day.
- A “teams” hi vaig afegir urlname, goals_scored, goals_conceded, goals_scored_home, goals_scored

He volgut mostrar la funció update_teams_row com a exemple. Aquesta funció permet assegurar que les estadístiques dels equips es mantinguin correctament actualitzades després de cada partit.

```sql
DECLARE
 match_row record;
 team record;
 index int:=1;
BEGIN
 UPDATE teams SET
 goals_scored \= 0,
 goals_scored_away \= 0,
 goals_scored_home \= 0,
 goals_conceded \= 0,
 goals_conceded_away \= 0,
 goals_conceded_home \= 0,
 points \= 0,
 wins \= 0,
 defeats \= 0,
 draws \= 0,
 played_matches \= 0
 WHERE teams.id=teams.id;

FOR match_row in SELECT \* FROM matches where played \= true LOOP
 CALL update_teams_row(match_row);
 END LOOP;

FOR team in SELECT \* FROM teams LOOP
 UPDATE teams SET
 goals_conceded \= team.goals_conceded_home \+ team.goals_conceded_away,
 goals_scored \= team.goals_scored_home \+ team.goals_scored_away
 where id \= team.id;
 END LOOP;
 return NEW;
END;
```

Explicació de la lògica:

1. Primer establim totes les columnes de tots els equips a zero.
2. Després recorrem tots els partits que s'han jugat (on played \= true) i cridem la funció update_teams_row(match_row) que s’encarregarà d’actualitzar les estadístiques dels equips que van participar en cadascun d'aquests partits.
3. Finalment, recorrem tots els equips per sumar els gols a favor i en contra, a casa i a fora, i actualitzem aquestes dades.

## Afegir les taules “players i “leagues” <a id='afegir-taules'></a>

Després vaig afegir la taula “players”, per afegir les dades dels jugadors dels equips i així poder oferir estadístiques.

Posteriorment vaig crear la taula “leagues”, que va permetre escalar i poder guardar més d’una lliga. Finalment han sigut 4 taules:

- leagues
- matches
- players
- team

Poc a poc vaig anar afegir més dades i més complexitat en les taules i les funcions per a mantenir la coherència de les dades.  
En total vaig escriure 10 funcions i 6 triggers.

Si t’interessa, pots consultar la base de dades completa en aquest \[enllaç\](https://github.com/eloicasamayor/my-league).

## Reptes i possibles millores futures <a id='futures-millores'></a>

- <b>Poder tenir un equip en diferents lligues</b>
  En la taula de teams hi guardo els gols a favor i en contra acumulats, i també desglossats amb “a casa” i “a fora”, també les victòries, derrotes i empats, el total de partits jugats i els punts acumulats (comptant 3 per victòria i 1 per empat).  
  Això em va facilitar la feina a l’hora d’anar fent la lògica, però va arribar un punt en que em vaig adonar que guardar així la informació implica que no puc guardar la informació en curs d’un equip per a diferents lligues. Però bé, de moment no he afrontat aquest inconvenient.

- <b>Tornejos amb eliminatòries</b>
  Tal com he enfocat el disseny de les taules, ara mateix no és possible contemplar diferents tipus de tornejos. M’agradaria en un futur poder afegir la possibilitat de crear tornejos d’eliminatòries, o encara millor, de tornejos mixtos: amb fases de lligueta i eliminatòries.Ho vaig començar a probar creant una taula anomenada “phases”, però ho vaig deixar estar perquè no ho veia clar i implicava molts canvis.

- <b>Lligues sense gestió de jugadors</b>
  Una altra cosa que m’agradaria implementar és la possibilitat de crear lligues sense gestionar jugadors. Ara mateix no és possible, perquè obligatòriament necessito que cada gol estigui associat a un jugador. Podria fer alguna solució des del front-end, però m’agradaria fer-ho possible a nivell de base de dades.

- <b>Lligues privades</b>
  Una altra cosa que he pensat que podria afegir és la possibilitat de crear lligues privades. Això seria molt fàcil: simplement afegir una columna boleana, per exemple isPublic.

- <b>Estadístiques sobre gols encaixats i minuts jugats</b>
  I encara una possible millora és poder guardar i generar estadístiques sobre els gols encaixats als porters. Això podria implicar afegir la dada de quina posició ocupa cada jugador i potser també dels minuts jugats.

## Desenvolupament del front-end<a id='front-end'></a>

### Objectius <a id='objectius'></a>

1. <b>Interactivitat i usabilitat</b>
   Vull crear una aplicació molt interactiva i fàcil d'usar, amb una navegació senzilla entre les pàgines i apartats. La introducció de dades serà directa, evitant informació innecessària per assegurar una experiència intuitiva.
2. <b>Aplicació adaptativa</b>
   L'objectiu és desenvolupar una aplicació que s'adapti perfectament a qualsevol pantalla. L'elecció de Tailwind CSS serà clau per aconseguir-ho, permetent una disseny responsiu i flexible.
3. <b>Rapidesa</b>
   L'aplicació ha de ser ràpida tant en l'obtenció com en l'emmagatzematge de dades, garantint una experiència fluida. També, vull informar l'usuari durant els processos de càrrega o enviament d'informació.
4. <b>Accessibilitat</b>
   L'aplicació serà dissenyada per ser accessible, permetent el seu ús amb el teclat, amb el mínim suport del ratolí. Inclourà opcions de canviar entre mode clar i fosc.
5. <b>Estètica moderna i disseny coherent</b>
   La interfície visual serà atractiva i coherent, amb un disseny adaptat al públic objectiu, que consisteix principalment en homes joves.
6. <b>Escalabilitat</b>
   Desenvoluparé una arquitectura que permeti l'addició de noves funcionalitats de manera senzilla a mesura que el projecte creixi, assegurant així la seva sostenibilitat i adaptabilitat a futurs requisits.

### Elecció de framework i llibreries <a id='eleccio-llibreries'></a>

- <b>React</b> era la única peça que tenia 100% clar que faria servir. Més que res perquè és el framework de javascript que més he utilitzat i amb el que em sento còmode.
- <b>Vite</b>: el vaig triar perquè ja hi he treballat i m'agrada per la seva simplicitat. No aporta tantes coses com Nextjs, però és ràpid i et permet començar un projecte de react sense pensar gaire.
- <b>Redux</b>.Per a la gestió de l'estat, ja coneixia redux i tenia ganes d'aprendre a usar Redux Toolkit, doncs em vaig decidir a usar-lo.
- <b>Supabse.js</b> Per a les crides a la api vaig fer servir el plugin de javascript oficial que proveeix supabase. Integrar redux toolkit amb el plugin de supabase em va donar bastants maldecaps... però finalment ho vaig aconseguir.
- <b>Tailwind CSS</b> En quant als estils, he fet servir Tailwind perquè també em permet anar ràpid i mantenir fàcilment la coherència entre components.
- <b>Flowbite</b> També he fet servir força components predissenyats de Flowbite, una llibreria de components que usa Tailwind.

### Estructura del projecte <a id='estructura-projecte'></a>

```
./components:
Alert.jsx           Footer.jsx          icons/               LeagueDayMatchings.jsx  MatchesList.jsx       PageLayout.jsx      StepsNavigation.jsx
Classification.jsx  forms/              index.jsx            LeaguesList.jsx         Modal.jsx             PlayersList.jsx     TeamsList.jsx
Header.jsx          LeagueDayDate.jsx   MatchesCalendar.jsx  NewLeagueInfo.jsx       SortableHeadCell.jsx  WeekDaySelect.jsx

./components/forms:
EditLeagueForm.jsx  EditPhotoForm.jsx   EditTeamForm.jsx  NewMatchForm.jsx   NewTeamForm.jsx
EditMatchForm.jsx   EditPlayerForm.jsx  index.jsx         NewPlayerForm.jsx

./components/icons:
ArrowBackIcon.jsx   ArrowUpDown.jsx      ExclamationCircleIcon.jsx  Logo.jsx        PlusIcon.jsx      UpdateIcon.jsx
ArrowDownDoble.jsx  CircleCheckIcon.jsx  GithubIcon.jsx             MoreIcon.jsx    SettingsIcon.jsx  UploadIcon.jsx
ArrowLeft.jsx       DragDropIcon.jsx     HomeIcon.jsx               PencilIcon.jsx  TeamIcon.jsx      UserIcon.jsx
ArrowRight.jsx      EmailIcon.jsx        index.jsx                  PhotoIcon.jsx   TrashIcon.jsx

./helpers:
addDatesToMatchings.js  getMatchings.js  nameToUrlName.js  setMessage.jsx  truncateString.js       validateNewLeague.js
getFirstMatchDay.js     index.js         saveNewLeague.js  shuffle.js      useWindowDimensions.js

./pages:
index.js  LeaguePage.jsx  LeaguesPage.jsx  LoginPage.jsx  NewLeaguePage.jsx  TeamPage.jsx  UpdatePassword.jsx

./redux:
api/  auth/  constants.js  index.js  store.js

./redux/api:
apiSlice.js  index.js  leagues.js  matches.js  players.js  teams.js

./redux/auth:
slice.js
```

<style>
    h1 {
        text-wrap: "no-wrap";
    }
    h2 {
        margin-top: 3rem;
        font-size: 1.4rem;
    }
    h3 {
        margin-top: 3rem;
        font-size: 1.2rem;
    }
    details ol {
      padding-left: 2rem;
    }
    </style>
