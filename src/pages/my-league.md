---
layout: ../layouts/ArticleLayout.astro
title: "Hello, World!"
author: "Matthew Phillips"
date: "09 Aug 2022"
---

# Procés de desenvolupament de my-league

## My-league és una plataforma que permet per una banda la creació administració de lligues de futbol i per l’altra visualització i seguiment dels resultats i estadístiques de les lligues.

L’objectiu principal d’aquest projecte ha sigut i és l’aprenentatge. Vaig començar-lo l’octubre del 2022 i l’he anat fent en el temps lliure. Per això ha anat evolucionant a ratxes: segons el temps i la motivació que tenia en cada moment. Tot i això, estic molt content de la constància que he tingut, i orgullós del resultat obtingut fins ara. No el considero un projecte acabat, sé que hi ha moltes coses que es poden millorar, però igualment n’estic content.

## Disseny i desenvolupament de la base de dades

### Primers passos

Vaig triar supabase perquè facilita molt el disseny i creació d’una base de dades. No has d’instal·lar res i a més a més t’ofereix una api REST per llegir i escriure des del client. Fa servir la bbdd postgreSQL, que ho tenia molt fresc perquè feia poc havia fet de profe de bbdd. I ofereix un plugin per consumir la API des de javascript. Així que ho vaig trobar molt adient pel meu projecte.

Vaig començar doncs amb la creació de les primeres taules“teams” i “matches”, la mínima expressió del projecte:

- teams: id, nom, points
- matches: id, date, local_team, visitor_team, result

Després vaig adonar-me que havia de definir una lògica que s’encarregués d’actualitzar la informació: quan s’actualitza un partit, s’ha d’actualitzar la informació dels equips que hi han participat. Vaig considerar dues opcions: tenir aquesta lògica en el frontend, o tenir-la en la bbdd. Vaig optar per la segona perquè vaig considerar que era més fàcil evitar errors de sincronització. Feia relativament poc que havia deixat de ser profe de bases de dades i tenia bastant fresca la programació en postgresql. Impartint l’assignatura em va quedar molt clar que si una cosa bona té SQL és la coherència de dades. I just ara fent memòria, recordo una parauleta màgica que els vaig fer aprendre als meus alumnes: “ACID”: atomicitat, coherència, aïllament i durabilitat.

### Lògica d’actualització de les dades

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

### Afegir les taules “players i “leagues”

Després vaig afegir la taula “players”, per afegir les dades dels jugadors dels equips i així poder oferir estadístiques.

Posteriorment vaig crear la taula “leagues”, que va permetre escalar i poder guardar més d’una lliga. Finalment han sigut 4 taules:

- leagues
- matches
- players
- team

Poc a poc vaig anar afegir més dades i més complexitat en les taules i les funcions per a mantenir la coherència de les dades.  
En total vaig escriure 10 funcions i 6 triggers.

Si t’interessa, pots consultar la base de dades completa en aquest \[enllaç\](https://github.com/eloicasamayor/my-league).

## Reptes i possibles millores futures

En la taula de teams hi guardo els gols a favor i en contra acumulats, i també desglossats amb “a casa” i “a fora”, també les victòries, derrotes i empats, el total de partits jugats i els punts acumulats (comptant 3 per victòria i 1 per empat).  
Això em va facilitar la feina a l’hora d’anar fent la lògica, però va arribar un punt en que em vaig adonar que guardar així la informació implica que no puc guardar la informació en curs d’un equip per a diferents lligues. Però bé, de moment no he afrontat aquest inconvenient.

Tal com he enfocat el disseny de les taules, ara mateix no és possible contemplar diferents tipus de tornejos. M’agradaria en un futur poder afegir la possibilitat de crear tornejos d’eliminatòries, o encara millor, de tornejos mixtos: amb fases de lligueta i eliminatòries.Ho vaig començar a probar creant una taula anomenada “phases”, però ho vaig deixar estar perquè no ho veia clar i implicava molts canvis.

Una altra cosa que m’agradaria implementar és la possibilitat de crear lligues sense gestionar jugadors. Ara mateix no és possible, perquè obligatòriament necessito que cada gol estigui associat a un jugador. Podria fer alguna solució des del front-end, però m’agradaria fer-ho possible a nivell de base de dades.

Una altra cosa que he pensat que podria afegir és la possibilitat de crear lligues privades. Això seria molt fàcil: simplement afegir una columna boleana, per exemple isPublic.

I encara una possible millora és poder guardar i generar estadístiques sobre els gols encaixats als porters. Això podria implicar afegir la dada de quina posició ocupa cada jugador i potser també dels minuts jugats.

Ara per ara, però, les millores més immediates seran de la part de front end; la base de dades haurà d’esperar per rebre actualitzacions.
