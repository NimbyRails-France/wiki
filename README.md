# Wiki NimbyRails France

Site Nuxt destiné à **https://wiki.nimbyrails-france.fr**.
Les guides se consultent sur le site ; ce fichier sert uniquement à travailler
sur son code. Dépôt : https://github.com/NimbyRails-France/wiki.

## Développement local

Node 24.11 ou plus récent dans la branche 24.

```sh
npm ci
npm run dev
```

Ouvrir l'adresse locale affichée. Aucun service distant n'est nécessaire.

## Contenu

- `app/content/guides.ts` : guides en français, blocs de texte, code et tableaux.
- `app/content/details.ts` : contrats pratiques et exemples supplémentaires.
- `app/content/en.json`, `ui-en.json`, `code-en.json` : traduction anglaise des
  articles, de l'interface et des explications dans les exemples. Une traduction
  absente bloque les tests et la génération ; aucun repli silencieux en français.
- `app/content/snippets/FirstMod.kt` : contenu Kotlin du tutoriel, compilé pour vérifier sa cohérence. Aucun projet d'exemple à installer.
- `app/content/generated/api.json` : instantané des déclarations publiques Kotlin.
- `app/content/reference.ts` : présentation et explications de la référence.
- `app/components` : navigation, recherche locale, contenu et copie du code.

Les guides sont structurés en TypeScript, sans moteur Markdown ni base de données.
La recherche reste dans le navigateur, sans envoyer les requêtes à un service tiers.
Le français conserve les adresses existantes ; l'anglais utilise `/en` et les
mêmes chemins et ancres. Le sélecteur conserve la page et la section consultée.
Après une modification du contenu français ou de la KDoc, mettre également à
jour la clé correspondante dans `en.json`. Les identifiants Kotlin et les IDs
de ressources des exemples restent identiques pour faciliter leur comparaison.
Les sources Kotlin peuvent être synchronisées depuis un checkout voisin :

```sh
npm run api:sync -- --sdk ../sdk
```

L'extracteur couvre les formes de déclaration du SDK, pas toute la grammaire
Kotlin. Vérifier le diff et les exemples après une évolution de l'API.
Le build du wiki reste autonome : il utilise l'instantané versionné.

## Vérification

```sh
npm test
npm run typecheck
npm run generate
npm run check:generated
```

Vérifier aussi la navigation, la recherche et la copie dans un navigateur
sans fenêtre, après génération :

```powershell
$env:WIKI_BROWSER_CHANNEL = 'msedge'
npm run test:browser
```

La configuration accepte aussi `chrome`, ou le Chromium de Playwright si
`WIKI_BROWSER_CHANNEL` n'est pas défini. Les tests ne pilotent aucune session
de navigateur personnelle. Les captures sont dans `test-results/`.

Sous Windows, avec Kotlin/Native 2.2.20 déjà disponible :

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-examples.ps1 -SdkRoot ../sdk
```

## Production

Publier uniquement le contenu généré de `.output/public`. Caddy peut le servir
directement : ni serveur Node, ni base de données ne sont nécessaires en production.
`deploy/compose.yaml` et `deploy/Caddyfile` définissent un serveur statique interne,
sur le réseau Docker `proxy`. `deploy/gateway.caddy` ajoute uniquement le domaine
du wiki au Caddy public, qui gère le certificat HTTPS automatiquement.

Après validation locale, transférer une archive tar.gz de `.output/public` avec
ces trois fichiers et `deploy/install.sh` dans un dossier de staging. Exécuter
`sudo bash install.sh <staging> <identifiant-release> <sha256-archive>`.
Le script vérifie l’archive, conserve la version précédente, bascule le lien
`storage/current`, valide puis recharge Caddy sans arrêter les autres sites.
Les fichiers se trouvent sous `/opt/docker/nimbyrailsfrance-wiki`.
Pour revenir en arrière, faire pointer `storage/current` vers la cible de
`storage/previous` avec un remplacement atomique du lien. Aucun rebuild nécessaire.
Les journaux HTTP sont accessibles avec `docker compose logs wiki` dans ce dossier,
avec rotation à 3 fichiers de 10 Mo. Les sources et clés privées ne sont pas déployées.

Le VPS est réservé à la production. Générer et tester sur le poste local ou sur
un runner distinct. Ce dépôt ne contient aucun déploiement automatique ni secret.
La publication est explicite ; un push Git ne modifie pas la production.
