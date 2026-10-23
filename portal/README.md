# Prosjektportal

Forsiden på https://paradispartiet.github.io/ er en enkel, mobiltilpasset appvelger.

Kun åtte kuraterte prosjekter vises: History GO, Film Producer, Football Manager, Fysen, AHA EchoNet, Paradisavisa, Paradispartiet og Teorien om lyset.

EchoNet vises ikke separat fra AHA EchoNet. Skrivekunstakademiet, Kunstakademiet og History GO 2 vises ikke, siden de ikke skal presenteres som aktive prosjekter.

Tekniske GitHub-arkiver, forhåndsvisningsrepositorier og kildekodesnarveier vises ikke på forsiden. Arkivene er **ikke slettet** fra GitHub.

`portal/index.html` og rotens `index.html` skal alltid være identiske. De tre publiserte spillenes adresser beholdes, og `.github/workflows/sync-production-sites.yml` synkroniserer begge inngangssidene ved senere produksjonsoppdateringer.

`portal/check_portal.py` kontrollerer antall prosjektfliser, innhold som ikke skal vises, og bevaring av app-rutene. Nye prosjekter tas først inn i portalen når de er klare for å vises.
