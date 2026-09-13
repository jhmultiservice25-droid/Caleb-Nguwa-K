# ETAT CIVIL RDC — Intégration USSD

## Objectif
Permettre aux citoyens utilisant un téléphone simple d'accéder aux services essentiels sans Internet :

1. Pré-déclaration de naissance
2. Demande de document d'état civil
3. Suivi d'une demande
4. Vérification d'un document

Une opération USSD ne crée jamais directement un acte officiel. Elle crée une pré-demande traçable qui doit être contrôlée par un agent habilité.

## Menu principal

```text
ETAT CIVIL RDC
1 Naissance
2 Demander document
3 Suivre demande
4 Verifier document
5 Aide
```

## Sécurité du raccordement opérateur

Le webhook USSD externe ne doit être activé qu'après fourniture par l'opérateur ou l'agrégateur :

- du code court USSD attribué ;
- des adresses IP de sortie du gateway ;
- d'un secret ou mécanisme de signature ;
- du format exact du callback ;
- des contraintes de timeout et de taille de réponse ;
- du service SMS associé pour les notifications.

Le endpoint opérateur doit appliquer au minimum :

- HTTPS uniquement ;
- authentification du gateway par signature/HMAC ou clé dédiée ;
- liste blanche IP si l'opérateur la supporte ;
- rate limiting par numéro et par session ;
- anti-replay avec identifiant de session ;
- journalisation de chaque étape ;
- aucun secret opérateur dans le frontend ;
- aucun accès direct du gateway aux tables PostgreSQL ;
- écriture via fonction serveur privilégiée uniquement.

## Format canonique du callback

Le système interne normalise les paramètres suivants, quel que soit le fournisseur :

```json
{
  "sessionId": "session-operateur-unique",
  "phoneNumber": "+2438XXXXXXXX",
  "serviceCode": "*XXX#",
  "text": "1*10*Gombe*Jean Kabila*Enfant Kabila*12092026*1"
}
```

Les réponses sont de la forme :

```text
CON Texte du menu
```

pour continuer la session, ou :

```text
END Texte final
```

pour la terminer.

## Routage

Chaque demande stocke :

- numéro de téléphone ;
- identifiant de session opérateur ;
- type de service ;
- province ;
- commune/territoire ;
- données minimales nécessaires ;
- statut ;
- référence USSD unique ;
- horodatage.

Les demandes sont visibles uniquement par les agents de la juridiction correspondante, les administrateurs provinciaux concernés et l'administration nationale.

## Naissance par USSD

Le canal USSD collecte uniquement les informations minimales de pré-déclaration : province, commune/territoire, déclarant, enfant et date de naissance.

Statut initial : `identity_check_required`.

L'agent doit ensuite contrôler l'identité du déclarant et les pièces justificatives avant toute création d'acte.

## Demande de document

Le citoyen choisit le type de document et sa juridiction. Il reçoit une référence USSD. Le système peut ensuite envoyer un SMS lorsque le document est disponible.

Pour un téléphone simple, le mode de livraison privilégié est :

- notification SMS ;
- retrait au centre ;
- QR imprimé sur le document.

## Vérification

Le menu USSD peut confirmer uniquement des informations non sensibles :

- document valide / révoqué / inconnu ;
- type de document ;
- juridiction émettrice.

Aucune donnée personnelle détaillée ne doit être renvoyée par USSD.

## SMS

Le service SMS doit être utilisé pour :

- confirmer une référence de demande ;
- annoncer un changement de statut ;
- notifier qu'un document est disponible ;
- indiquer le centre de retrait.

Les messages SMS ne doivent jamais contenir de données sensibles d'état civil.

## Base de données

Les tables `ussd_requests` et `ussd_events` sont déjà créées dans Supabase ETAT CIVIL RDC avec RLS par juridiction.

## Étape d'activation opérateur

Dès qu'un opérateur/agrégateur fournit le code court et ses paramètres de sécurité, déployer le webhook USSD signé, brancher les SMS et effectuer :

1. test de session ;
2. test de reprise/timeout ;
3. test anti-replay ;
4. test de routage commune ;
5. test de charge ;
6. test de confidentialité ;
7. test d'audit ;
8. test de notification SMS.
