import type { Article } from './schema'
import { text, code, note, table, links } from './schema'

export const capabilities: Article[] = [
  {
    slug: 'commencer/possibilites',
    title: 'Trouver la bonne fonction',
    group: 'Commencer',
    description:
      'Du besoin à la fonction Kotlin : modèles, conduite, outils, lectures et maintenance.',
    sections: [
      {
        id: 'dans-le-mod',
        title: 'Construire un mod avec les fonctions du SDK',
        blocks: [
          text(
            'Les mods SFR et Signal Placement utilisent le même kit que vos projets. Le SDK fournit les mécanismes ; chaque mod garde ses indications, règles, vitesses, images et choix d’interface. Commencez par le guide correspondant, puis consultez la référence pour les signatures, propriétés, enums et valeurs optionnelles.',
          ),
          table(
            ['Votre besoin', 'Fonctions à découvrir'],
            [
              ['Plusieurs types dans un même mod', 'signalModel, signalMod, signal, Indication'],
              ['Règles et signal suivant', 'rules, next, of, drivingRule, invalidNetwork'],
              [
                'Train en approche sur plusieurs cantons',
                'observeApproach(blocks), trainApproaching, approachingTrain',
              ],
              [
                'Cases et réglages sauvegardés',
                'checkbox, enabled, settingsStatus, migrateSettings',
              ],
              ['Images fixes et clignotement', 'images, appearance, steady, blink, frameAt'],
              ['Conduite et permissions', 'AutomaticDriving, driving, DrivingRule, DrivingFlag'],
              ['Bouton fourni par un autre mod', 'action, whenMod, service, toolMod'],
              [
                'Panneau, saisie, aperçu et construction',
                'ToolContext, showPanel, ToolNumberInput, showSignalPreview, createSignals',
              ],
              ['Traduction et fichiers', 'tr, translations.json, readTextFile'],
            ],
          ),
          links(
            { label: 'Signaux et réseau', to: '/mods/signaux' },
            { label: 'Images et clignotement', to: '/mods/images' },
            { label: 'Consignes de conduite', to: '/mods/conduite' },
            { label: 'Coopérer avec un autre mod', to: '/mods/outils-optionnels' },
            { label: 'Réglages et migration', to: '/mods/reglages' },
            { label: 'Traduire son mod', to: '/mods/traductions' },
            { label: 'Quelques choix de SFR expliqués', to: '/mods/exemples-sfr' },
            { label: 'Toute l’API Kotlin', to: '/reference' },
          ),
        ],
      },
      {
        id: 'depuis-un-outil',
        title: 'Lire et agir depuis un outil Kotlin/JVM',
        blocks: [
          text(
            'Le client fr.nimby.sdk sert aux applications externes ; le module nimby sert aux mods chargés dans le jeu. Les données copiées peuvent être conservées, mais une ancienne observation ne devient pas fraîche parce qu’elle existe encore. Fermez les connexions et les sessions de contrôle lorsque votre outil a terminé.',
          ),
          table(
            ['Votre besoin', 'Fonctions à découvrir'],
            [
              ['Connexion et capture du réseau', 'Nimby.connect, Game, snapshot, Observation'],
              [
                'Lecture ciblée et matériel roulant',
                'readTrain, DrivingObservation, TrainDynamics',
              ],
              ['Distances sur les voies', 'TrackMetric, fraction, lengthM'],
              ['Calendrier du jeu', 'Game.clock, SimulationClock'],
              [
                'Commandes temporaires et diagnostic des mods',
                'Game.mods, ModControlSession, ControlRequest',
              ],
              ['Placement et suivi des opérations', 'Construction, tickets, résultats de création'],
              ['Journaux et recherche de bugs', 'DiagnosticLog, log, journaux du SDK et des mods'],
            ],
          ),
          links(
            { label: 'Connexion et observations', to: '/lire/connexion' },
            { label: 'Lire un train', to: '/lire/trains' },
            { label: 'Horloge de simulation', to: '/lire/horloge' },
            { label: 'Recettes et contrôle', to: '/lire/recettes' },
            { label: 'Placement de signaux', to: '/lire/construction' },
            { label: 'Journaux et dépannage', to: '/maintenance/journaux' },
          ),
          note(
            'La référence décrit les possibilités réellement exposées par le SDK, pas toutes les fonctions internes du jeu. Une observation n’autorise pas une écriture. Respectez les permissions, les tickets et les limites documentées pour chaque commande ; consultez les capacités disponibles avant de proposer une commande de conduite directe.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'mods/exemples-sfr',
    title: 'Quelques choix de SFR expliqués',
    group: 'Créer un mod',
    description: 'Trois extraits ciblés : approche, clignotement et permission après arrêt.',
    sections: [
      {
        id: 'approche',
        title: 'Le carré demande deux cantons d’anticipation',
        blocks: [
          code('observeApproach(blocks = 2)', 'Dans le modèle CarreAvertissement'),
          code(
            'if (!context.trainApproaching)\n    return closed(CarreReason.AwaitingApproach)\nreturn CarreDecision(CarreAspect.Warning, CarreReason.ApproachConfirmed)',
            'Fin de CarreRules.decide',
          ),
          text(
            'Ces lignes viennent après les vérifications des réglages, de la fraîcheur, des pannes, de l’arrêt forcé et de l’occupation aval. Elles ne suffisent donc pas seules à reproduire toute la règle. Le SDK observe et valide l’approche ; SFR choisit de fermer au repos et d’ouvrir à l’avertissement quand ses conditions sont remplies.',
          ),
          text(
            'Un ancien contrôle utilisait approaching ushr 48 != 5L : il lisait le tag natif de l’identifiant pour vérifier qu’il désignait un train. Ce détail est désormais traité par le SDK. Utilisez trainApproaching ou approachingTrain ; ne recopiez pas ce calcul dans vos signaux.',
          ),
          links({ label: 'Observer un train en approche', to: '/mods/signaux#approche' }),
        ],
      },
      {
        id: 'images',
        title: 'Le BAL déclare deux images et une durée',
        blocks: [
          code(
            'private val redFlash = blink(\n    on = "imgs/ca/sem_bal/tex09.svg",\n    off = "imgs/ca/sem_bal/tex10.svg",\n    everyMs = 500\n)',
            'Extrait de BalTextures',
          ),
          code('appearance { BalTextures.forAspect(it.aspect) }', 'Dans le modèle BalSignals'),
          text(
            'BalTextures associe chaque aspect à une description préparée une seule fois. Le SDK choisit la phase et transmet les deux images au jeu. Pour votre modèle, remplacez les chemins et la durée. Un carré sans clignotement utilise simplement images : il n’a pas besoin de recevoir une horloge.',
          ),
          links({ label: 'Images et clignotement', to: '/mods/images' }),
        ],
      },
      {
        id: 'conduite',
        title: 'Le motif de fermeture détermine la permission',
        blocks: [
          code(
            'BalAspect.S ->\n    if (decision.reason == BalReason.BlockOccupied)\n        AutomaticDriving.restrictedUntilNextSignal(\n            entrySpeedMps = 0.0,\n            maximumSpeedMps = ON_SIGHT_SPEED,\n            stopFirst = true\n        )\n    else AutomaticDriving.stop()',
            'Branche de BalDriving.fromDecision',
          ),
          text(
            'Cet extrait illustre un choix de SFR, pas une règle imposée aux autres mods. SFR distingue l’arrêt permissif pour occupation des autres motifs de fermeture. ON_SIGHT_SPEED est une valeur du mod en m/s. Le SDK exige l’arrêt demandé, applique les contrôles physiques et conserve le mode jusqu’au prochain signal ; il ne transforme pas toute fermeture en permission de repartir.',
          ),
          note(
            'Ces extraits expliquent des mécanismes réutilisables. Ils ne constituent ni le mod complet ni un règlement ferroviaire à appliquer à tous les modèles. Les exemples complets des guides déclarent leurs propres types, images et règles et sont vérifiés séparément.',
          ),
          links(
            { label: 'Consignes de conduite', to: '/mods/conduite' },
            { label: 'Tester son mod', to: '/maintenance/tests' },
          ),
        ],
      },
    ],
  },
]
