# OpenCRVS upstream

Ce projet suit le dépôt officiel `opencrvs/opencrvs-core`.

- Branche suivie : `develop`
- Commit de référence initial : `f132b8e26b23cff01b84f040e6d9e348b0103020`
- Date du commit de référence : 2026-09-11

Le script `scripts/bootstrap-opencrvs.sh` récupère la branche `develop` officielle et applique ensuite la configuration RDC stockée dans `countryconfig/`.

Cette stratégie permet de conserver un historique RDC propre tout en bénéficiant des mises à jour et correctifs de sécurité OpenCRVS.
