import type { Article } from './schema'
import snippet from './snippets/Translations.kt?raw'

export const translationsGuide: Article = {
  slug: 'mods/traductions',
  group: 'Créer un mod',
  title: 'Traduire un mod',
  description: 'Un fichier JSON par mod, la langue du jeu et un repli choisi par le développeur.',
  sections: [
    {
      id: 'fichier',
      title: '1. Ajouter le fichier de traductions',
      blocks: [
        {
          kind: 'text',
          text: 'Créez assets/translations.json dans votre projet. Le plugin Gradle le copie à la racine du paquet, à côté des DLL. Il est lu et validé au chargement du mod. Aucun chargement manuel, bibliothèque Kotlin supplémentaire ou accès au processus n’est nécessaire.',
        },
        {
          kind: 'code',
          code: '{\n  "fallback": "en",\n  "languages": {\n    "en": {\n      "maintenance": "Maintenance mode",\n      "maintenance.help": "Enable the maintenance mode of this signal.",\n      "repeat": "Repeat",\n      "count.one": "{count} signal",\n      "count.many": "{count} signals"\n    },\n    "fr": {\n      "maintenance": "Mode maintenance",\n      "maintenance.help": "Activer le mode maintenance de ce signal.",\n      "repeat": "Répéter",\n      "count.one": "{count} signal",\n      "count.many": "{count} signaux"\n    }\n  }\n}',
          title: 'assets/translations.json',
          language: 'json',
        },
        {
          kind: 'text',
          text: 'fallback désigne la langue de repli de ce mod. Vous pouvez choisir fr ; si le champ est omis, le SDK utilise en. Cette langue doit exister et contenir toutes les clés du catalogue. Les autres langues peuvent être incomplètes. Les clés sont libres : repeat, panel.title ou error.network, par exemple.',
        },
      ],
    },
    {
      id: 'kotlin',
      title: '2. Utiliser tr dans les contrôles Kotlin',
      blocks: [
        {
          kind: 'text',
          text: 'Importez nimby.* ou nimby.tr et remplacez un libellé par tr("clé"). Cela fonctionne pour les titres de panneaux de signaux, les libellés et descriptions de Checkbox, les SignalAction, ToolButton, ToolNumberInput et le message de showPanel. Les noms techniques des réglages, des services et des actions restent des chaînes fixes.',
        },
        {
          kind: 'code',
          code: snippet,
          title: 'Contrôles et message traduits',
          language: 'kotlin',
        },
        {
          kind: 'text',
          text: 'Le service message.v1 de cet exemple doit être appelé par une action optionnelle d’un mod de signalisation. La déclaration de maintenance illustre une case à ajouter à votre modèle. Le SDK ne crée pas de menu ou de signal à partir du JSON.',
        },
        {
          kind: 'text',
          text: 'tr retourne une référence de texte que le SDK traduit au moment de préparer l’interface. Passez-la directement au contrôle : ne la concaténez pas et ne coupez pas la chaîne avec take. Pour les valeurs variables, utilisez des paramètres nommés. Les journaux doivent conserver leurs messages techniques ordinaires, pas une référence tr.',
        },
      ],
    },
    {
      id: 'parametres',
      title: '3. Paramètres et formes au pluriel',
      blocks: [
        {
          kind: 'text',
          text: 'Chaque paramètre Kotlin remplace le marqueur de même nom : tr("count.many", "count" to 3) donne « 3 signaux » en français. Les valeurs utilisent toString(), sans formatage automatique des nombres ou des dates. Chaque langue doit conserver les mêmes marqueurs pour une clé. {{ et }} affichent des accolades littérales. Une valeur de paramètre reste du texte, pas une seconde référence tr.',
        },
        {
          kind: 'text',
          text: 'Le SDK ne devine pas les règles de pluriel. Déclarez des clés distinctes et choisissez la clé dans votre mod, comme summary dans l’exemple. Vous pouvez ainsi écrire la formulation voulue dans chaque langue.',
        },
      ],
    },
    {
      id: 'repli',
      title: 'Langue du jeu et ordre de repli',
      blocks: [
        {
          kind: 'text',
          text: 'Le SDK Windows lit la langue effectivement active dans le jeu, indépendamment de la langue de Windows ou du Hub. Les codes du jeu courants comme eng et fra correspondent à en et fr. La casse et les séparateurs sont normalisés : FR_ca devient fr-ca. Vous pouvez déclarer des codes non convertis directement dans le JSON.',
        },
        {
          kind: 'list',
          items: [
            'Traduction exacte, par exemple fr-ca.',
            'Langue principale, par exemple fr.',
            'Langue fallback du mod, pour cette clé.',
            'Si la clé reste introuvable : [clé], pour rendre le problème visible.',
          ],
        },
        {
          kind: 'text',
          text: 'Une lecture de langue indisponible utilise directement le repli du mod. Un changement de langue prend effet lors de la préparation suivante de l’interface : aucune case, valeur saisie ou mémoire de conduite n’est réinitialisée. Chaque mod possède son catalogue ; la même clé peut donc avoir un texte différent dans deux mods.',
        },
      ],
    },
    {
      id: 'validation',
      title: 'Validation, limites et mise à jour',
      blocks: [
        {
          kind: 'text',
          text: 'Utilisez du JSON UTF-8 strict : pas de commentaires, de virgule finale ou de clé en double. Un catalogue incorrect empêche le chargement du mod avec une erreur dans le journal. verifyNativeMod contrôle aussi le catalogue du paquet dans un hôte isolé, sans lancer le jeu. Une clé absente ou des arguments incorrects dans une référence produisent [clé] à l’affichage.',
        },
        {
          kind: 'table',
          columns: ['Élément', 'Limite'],
          rows: [
            ['translations.json', '1 Mio maximum ; 64 langues.'],
            ['Catalogue d’une langue', '4 096 clés ; 4 096 octets UTF-8 par texte.'],
            [
              'Clé ou nom de paramètre',
              '1 à 96 caractères : lettres ASCII, chiffres, point, tiret et soulignement.',
            ],
            ['tr', '8 paramètres distincts ; référence complète limitée à 256 octets UTF-8.'],
          ],
        },
        {
          kind: 'text',
          text: 'Le JSON est chargé une fois. Après modification, reconstruisez le paquet puis rechargez le mod avec le SDK correspondant. Le changement de langue à l’affichage ne relit pas le disque. Cette API traduit les extensions d’interface créées par le SDK ; elle ne remplace pas les traductions intégrées au jeu ni celles des autres logiciels.',
        },
        {
          kind: 'links',
          items: [
            {
              label: 'Référence de tr',
              to: '/reference/translations',
            },
            {
              label: 'Créer un outil optionnel',
              to: '/mods/outils-optionnels',
            },
          ],
        },
      ],
    },
  ],
}
