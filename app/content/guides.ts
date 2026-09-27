import type { Article } from './schema'
import { text, code, note, list, table, links } from './schema'
import firstMod from './snippets/FirstMod.kt?raw'

export const guides: Article[] = [
  {
    slug: 'commencer/bienvenue',
    title: 'Comprendre le SDK',
    group: 'Commencer',
    description:
      'Ce que vous écrivez, ce que le SDK prend en charge et comment choisir votre point de départ.',
    sections: [
      {
        id: 'votre-mod',
        title: 'Vous écrivez le comportement',
        blocks: [
          text(
            'Un mod définit des modèles de signaux, leurs réglages, leurs images et leurs règles. Le SDK lit les observations du jeu, résout les liens entre signaux et transmet les décisions. Les vitesses, permissions et règles de signalisation appartiennent au mod.',
          ),
          note(
            'Cette documentation décrit le SDK 0.8 en développement pour Windows. La séparation des plateformes est conservée dans le code ; Linux ne fait pas partie des distributions actuelles.',
          ),
        ],
      },
      {
        id: 'deux-usages',
        title: 'Deux façons d’utiliser Kotlin',
        blocks: [
          table(
            ['Usage', 'API', 'Exécution'],
            [
              [
                'Créer un mod de signalisation',
                'nimby · signalMod',
                'Kotlin/Native, chargé par le loader dans le jeu',
              ],
              [
                'Créer un outil, un TCO ou un banc de test',
                'fr.nimby.sdk · NimbyClient',
                'Application Kotlin/JVM connectée au processus du jeu',
              ],
            ],
          ),
          text(
            'Ces deux API servent des contextes différents. Le mod n’a pas besoin de rechercher le processus ni de charger manuellement la DLL SDK. L’application JVM ouvre une connexion explicite et la ferme avec use.',
          ),
          links(
            { label: 'Créer mon premier mod', to: '/commencer/premier-mod' },
            { label: 'Lire les données depuis une application', to: '/lire/connexion' },
          ),
        ],
      },
      {
        id: 'kotlin',
        title: 'Les bases Kotlin utiles',
        blocks: [
          table(
            ['Écriture', 'Signification'],
            [
              ['val', 'Une valeur que l’on ne réaffecte pas.'],
              ['fun', 'Une fonction.'],
              ['enum class', 'Une liste de valeurs nommées : Closed, Open…'],
              ['data class', 'Un ensemble de propriétés, copiable avec copy().'],
              ['Type?', 'La valeur peut être absente (null).'],
              ['when', 'Choisir un résultat selon plusieurs conditions.'],
              ['List<Type>', 'Une collection d’éléments de ce type.'],
              ['{ … }', 'Un bloc de configuration ou une fonction passée en paramètre.'],
            ],
          ),
          code(
            'val speedMps: Double? = null\nval label = speedMps?.let { "${it * 3.6} km/h" } ?: "Indisponible"',
          ),
          text(
            'Ne remplacez pas une vitesse inconnue par zéro pour prendre une décision : une absence de mesure n’est pas une preuve d’arrêt.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'commencer/installation',
    title: 'Préparer son projet',
    group: 'Commencer',
    description:
      'Installez les outils, créez votre propre projet Gradle et reliez-le au SDK Kotlin.',
    sections: [
      {
        id: 'outils',
        title: 'Installer le SDK et les outils',
        blocks: [
          list(
            'Installez IntelliJ IDEA et un JDK 21. Dans IntelliJ, choisissez ce JDK pour Gradle.',
            'Dans le Hub, installez le SDK et le loader pour le jeu. Choisissez le canal correspondant à votre version de mod.',
            'Téléchargez séparément le kit Kotlin de développement et extrayez-le dans un dossier durable, par exemple C:/NRF/kotlin-sdk.',
          ),
          links(
            { label: 'Télécharger le Hub', to: 'https://releases.nimbyrails-france.fr/' },
            {
              label: 'Télécharger le kit Kotlin 0.8.0-alpha.1',
              to: 'https://releases.nimbyrails-france.fr/releases/sdk/v0.8.0-alpha.1/NimbyRailsFranceSDK-kotlin-0.8.0-alpha.1-windows-x64.zip',
            },
            { label: 'Sources et versions du SDK', to: 'https://github.com/NimbyRails-France/sdk' },
          ),
          note(
            'Le SDK installé dans le jeu et le kit de développement ont deux rôles différents. Le kit contient sdk.json, klib, bridge et gradle-repository. Le Hub permet de sélectionner son chemin dans les réglages développeur ; il ne télécharge pas ce kit à la place du SDK du jeu.',
          ),
          note(
            'La nouvelle API signalMod présentée ici suit la branche de développement. Le kit alpha.1 publié avant cette refonte ne contient pas encore cette API. Utilisez un kit construit depuis cette branche pour ces pages, ou attendez sa prochaine distribution. Le lien reste celui du dernier kit publié ; ce n’est pas une promesse de compatibilité avec les nouveautés.',
            'Version de ce guide',
          ),
          text(
            'Le plugin Gradle fournit l’adaptateur natif. Vous n’écrivez ni exports DLL ni code C++ pour votre mod. Le premier build peut télécharger le compilateur Kotlin/Native.',
          ),
        ],
      },
      {
        id: 'ouvrir',
        title: 'Créer votre projet dans IntelliJ',
        blocks: [
          list(
            'Choisissez Nouveau projet, Kotlin, puis le système de construction Gradle avec Kotlin DSL. Nommez le projet mon-premier-mod et sélectionnez le JDK 21.',
            'Avant de remplacer les fichiers générés, ouvrez le terminal du projet et fixez la version du wrapper avec la commande ci-dessous.',
            'Supprimez le Main.kt de démonstration créé par IntelliJ. Remplacez les fichiers Gradle par les contenus ci-dessous.',
            'Créez gradle.properties à la racine pour indiquer le dossier du kit, puis rechargez les projets Gradle dans IntelliJ.',
          ),
          code(
            '.\\gradlew.bat wrapper --gradle-version 8.14.3',
            'Terminal du projet généré par IntelliJ',
            'powershell',
          ),
          code('nrfSdkDir=C:/NRF/kotlin-sdk', 'gradle.properties', 'properties'),
          code(
            `pluginManagement {
    val sdk = providers.gradleProperty("nrfSdkDir")
        .orElse(providers.environmentVariable("NRF_KOTLIN_SDK"))
        .orNull ?: error("Indiquez le dossier du kit Kotlin dans nrfSdkDir.")
    repositories {
        maven { url = uri(file(sdk).resolve("gradle-repository")) }
        gradlePluginPortal()
        mavenCentral()
    }
}
dependencyResolutionManagement { repositories { mavenCentral() } }
rootProject.name = "mon-premier-mod"`,
            'settings.gradle.kts',
          ),
          code(
            'plugins {\n    id("fr.nimbyrails.mod") version "0.8.0-alpha.1"\n}',
            'build.gradle.kts',
          ),
          text(
            'La version du plugin doit correspondre au champ gradlePluginVersion de sdk.json dans votre kit. Votre projet garde ses propres sources et son propre wrapper Gradle. Il n’a pas besoin d’un dépôt d’exemple.',
          ),
        ],
      },
      {
        id: 'fichiers',
        title: 'Donner une identité au mod',
        blocks: [
          text(
            'Créez mod.json à la racine du projet. Changez le nom, les identifiants et le module pour votre mod. Le hash ci-dessous désigne le binaire de jeu reconnu par ce SDK ; une autre version demande un SDK compatible.',
          ),
          code(
            `{
  "id": "mon-premier-mod",
  "name": "Mon premier mod",
  "modId": "MonPremierMod",
  "module": "MonPremierMod",
  "version": "0.1.0",
  "language": "kotlin-native",
  "sdkMin": "0.8.0-alpha.1",
  "sdkMaxExclusive": "0.9.0",
  "gameSha256": ["fff49ac21720abfc824c2b4f68b862727630eb0db71cfe1f9ea8f685d0db10ae"]
}`,
            'mod.json',
            'json',
          ),
          table(
            ['Fichier / dossier à créer', 'Rôle'],
            [
              ['src/main/kotlin/Entry.kt', 'Le point d’entrée createMod() et vos règles.'],
              ['assets/mod.txt', 'Le catalogue de textures et le signal constructible.'],
              ['assets/closed.svg et assets/open.svg', 'Les images de vos indications.'],
              ['src/test/kotlin/', 'Vos tests de règles, sans partie ouverte.'],
            ],
          ),
          links({ label: 'Écrire et compiler mon premier signal', to: '/commencer/premier-mod' }),
        ],
      },
    ],
  },
  {
    slug: 'commencer/premier-mod',
    title: 'Votre premier mod',
    group: 'Commencer',
    status: 'development',
    description:
      'Un exemple Kotlin complet : un modèle de signal, une case à cocher et deux indications.',
    sections: [
      {
        id: 'exemple',
        title: 'Le fichier Entry.kt',
        blocks: [
          text(
            'Dans le projet que vous venez de créer, ajoutez src/main/kotlin/Entry.kt. Ce premier signal pédagogique s’ouvre lorsque son canton est connu libre et reste fermé lorsque les données manquent.',
          ),
          code(firstMod, 'src/main/kotlin/Entry.kt'),
          note(
            'Le package nimby.mod et la fonction createMod sont le point d’entrée attendu par le SDK. Vos enums et vos règles restent du Kotlin ordinaire.',
          ),
        ],
      },
      {
        id: 'ressources',
        title: 'Créer le signal et ses images',
        blocks: [
          text(
            'Ajoutez ce catalogue dans assets/mod.txt. La valeur mon_premier_signal correspond au troisième argument de signal dans Entry.kt. Chaque image mentionnée dans le catalogue doit exister dans assets.',
          ),
          code(
            `[ModMeta]
schema=1
name=Mon premier mod
version=0.1.0
author=Votre nom

[SignalTextures]
id=mon_premier_signal
name_en=Mon premier signal
state=closed.svg
state=open.svg

[SignalTemplate]
name_en=Mon premier signal
kind=path
textures=mon_premier_signal`,
            'assets/mod.txt',
            'ini',
          ),
          code(
            '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="64" viewBox="0 0 32 64"><rect x="6" y="2" width="20" height="48" rx="10" fill="#161616"/><circle cx="16" cy="15" r="7" fill="#ef4444"/><path d="M16 50v14" stroke="#888" stroke-width="4"/></svg>',
            'assets/closed.svg',
            'xml',
          ),
          code(
            '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="64" viewBox="0 0 32 64"><rect x="6" y="2" width="20" height="48" rx="10" fill="#161616"/><circle cx="16" cy="37" r="7" fill="#22c55e"/><path d="M16 50v14" stroke="#888" stroke-width="4"/></svg>',
            'assets/open.svg',
            'xml',
          ),
          text(
            'Vous pouvez dessiner vos propres SVG ; conservez leurs noms ou modifiez ensemble le catalogue et images.',
          ),
        ],
      },
      {
        id: 'compiler',
        title: 'Construire votre mod',
        blocks: [
          code(
            '.\\gradlew.bat assembleReleaseMod verifyNativeMod',
            'Terminal à la racine de votre projet',
            'powershell',
          ),
          text(
            'assembleReleaseMod produit le paquet dans build/gradle/mod/release. verifyNativeMod vérifie le chargement, l’arrêt et le rechargement des DLL dans un hôte de diagnostic, sans ouvrir le jeu.',
          ),
          text(
            'Ajoutez ensuite votre projet dans le profil développeur du Hub, renseignez le même kit Kotlin et construisez puis lancez ce profil. Activez les ressources de votre mod dans le jeu et placez votre signal. La validation du comportement en partie reste une étape distincte.',
          ),
          links({ label: 'Écrire des tests pour vos règles', to: '/maintenance/tests' }),
        ],
      },
      {
        id: 'lire',
        title: 'Lire le code',
        blocks: [
          list(
            'signalMod crée le mod et demande un repli explicite si les données manquent.',
            'signal déclare un modèle constructible associé à un catalogue de textures.',
            'checkbox crée un réglage et renvoie une référence utilisable avec enabled.',
            'rules reçoit les observations du signal et renvoie une Indication.',
            'images choisit l’image ; driving choisit la consigne de conduite.',
          ),
          text(
            'Le code du mod reste du Kotlin ordinaire. Vous pouvez extraire une règle dans une fonction, utiliser des when et écrire des tests sans connaître l’adaptateur natif.',
          ),
        ],
      },
      {
        id: 'suite',
        title: 'Construire progressivement',
        blocks: [
          links(
            { label: 'Ajouter plusieurs types de signaux', to: '/mods/signaux' },
            { label: 'Configurer les réglages', to: '/mods/reglages' },
            { label: 'Tester les règles', to: '/maintenance/tests' },
          ),
        ],
      },
    ],
  },
  {
    slug: 'mods/signaux',
    title: 'Signaux et réseau',
    group: 'Créer un mod',
    status: 'development',
    description:
      'Plusieurs modèles dans un mod, des règles locales et des décisions liées au signal suivant.',
    sections: [
      {
        id: 'types',
        title: 'Un bloc signal par modèle',
        blocks: [
          code(
            'signal("monmod.principal", "Signal principal", "textures_principal") {\n    rules { Indication(Aspect.Closed, Reason.Unknown) }\n}\n\nsignal("monmod.annonce", "Signal d’annonce", "textures_annonce") {\n    rules { next } // null demande la résolution du signal suivant\n}',
            'À l’intérieur de signalMod',
          ),
          text(
            'Chaque type possède un identifiant et un catalogue uniques. Ses cases sont indépendantes : deux types peuvent avoir une case active avec des défauts différents. Les enums d’indication et de motif sont communes au mod pour interpréter le signal voisin.',
          ),
          note(
            'Le runtime accepte jusqu’à 16 types par mod et le service UI jusqu’à 16 panneaux au total. Chaque type accepte jusqu’à 64 cases. La résolution Kotlin est bornée à 512 signaux par appel.',
          ),
        ],
      },
      {
        id: 'reseau',
        title: 'Comprendre next',
        blocks: [
          text(
            'Le SDK tente d’abord une décision locale avec next = null. Si votre règle renvoie null, il résout le signal suivant et rappelle la règle avec sa décision. Un lien absent ou un cycle sans décision locale utilise invalidNetwork. Une fermeture locale peut donc interrompre la dépendance au voisin.',
          ),
          code(
            'rules {\n    when {\n        !fresh || !routeKnown -> Indication(Aspect.Closed, Reason.Unknown)\n        block == Occupancy.Occupied -> Indication(Aspect.Closed, Reason.Occupied)\n        else -> next\n    }\n}',
          ),
          text(
            'Une règle qui dépend du voisin doit aussi décider comment traiter ses propres observations inconnues. Le SDK ne transforme pas automatiquement un canton inconnu en canton libre.',
          ),
        ],
      },
      {
        id: 'approche',
        title: 'Observer un train en approche',
        blocks: [
          code(
            'signal("monmod.approche", "Signal à l’approche", "textures_approche") {\n    observeApproach = true\n    rules {\n        if (fresh && routeKnown && block == Occupancy.Clear && approachingTrain != null)\n            Indication(Aspect.Open, Reason.Clear)\n        else Indication(Aspect.Closed, Reason.Unknown)\n    }\n}',
          ),
          text(
            'approachingTrain contient un identifiant de train lorsque l’observation trouve son premier signal orienté dans le sens de marche. C’est une observation géométrique en amont ; elle ne prouve ni réservation ni autorisation de mouvement.',
          ),
          links({ label: 'Tous les types de contexte', to: '/reference/signalmod' }),
        ],
      },
    ],
  },
  {
    slug: 'mods/reglages',
    title: 'Réglages et migration',
    group: 'Créer un mod',
    status: 'development',
    description:
      'Déclarer les cases du panneau du signal et conserver les réglages des parties existantes.',
    sections: [
      {
        id: 'case',
        title: 'Une case avec un défaut explicite',
        blocks: [
          code(
            'val active = checkbox(\n    name = "active",\n    label = "Activer",\n    description = "Utiliser les règles de ce modèle.",\n    defaultValue = true\n)\nrules {\n    if (enabled(active)) Indication(Aspect.Open, Reason.Clear)\n    else Indication(Aspect.Closed, Reason.Disabled)\n}',
            'Extrait simplifié : ajoutez les contrôles d’observation de votre mod',
          ),
          table(
            ['Statut', 'Sens'],
            [
              ['Present', 'Le profil a été lu.'],
              ['Absent', 'Aucun profil enregistré pour ce signal.'],
              ['Unavailable', 'Le SDK ne peut pas fournir le profil.'],
            ],
          ),
          text(
            'enabled utilise le défaut déclaré si la clé est absente. Il ne transforme pas Unavailable en profil valide. Votre règle conserve l’accès à settingsStatus et aux valeurs brutes via signal.settings.',
          ),
        ],
      },
      {
        id: 'migration',
        title: 'Changer les réglages sans perdre les parties',
        blocks: [
          code(
            'migrateSettings { saved ->\n    if ("active" in saved) saved\n    else saved + ("active" to (saved["ancienActive"] ?: false))\n}',
          ),
          text(
            'La migration reçoit les valeurs réellement sauvegardées et doit être idempotente : la relancer ne doit plus changer le résultat. Les valeurs par défaut sont complétées par le SDK. Conservez les identifiants de type et de catalogue pour retrouver les profils.',
          ),
          note(
            'onlyWhenEnabled = true permet une case d’acquittement visible uniquement tant qu’elle vaut true, par exemple pour demander la vérification d’une ancienne configuration. Ce mécanisme ne doit pas inventer une permission ferroviaire.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'mods/images',
    title: 'Images et clignotement',
    group: 'Créer un mod',
    status: 'development',
    description: 'Choisir les textures du catalogue et les animer avec le temps de la simulation.',
    sections: [
      {
        id: 'images',
        title: 'Associer une image à une indication',
        blocks: [
          code(
            'images { indication ->\n    when (indication.aspect) {\n        Aspect.Closed -> "closed.svg"\n        Aspect.Open -> "open.svg"\n    }\n}',
          ),
          text(
            'Ces chemins doivent exister dans le catalogue déclaré pour le type. Le SDK applique la texture au catalogue du signal observé. Les codes d’indication restent communs au mod : utilisez des valeurs distinctes si deux modèles doivent sélectionner des images différentes.',
          ),
        ],
      },
      {
        id: 'clignoter',
        title: 'Animer sur l’horloge du jeu',
        blocks: [
          code(
            'animatedImages { indication, simulationMs, halfPeriodMs ->\n    when {\n        indication.aspect == Aspect.Closed -> "closed.svg"\n        simulationMs < 0 || halfPeriodMs <= 0 -> "off.svg"\n        (simulationMs / halfPeriodMs) % 2L == 0L -> "open.svg"\n        else -> "off.svg"\n    }\n}',
          ),
          text(
            'simulationMs et halfPeriodMs sont en millisecondes. En utilisant le temps simulé, l’image suit la pause et la vitesse de la simulation. Les images closed.svg, open.svg et off.svg sont à fournir par le mod.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'mods/conduite',
    title: 'Consignes de conduite',
    group: 'Créer un mod',
    description:
      'Le SDK fournit des opérations génériques. Votre mod choisit les vitesses et les conditions de libération.',
    sections: [
      {
        id: 'choix',
        title: 'Décrire une consigne',
        blocks: [
          table(
            ['Fonction', 'Effet'],
            [
              ['stop()', 'Arrêt absolu au signal courant.'],
              ['clear()', 'Libération des consignes qui attendent explicitement un Clear.'],
              [
                'announceStop(…)',
                'Objectif d’arrêt au signal cible, avec les permissions choisies par le mod.',
              ],
              ['limitAtSignal(…)', 'Plafond ponctuel au signal.'],
              [
                'limitUntilClearThenRear(…)',
                'Plafond retenu jusqu’au dégagement arrière d’un Clear franchi.',
              ],
              [
                'restrictedUntilNextSignal(…)',
                'Plafond avec couverture physique vérifiée jusqu’au signal suivant.',
              ],
            ],
          ),
          text(
            'Ces fonctions construisent une DrivingRule. Elles ne lisent pas le jeu et ne publient rien seules : renvoyez leur résultat dans le callback driving du mod.',
          ),
        ],
      },
      {
        id: 'vitesses',
        title: 'Les vitesses viennent du mod',
        blocks: [
          code(
            'val passageKmh = 25.0 // Exemple choisi par CE mod, pas une règle du SDK.\nval rule = AutomaticDriving.announceStop(\n    signalsAhead = 1,\n    passageSpeedMps = passageKmh / 3.6,\n    passableHere = false,\n    followTargetSpeed = true\n)',
          ),
          text(
            'Toutes les vitesses des consignes sont en m/s. signalsAhead accepte 1 ou 2 pour une annonce. passableHere concerne le panneau courant ; le panneau annoncé doit fournir sa propre permission. cancelAtNextClear exige followTargetSpeed et une cible à deux signaux.',
          ),
        ],
      },
      {
        id: 'limites',
        title: 'Une consigne n’est pas une permission native',
        blocks: [
          note(
            'Une marche à vue exige une couverture physique fraîche de la voie libre. Les permissions natives du jeu restent actives. La présence d’un constructeur de règle ne garantit pas la prise en charge de chaque scénario par le runtime.',
          ),
          links(
            {
              label: 'Signatures et paramètres AutomaticDriving',
              to: '/reference/automaticdriving',
            },
            { label: 'Recettes et commandes de contrôle', to: '/lire/recettes' },
          ),
        ],
      },
    ],
  },
  {
    slug: 'lire/connexion',
    title: 'Connexion et observations',
    group: 'Lire et agir',
    description: 'Lire le réseau depuis une application Kotlin/JVM, sans écrire de code natif.',
    sections: [
      {
        id: 'simple',
        title: 'L’entrée conseillée : Nimby.connect',
        blocks: [
          code(
            'import fr.nimby.sdk.Nimby\nimport java.nio.file.Path\n\nfun observer(sdk: Path, trainId: Long) {\n    Nimby.connect(sdk).use { game ->\n        val train = game.trains.read(trainId)\n        println(train?.speedMps)\n        val snapshot = game.snapshot()\n        println(snapshot.clock?.toInstant())\n    }\n}',
          ),
          text(
            'Sans processId, connect exige un seul jeu ouvert. Game regroupe trains, clock, signals, mods et construction. game.advanced donne accès aux opérations détaillées de NimbyClient sur la même connexion ; ne le fermez pas séparément.',
          ),
          links({ label: 'Game : toutes les fonctions par usage', to: '/reference/nimby' }),
        ],
      },
      {
        id: 'ouvrir',
        title: 'Choisir explicitement le jeu',
        blocks: [
          code(
            'import fr.nimby.sdk.*\nimport java.nio.file.Path\n\nfun lireReseau(dll: Path) {\n    val games = GameProcesses.discover()\n    require(games.size == 1) { "Choisissez un processus de jeu" }\n    NimbyClient.open(dll, games.single().pid).use { client ->\n        val snapshot = client.capture()\n        snapshot.trains.forEach { train ->\n            println("${train.name} : ${train.speedKmh ?: "inconnue"} km/h")\n        }\n    }\n}',
          ),
          text(
            'Passez le chemin réel de la DLL SDK installée. open vérifie la version SDK 0.8.x et l’ABI 2. Si plusieurs jeux sont ouverts, demandez à l’utilisateur de choisir : ne sélectionnez pas le premier silencieusement.',
          ),
          note(
            'Ce chapitre concerne les outils JVM. Le point d’entrée createMod du mod de signalisation reçoit ses observations automatiquement.',
          ),
        ],
      },
      {
        id: 'capture',
        title: 'Une capture contient des copies Kotlin',
        blocks: [
          text(
            'capture(selectedTrainId) retourne trains, voies, gares, signaux, services, quais, occupations et réservations observables. Un identifiant de train optionnel permet de demander son chemin et ses arrêts de ligne. Les résultats restent utilisables après fermeture de la connexion.',
          ),
          text(
            'null signifie indisponible, pas vide. Certaines listes non optionnelles du client sont toutefois normalisées à emptyList lorsque leur table native est indisponible : n’utilisez pas leur absence pour prouver que le monde est vide. Une capture externe ne garantit pas un tick atomique du jeu.',
          ),
          links(
            { label: 'Propriétés de toutes les observations', to: '/reference/observation' },
            { label: 'Fonctions du client', to: '/reference/nimbyclient' },
          ),
        ],
      },
    ],
  },
  {
    slug: 'lire/trains',
    title: 'Lire un train',
    group: 'Lire et agir',
    description:
      'Une lecture ciblée de la vitesse, de la position et des caractéristiques du matériel.',
    sections: [
      {
        id: 'cible',
        title: 'Lire uniquement le train demandé',
        blocks: [
          code(
            'fun afficherTrain(client: fr.nimby.sdk.NimbyClient, trainId: Long) {\n    val sample = client.readTrain(trainId) ?: return\n    val measuredSpeed = sample.speedMps\n    val dynamics = sample.currentDynamics\n    println(measuredSpeed?.let { "${it * 3.6} km/h" } ?: "Vitesse inconnue")\n    println(dynamics?.lengthM?.let { "$it m" } ?: "Longueur inconnue")\n}',
          ),
          text(
            'Cette lecture ne capture pas toutes les tables du réseau et n’installe pas de hook. Elle peut retourner null si le train est absent ou les données instables. Un mauvais identifiant ou une erreur de connexion déclenche une exception.',
          ),
        ],
      },
      {
        id: 'contrat',
        title: 'Comprendre les valeurs',
        blocks: [
          table(
            ['Valeur', 'Contrat'],
            [
              [
                'speedMps',
                'Vitesse en m/s, optionnelle. speedDefaulted distingue le zéro de présentation natif.',
              ],
              [
                'purchasedDynamics / currentDynamics',
                'Deux observations indépendantes : ne pas remplacer l’une par l’autre.',
              ],
              [
                'TrainDynamics',
                'Caractéristiques déclarées, pas performances mesurées ni masse chargée.',
              ],
              [
                'sessionGeneration',
                'Génération locale à cette connexion ; réinitialiser vos mémoires lors d’un changement et d’une reconnexion.',
              ],
              ['elapsedBeginMillis / elapsedEndMillis', 'Intervalle simulé encadrant la lecture.'],
              ['capturedAtMillis', 'Horodatage système, différent du temps du jeu.'],
            ],
          ),
          links({
            label: 'Tous les champs TrainDynamics et DrivingObservation',
            to: '/reference/drivingobservation',
          }),
        ],
      },
    ],
  },
  {
    slug: 'lire/voies',
    title: 'Voies et distances',
    group: 'Lire et agir',
    description: 'Convertir une position sur une voie en mètres avec TrackMetric.',
    sections: [
      {
        id: 'position',
        title: 'Fraction et sens',
        blocks: [
          text(
            'Position identifie une voie, une fraction entre 0 et 1 sur cette voie et un sens. Le mètre zéro est celui de la représentation de la voie, pas la tête du train. Pour la construction, le sens vaut -1 ou 1 et la fraction doit rester strictement entre les extrémités.',
          ),
          code(
            'import fr.nimby.sdk.TrackMetric\n\nfun distanceSurVoie(metric: TrackMetric): Double {\n    val depart = metric.fraction(100.0) // 100 m depuis l’origine de la voie\n    val arrivee = metric.fraction(200.0)\n    return metric.distanceM(depart, arrivee) // 100 m\n}',
            'Exemple pour une voie longue d’au moins 200 m',
          ),
        ],
      },
      {
        id: 'disponibilite',
        title: 'Une longueur doit être observée',
        blocks: [
          code(
            'fun longueur(snapshot: fr.nimby.sdk.Observation, trackId: Long): Double? =\n    snapshot.trackMetrics?.firstOrNull { it.trackId == trackId }?.lengthM',
          ),
          text(
            'trackMetrics peut être null si la DLL est ancienne ou le profil non pris en charge. Une ligne manquante reste inconnue. Une longueur ne prouve ni la continuité du trajet, ni l’absence d’aiguille, ni une autorisation de construire.',
          ),
          links({
            label: 'TrackMetric : types, paramètres et validation',
            to: '/reference/trackmetric',
          }),
        ],
      },
    ],
  },
  {
    slug: 'lire/horloge',
    title: 'Horloge de simulation',
    group: 'Lire et agir',
    description: 'Lire le temps du jeu et changer sa date depuis un outil Kotlin.',
    sections: [
      {
        id: 'lire',
        title: 'Lire une date UTC',
        blocks: [
          code(
            'val snapshot = client.capture()\nval date = snapshot.clock?.toInstant()\nprintln(date ?: "Horloge indisponible")',
          ),
          text(
            'SimulationClock contient epochSeconds et ticks. Un tick représente un centième de seconde. toInstant combine les deux et accepte une époque antérieure à 1970 ; des ticks négatifs sont rejetés.',
          ),
        ],
      },
      {
        id: 'changer',
        title: 'Modifier explicitement le calendrier',
        blocks: [
          code(
            'val result = client.setSimulationDateTime(\n    java.time.Instant.parse("2026-09-27T12:00:00Z"),\n    recalculateTrains = false\n)\nprintln(result.clock.toInstant())',
          ),
          text(
            'L’entrée doit être en secondes UTC entières, sans nanosecondes. Le runtime préserve la phase sous-seconde native. recalculateTrains demande en plus le recalcul natif des trains ; interventions indique son résultat compté.',
          ),
          note(
            'Cette commande écrit dans le jeu et n’est pas réessayée automatiquement. Une erreur peut survenir après un travail partiel : relisez l’état avant de décider d’une nouvelle commande.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'lire/recettes',
    title: 'Recettes et contrôle',
    group: 'Lire et agir',
    description:
      'Tester un mod déjà chargé : forcer une indication, modifier une case ou appliquer une contrainte temporaire.',
    sections: [
      {
        id: 'session',
        title: 'Acquérir une session temporaire',
        blocks: [
          code(
            'fun testerSignal(client: fr.nimby.sdk.NimbyClient, modId: String, signalId: Long, aspect: Int) {\n    client.acquireModControl(modId, leaseMillis = 5000).use { recipe ->\n        recipe.forceSignal(signalId, aspect)\n        val state = recipe.readSignal(signalId)\n        println(state.detail)\n        recipe.restoreSignal(signalId)\n    }\n}',
          ),
          text(
            'Le mod doit être chargé dans le processus choisi et avoir observé un monde. Les codes d’indication et indices de case appartiennent au mod. Le SDK ne devine pas la signification d’un nombre. Le mod peut refuser un forçage.',
          ),
        ],
      },
      {
        id: 'expiration',
        title: 'Durée, restauration et erreurs',
        blocks: [
          list(
            'Le bail dure de 1 000 à 60 000 ms. Renouvelez-le explicitement avec renew si la recette dure plus longtemps.',
            'close libère le contrôle ; l’expiration abandonne également les surcharges temporaires.',
            'restoreSignal, restoreTrain et restoreSetting retirent une surcharge ciblée. clear les retire toutes pour cette session.',
            'Une erreur de transport ne déclenche pas de nouvelle écriture automatique. Inspectez les observations et le statut.',
          ),
          note(
            'readSignal retourne la dernière décision évaluée. readTrain.active encode un TrainControlState : ce n’est pas une autorisation native de mouvement.',
          ),
          links({ label: 'Commandes, modes et réponses', to: '/reference/modcontrol' }),
        ],
      },
      {
        id: 'texture',
        title: 'Affichage temporaire uniquement',
        blocks: [
          code(
            'client.showSignalTextureFor(signalId, catalogue, "test.svg", durationMillis = 5000)\n// Plus tard :\nclient.restoreSignalTexture(signalId)',
          ),
          text(
            'Cette commande change l’affichage pour 1 à 60 secondes. Elle ne change ni les règles du mod ni les permissions du signal. Pour tester le comportement, utilisez une recette de contrôle acceptée par le mod.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'lire/construction',
    title: 'Placement de signaux',
    group: 'Lire et agir',
    status: 'experimental',
    description:
      'Le protocole de construction expérimentale utilisé pour préparer Signal Placement.',
    sections: [
      {
        id: 'cycle',
        title: 'Préparer, créer, observer',
        blocks: [
          code(
            'val ready = client.prepareConstruction(sourceSignal)\nif (ready.state == fr.nimby.sdk.ConstructionState.READY) {\n    val result = client.createSignals(ready.token, sourceSignal, positions)\n    println(result.state)\n    // Si PENDING, consulter pollConstruction(result.token).\n    // Ne jamais répéter createSignals pour attendre la réponse.\n}',
          ),
          text(
            'Le pont expérimental doit être construit séparément. Une série contient au maximum 64 positions distinctes sur des voies valides, fractions strictement entre 0 et 1 et sens -1 ou 1. Les tickets appartiennent à une session de jeu et à sa révision de construction.',
          ),
        ],
      },
      {
        id: 'annuler',
        title: 'Annuler seulement la bonne série',
        blocks: [
          text(
            'undoConstruction(token) refuse si une autre commande a remplacé la série au sommet de l’historique natif. Vérifiez canUndo et l’état retourné. READY, APPLIED, UNDONE, REJECTED, PARTIAL et PENDING sont distincts.',
          ),
          note(
            'L’intégration optionnelle d’un bouton de répétition dans le panneau d’un signal n’est pas encore une API publique disponible. Cette page ne prétend pas qu’un mod peut déjà ajouter arbitrairement des boutons au jeu.',
          ),
          links({ label: 'Résultats et états de construction', to: '/reference/construction' }),
        ],
      },
    ],
  },
  {
    slug: 'maintenance/tests',
    title: 'Tester son mod',
    group: 'Maintenance',
    description: 'Vérifier les règles en Kotlin avant les essais dans une vraie partie.',
    sections: [
      {
        id: 'unitaire',
        title: 'Tester sans lancer le jeu',
        blocks: [
          code(
            'import kotlin.test.Test\nimport kotlin.test.assertEquals\nimport nimby.*\n\nclass SignalTests {\n    @Test fun unknownBlockStaysClosed() {\n        val mod = nimby.mod.createMod()\n        val decision = mod.evaluate(\n            mapOf("active" to true),\n            Observation(block = Occupancy.Unknown, fresh = true, routeKnown = true)\n        )\n        assertEquals(nimby.mod.Aspect.Closed.ordinal, decision.aspect)\n    }\n}',
          ),
          text(
            'Lancez les tests Kotlin/Native Windows du projet Gradle. Testez les données inconnues, la péremption, les réglages absents, les liens manquants et les cycles, en plus du cas nominal. evaluateNetwork permet de fournir plusieurs Signal et de vérifier leurs décisions ensemble.',
          ),
        ],
      },
      {
        id: 'reel',
        title: 'Séparer les niveaux de validation',
        blocks: [
          table(
            ['Vérification', 'Ce qu’elle prouve'],
            [
              ['Tests des règles', 'Le résultat du code Kotlin sur les observations fournies.'],
              ['Tests du pont natif', 'La transmission des types et le cycle de vie des DLL.'],
              [
                'Recette en partie',
                'Le comportement sur le binaire et la sauvegarde réellement utilisés.',
              ],
            ],
          ),
          text(
            'Des tests unitaires verts ne prouvent pas qu’une nouvelle interaction avec l’interface native fonctionne en partie. Consignez le scénario, le résultat attendu, le résultat observé et les versions.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'maintenance/journaux',
    title: 'Journaux et dépannage',
    group: 'Maintenance',
    description:
      'Fournir des éléments utiles pour reproduire un problème et identifier la couche concernée.',
    sections: [
      {
        id: 'emplacement',
        title: 'Retrouver les journaux',
        blocks: [
          text(
            'Le client JVM écrit par défaut dans %LOCALAPPDATA%/NimbyRailsFrance/logs/<composant>/. La variable NRF_LOG_DIR permet de choisir une autre racine. DiagnosticLog produit des fichiers par processus avec rotation.',
          ),
          code(
            'val log = fr.nimby.sdk.DiagnosticLog.forComponent("mon-outil")\nlog.startApplication("0.1.0") // Une fois, au démarrage de votre application.\nlog.write("Chargement du profil terminé")',
          ),
          note(
            'startApplication installe un gestionnaire global d’exceptions et un hook d’arrêt JVM. Utilisez-le au point d’entrée de votre application, pas dans une bibliothèque chargée chez un autre programme.',
          ),
        ],
      },
      {
        id: 'rapport',
        title: 'Un rapport reproductible',
        blocks: [
          list(
            'Version du SDK, du mod, de l’outil et du jeu ; version de Windows.',
            'Étapes exactes, comportement attendu et comportement observé.',
            'Identifiants des objets concernés et heure de l’incident.',
            'Journaux du composant et, si utile, ceux du loader et du hub.',
          ),
          text(
            'Un journal peut contenir des chemins locaux et des noms de données du jeu. Relisez ce que vous partagez. Les erreurs JVM et les crashs natifs ne produisent pas les mêmes diagnostics.',
          ),
          links({ label: 'DiagnosticLog : méthodes et rotation', to: '/reference/diagnosticlog' }),
        ],
      },
    ],
  },
  {
    slug: 'maintenance/contribuer',
    title: 'Faire évoluer le wiki',
    group: 'Maintenance',
    description: 'Le site officiel se corrige dans le dépôt wiki, au même rythme que l’API.',
    sections: [
      {
        id: 'sources',
        title: 'Un site, une source versionnée',
        blocks: [
          text(
            'Les guides vivent dans app/content sous forme de pages structurées TypeScript, sans collection de fichiers Markdown à parcourir. Les composants Vue affichent les textes, exemples, tableaux et liens. La référence Kotlin est un instantané extrait des déclarations publiques du SDK.',
          ),
          code(
            'npm ci\nnpm run api:sync -- --sdk ../sdk\nnpm test\nnpm run typecheck\nnpm run generate',
            'Depuis le dépôt wiki',
            'shell',
          ),
          text(
            'api:sync nécessite les sources du SDK localement ; le build du site utilise l’instantané versionné et reste autonome. Après une modification de l’API, révisez aussi les explications et exemples : une signature extraite ne remplace pas un tutoriel.',
          ),
        ],
      },
      {
        id: 'production',
        title: 'Préparer la mise en ligne',
        blocks: [
          text(
            'La génération produit un site statique dans .output/public. Le domaine prévu est wiki.nimbyrails-france.fr, servi en HTTPS par Caddy. Le fichier de déploiement du dépôt est un modèle à intégrer à la configuration existante ; il ne modifie pas le VPS.',
          ),
          note(
            'Le VPS reste réservé à la production. Les installations de dépendances, tests et générations se font sur le poste de développement ou sur un runner distinct. Aucune publication n’est déclenchée par la consultation du wiki.',
          ),
        ],
      },
    ],
  },
]
