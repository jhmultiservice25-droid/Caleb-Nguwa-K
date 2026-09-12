# Déploiement production — État Civil RDC

Cette procédure vise un déploiement OpenCRVS sur serveur Linux avec une approche **security by design**.

## 1. Pré-requis

- Ubuntu 24.04 LTS recommandé ;
- domaine DNS pointant vers le serveur/cluster ;
- clé SSH (pas de mot de passe en production) ;
- compte de registre Docker pour l'image `countryconfig` ;
- sauvegarde externe chiffrée avant toute donnée réelle ;
- validation institutionnelle des formulaires, centres et règles métier RDC.

## 2. Durcir le serveur

Sur le serveur :

```bash
chmod +x deploy/production/bootstrap-server.sh
./deploy/production/bootstrap-server.sh
```

Le script active notamment : UFW, Fail2ban, auditd, mises à jour de sécurité, SSH par clé lorsque disponible, durcissement sysctl, Docker `no-new-privileges`, rotation des logs et Docker Swarm.

## 3. Préparer les variables

Sur la machine de déploiement :

```bash
cp deploy/production/.env.example .env.production
chmod 600 .env.production
```

Remplir les valeurs réelles. Générer les secrets avec :

```bash
openssl rand -base64 48
```

Ne jamais ajouter `.env.production`, clés SSH ou secrets au dépôt Git.

## 4. Authentification registre

```bash
docker login
```

Le compte doit pouvoir pousser l'image indiquée par `DOCKERHUB_ACCOUNT/DOCKERHUB_REPO`.

## 5. Préflight sécurité

```bash
chmod +x deploy/production/*.sh
deploy/production/prepare-runtime.sh
deploy/production/security-check.sh .env.production
```

Le déploiement s'arrête si des placeholders, secrets insuffisants ou réglages Traefik dangereux sont détectés.

## 6. Déployer

```bash
deploy/production/deploy-online.sh
```

Ce script :

1. récupère la configuration OpenCRVS officielle ;
2. injecte la couche RDC dans le runtime ;
3. neutralise les options Traefik `api.insecure` et `insecureskipverify` ;
4. exécute le contrôle sécurité ;
5. construit et pousse l'image country-config ;
6. appelle le mécanisme officiel `infrastructure/deployment/deploy.sh` ;
7. déploie la stack OpenCRVS en production.

## 7. Conditions avant données citoyennes réelles

Le simple fait que le site réponde en HTTPS ne signifie pas qu'il est prêt pour des données d'état civil. Avant mise en production institutionnelle, effectuer au minimum : revue RBAC, tests de pénétration, chiffrement/gestion des clés, plan de sauvegarde + test de restauration, journal d'audit, procédure incident, revue de confidentialité, validation juridique des actes, politique de rétention et test de haute disponibilité.

## Architecture de sécurité

```text
Internet
   |
   v
TLS / Traefik (80 -> 443)
   |
   +--> Portail / Gateway uniquement
   |
Overlay network privé
   |
   +--> Auth / Events / Documents / Search
   |
   +--> PostgreSQL / stockage / services internes

Secrets : runtime / Docker secrets, jamais Git
Administration : SSH par clé + firewall + Fail2ban
Traçabilité : auditd + logs OpenCRVS
CI : détection de secrets + validation des scripts + contrôle des flags dangereux
```

Pour un déploiement national, utiliser un cluster multi-nœuds privé et ne jamais exposer les ports Swarm (2377, 7946, 4789) directement à Internet.
