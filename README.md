# État Civil RDC — OpenCRVS RDC

Implémentation congolaise basée sur OpenCRVS pour la numérisation de l'état civil en République démocratique du Congo.

## Architecture

Ce dépôt contient la configuration RDC et les scripts permettant de travailler avec le moteur officiel OpenCRVS sans dupliquer inutilement tout son historique Git.

- **Moteur amont :** `opencrvs/opencrvs-core` (branche `develop`)
- **Configuration pays :** dérivée de `packages/countryconfig-template`
- **Pilote initial :** Kinshasa
- **Événements V1 :** naissance, décès, mariage
- **Langue initiale :** français

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

## Licence

Les fichiers dérivés d'OpenCRVS conservent les mentions et obligations de la Mozilla Public License 2.0 (MPL-2.0) ainsi que le disclaimer OpenCRVS applicable.
