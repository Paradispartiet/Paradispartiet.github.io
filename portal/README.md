# Prosjektportalen

Forsiden på https://paradispartiet.github.io/ er en kompakt, mobiltilpasset prosjektvelger.

- `portal/index.html` viser 11 prosjektfliser med ikon, navn og kort status. Tre publiserte spill åpner sine eksisterende produksjonsruter.
- Prosjekter uten verifisert publisert app åpner sine GitHub-repositories. Søk og kategorifiltre fungerer lokalt i nettleseren.
- Seks tekniske arkiver finnes i en sammenleggbar seksjon. `History-Go-2` er med vilje **ikke vist i portalen**; repositoryet slettes eller endres ikke.
- `portal/check_portal.py` kontrollerer 11 fliser, 17 listede GitHub-repositories, aktive app-ruter og publiseringsoppsettet.
- `.github/workflows/sync-production-sites.yml` kopierer portalens `index.html` til Pages-roten. De tre spillene ligger fortsatt i egne uendrede mapper.

Hold tekst og forsidestruktur kort og app-preget. Ikke legg til store hero-seksjoner, lange beskrivelser eller teknisk status på prosjektkortene.
