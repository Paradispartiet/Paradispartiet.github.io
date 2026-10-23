# Prosjektportalen

Denne mappen inneholder kildeforsiden for https://paradispartiet.github.io/.

- `index.html`: statisk, mobiltilpasset portefølje med tilgjengelig kategorifilter og søk. Alle 18 nåværende offentlige GitHub-arkiver er representert, men bare tre verifiserte produserte spill vises som publiserte apper.
- `check_portal.py`: enkel integritetstest for katalogen, GitHub-lenkene og de tre app-rutene.
- `.github/workflows/sync-production-sites.yml`: kopierer `portal/index.html` til `_site-root/index.html` ved publisering og bygger/oppdaterer de tre appene uforandret i egne mapper.

Prosjekter som bare har kildekode eller er under utvikling, åpner GitHub-arkivet i stedet for å love at en offentlig app finnes. Forhåndsvisninger er skilt fra produksjon. Nye prosjekter må legges til i portalen og i `EXPECTED_REPOS` før de blir synlige.
