# État Civil RDC — OpenCRVS RDC

Implémentation congolaise basée sur OpenCRVS pour la numérisation de l'état civil en République démocratique du Congo.

## Architecture

Ce dépôt contient la configuration RDC et les scripts permettant de travailler avec le moteur officiel OpenCRVS sans dupliquer inutilement tout son historique Git.

- **Moteur amont :** `opencrvs/opencrvs-core` (branche `develop`)
- **Configuration pays :** dérivée de `packages/countryconfig-template`
- **Pilote initial :** Kinshasa
- **Événements V1 :** naissance, décès, mariage
- **Langue initiale :** français

## Modules V1 déjà présents

- `countryconfig/src/config/rdc.ts` — configuration nationale RDC
- `countryconfig/src/config/roles.ts` — rôles et permissions
- `countryconfig/src/config/registration-number.ts` — génération des numéros d'actes
- `countryconfig/src/events/birth.ts` — naissance
- `countryconfig/src/events/death.ts` — décès
- `countryconfig/src/events/marriage.ts` — mariage
- `countryconfig/src/certificate/config.ts` — certificat et QR de vérification
- `countryconfig/src/locations/kinshasa.ts` — 24 communes de Kinshasa
- `countryconfig/src/locations/civil-registration-offices.ts` — centres pilotes techniques
- `countryconfig/src/index.ts` — point d'entrée de la configuration RDC

## Workflow métier V1

`DRAFT → DECLARED → REVIEW → REGISTERED → CERTIFIED`

L'agent prépare et déclare le dossier. L'officier d'état civil effectue le contrôle et l'enregistrement. Le certificat est ensuite émis avec un identifiant unique et un QR de vérification.

## Objectif

Construire une plateforme nationale sécurisée comprenant :

- portail public ;
- espace agent d'état civil ;
- espace officier d'état civil ;
- administration communale/provinciale/nationale ;
- génération de certificats ;
- vérification par QR code ;
- journal d'audit ;
- statistiques nationales ;
- hiérarchie administrative RDC.

## Installation du moteur OpenCRVS

```bash
bash scripts/bootstrap-opencrvs.sh
```

Le script clone le moteur officiel OpenCRVS et copie la configuration RDC dans l'environnement de développement local.

## Déploiement

OpenCRVS est une plateforme multi-services et ne doit pas être traité comme un simple site statique. Le déploiement complet exige les services OpenCRVS, PostgreSQL et les composants d'infrastructure associés. Les fichiers de ce dépôt préparent un environnement compatible Docker/Linux pour développement et déploiement serveur.

## Important — validation institutionnelle

Les formulaires, centres pilotes, modèles de certificats, règles de numérotation et pièces justificatives de cette V1 sont des configurations techniques de travail. Ils doivent être validés juridiquement et administrativement par les autorités compétentes de la RDC avant toute utilisation officielle en production.

## Licence

Les fichiers dérivés d'OpenCRVS conservent les mentions et obligations de la Mozilla Public License 2.0 (MPL-2.0) ainsi que le disclaimer OpenCRVS applicable.
