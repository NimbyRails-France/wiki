import snapshot from './generated/api.json'
import type { Article, Section } from './schema'
import { text, code, note, links, table } from './schema'

const descriptions: Record<string, string> = {
  Nimby: 'Point d’entrée du client : connexion et fonctions regroupées par usage dans Game.',
  Mod: 'Observations, réglages, décisions et contrats de signalisation et de conduite.',
  SignalMod:
    'Indication et ancienne déclaration à vocabulaire commun ; préférer signalModel pour les nouveaux projets.',
  SignalModel: 'Modèles indépendants : enums, règles, images, conduite et lecture typée du voisin.',
  ModServices: 'Déclarer un outil ou une action disponible lorsqu’un autre mod est chargé.',
  ToolContext:
    'Lire le réseau, préparer une pose, publier des boutons et écrire dans le journal depuis un outil.',
  SignalTypes: 'Valider les identifiants, catalogues et cases des modèles de signaux.',
  AutomaticDriving: 'Construire des consignes génériques avec les vitesses choisies par votre mod.',
  Translations: 'Textes d’interface traduits depuis le JSON du mod, avec paramètres et repli.',
  Files: 'Lire un fichier UTF-8 borné depuis Kotlin/Native.',
  NimbyClient: 'Connexion, captures, lectures ciblées et commandes du client Kotlin/JVM.',
  Observation: 'Trains, voies, signaux, services, horloge et collections observées.',
  DrivingObservation: 'Lecture ciblée d’un train et caractéristiques déclarées du matériel.',
  TrackMetric: 'Convertir les fractions de voie et les distances en mètres.',
  ModControl: 'Baux de recette, commandes temporaires et réponses du mod.',
  Construction: 'Tickets et résultats du pont de construction expérimental.',
  DiagnosticLog:
    'Journaux applicatifs avec rotation, regroupement des répétitions et suivi des erreurs.',
}
const extra: Record<string, Section[]> = {
  ToolContext: [
    {
      id: 'contrat-outil',
      title: 'Contexte, unités et opérations',
      blocks: [
        text(
          'Le contexte est prêt à utiliser dans service et onTick. Il appartient au callback courant : conservez les valeurs copiées et les tickets, jamais ce contexte. Le SDK refuse les appels après le retour du callback.',
        ),
        table(
          ['Valeur', 'Contrat'],
          [
            ['ToolTrack.lengthM', 'Mètres, optionnel ; null impose d’arrêter le parcours.'],
            ['SignalPosition.fraction', 'Fraction native strictement entre 0 et 1 pour une pose.'],
            [
              'SignalPosition.direction',
              'Sens natif -1 ou 1 ; distinct du sens visuel de certains modèles.',
            ],
            [
              'ConstructionResult.reason',
              'Code de refus du pont natif ; à conserver dans le journal.',
            ],
            [
              'ToolButton',
              'Identifiant, libellé, état activé ; au maximum 12 boutons par panneau.',
            ],
            [
              'ToolNumberInput',
              'Champ entier saisissable au clavier : id, label, value, minimum, maximum, enabled. Sélection, effacement et collage sont possibles. Un texte vide, incomplet ou hors limites reste un brouillon local et bloque les commandes ; seul un entier valide est transmis au mod. Quatre champs maximum, avec des identifiants distincts de ceux des boutons.',
            ],
            [
              'SignalActionRequest.value',
              'Nouvelle valeur entière pour une édition de champ (action contient son id) ; null pour un bouton. Une édition bloque les boutons jusqu’à la republication du panneau.',
            ],
            [
              'showPanel',
              'Message UTF-8 limité à 256 octets ; remplace l’action qui a ouvert l’outil.',
            ],
          ],
        ),
        note(
          'Ces API sont expérimentales sur la branche de développement. La construction nécessite le pont Windows correspondant. Les essais en jeu du nouveau panneau restent à effectuer.',
        ),
        links({ label: 'Créer un outil optionnel', to: '/mods/outils-optionnels' }),
      ],
    },
  ],
  TrackMetric: [
    {
      id: 'contrat',
      title: 'Unités et validation',
      blocks: [
        table(
          ['Élément', 'Type / unité', 'Validation'],
          [
            ['trackId', 'Long opaque', 'Non nul.'],
            ['lengthM', 'Double · mètres', 'Fini et strictement positif.'],
            ['offsetM(fraction)', 'Double · mètres', 'fraction finie dans [0, 1].'],
            ['fraction(offsetM)', 'Double · fraction', 'offsetM fini dans [0, lengthM].'],
            [
              'distanceM(fromFraction, toFraction)',
              'Double · mètres',
              'Distance absolue, sans notion d’itinéraire.',
            ],
          ],
        ),
        code(
          'val metric = fr.nimby.sdk.TrackMetric(trackId = 1L, lengthM = 800.0)\ncheck(metric.offsetM(0.25) == 200.0)\ncheck(metric.fraction(400.0) == 0.5)\ncheck(metric.distanceM(0.75, 0.25) == 400.0)',
        ),
        note(
          'Ces nombres servent à illustrer le calcul. En partie, utilisez les identifiants et métriques réellement observés. Les valeurs hors contrat provoquent IllegalArgumentException.',
        ),
      ],
    },
  ],
  Mod: [
    {
      id: 'unites',
      title: 'Unités et données inconnues',
      blocks: [
        table(
          ['Propriété / famille', 'Unité ou sens'],
          [
            ['speedMps, reopenedSpeedMps', 'mètres par seconde ; km/h ÷ 3,6.'],
            ['beginM, endM, headM, lengthM, marginM', 'mètres.'],
            ['…Mps2', 'mètres par seconde carrée.'],
            ['emptyMassKg, extraMassKg', 'kilogrammes.'],
            ['tractiveEffortN / powerW', 'newtons / watts.'],
            ['Observation.fresh', 'La fraîcheur des observations reçues.'],
            ['Occupancy.Unknown', 'Absence de preuve de canton libre ou occupé.'],
            ['DrivingPlan.available', 'Disponibilité du calcul du mod, pas permission native.'],
          ],
        ),
        text(
          'Signal, Observation et DrivingSettings de nimby concernent le mod natif. Les types de même nom dans fr.nimby.sdk appartiennent au client JVM : vérifiez vos imports.',
        ),
      ],
    },
  ],
  Files: [
    {
      id: 'usage',
      title: 'Lire un fichier',
      blocks: [
        code('val contenu = nimby.readTextFile("config/options.json")'),
        text(
          'Le chemin est résolu depuis le répertoire de travail. La lecture est limitée à 4 194 304 octets et ferme le fichier même en cas d’erreur. Le SDK ne parse pas automatiquement le JSON et n’enregistre pas ce fichier pour vous.',
        ),
      ],
    },
  ],
}

export const referenceArticles: Article[] = snapshot.files.map((file) => {
  const name = file.file.replace('.kt', '')
  const sections: Section[] = [
    {
      id: 'contexte',
      title: 'Contexte d’utilisation',
      blocks: [
        table(['Module', 'Package', 'Source SDK'], [[file.runtime, file.package, file.path]]),
        text(
          `Signatures extraites de la version ${snapshot.sdkVersion}. Les paramètres, leurs valeurs par défaut et les propriétés de constructeur sont conservés. Les corps des méthodes ne font pas partie de cette référence.`,
        ),
        note(
          'Une signature sans type de retour explicite utilise l’inférence Kotlin : l’expression affichée ou la KDoc précise son résultat. Les annotations de transport ne sont pas nécessaires pour appeler ces fonctions.',
        ),
      ],
    },
    ...(extra[name] || []),
  ]
  file.symbols.forEach((symbol, index) => {
    sections.push({
      id: `symbol-${index}`,
      title: symbol.owner ? `${symbol.owner}.${symbol.name}` : symbol.name,
      blocks: [
        code(symbol.signature, `${file.package} · ${symbol.kind}`),
        ...(symbol.documentation ? [text(symbol.documentation)] : []),
      ],
    })
  })
  return {
    slug: `reference/${name.toLowerCase()}`,
    title: name,
    group: 'Référence',
    description: descriptions[name] || 'Déclarations publiques Kotlin du SDK.',
    status: ['Construction', 'ToolContext', 'ModServices'].includes(name)
      ? 'experimental'
      : name === 'SignalMod'
        ? 'development'
        : undefined,
    sections,
  }
})

export const referenceIndex: Article = {
  slug: 'reference',
  title: 'Toute l’API Kotlin',
  group: 'Référence',
  description:
    'Les déclarations publiques des modules Kotlin/Native et Kotlin/JVM, regroupées par usage.',
  sections: [
    {
      id: 'mod',
      title: 'Créer un mod · Kotlin/Native',
      blocks: [
        text(
          'Le module nimby est inclus dans le kit Kotlin. Le plugin Gradle fournit le pont natif et le chargement du mod.',
        ),
        links(
          ...referenceArticles
            .filter(
              (a) =>
                snapshot.files.find(
                  (f) => `reference/${f.file.replace('.kt', '').toLowerCase()}` === a.slug,
                )?.runtime === 'Kotlin/Native',
            )
            .map((a) => ({ label: `${a.title} — ${a.description}`, to: `/${a.slug}` })),
        ),
      ],
    },
    {
      id: 'outil',
      title: 'Créer un outil · Kotlin/JVM',
      blocks: [
        text(
          'Le module fr.nimby.sdk fournit les lectures et commandes utilisées par les outils externes. Ses connexions doivent être fermées.',
        ),
        links(
          ...referenceArticles
            .filter(
              (a) =>
                snapshot.files.find(
                  (f) => `reference/${f.file.replace('.kt', '').toLowerCase()}` === a.slug,
                )?.runtime === 'Kotlin/JVM',
            )
            .map((a) => ({ label: `${a.title} — ${a.description}`, to: `/${a.slug}` })),
        ),
      ],
    },
    {
      id: 'couverture',
      title: 'Ce que couvre cette référence',
      blocks: [
        text(
          `${snapshot.files.length} fichiers publics Kotlin sont recensés dans cet instantané. Les constructeurs de data class indiquent leurs propriétés ; les enums affichent leurs valeurs. Les classes internes, détails JNA et adaptateurs C++ ne constituent pas l’API à utiliser dans vos mods.`,
        ),
        note(
          'Cette référence couvre l’API Kotlin effectivement présente dans les sources synchronisées. Elle ne prétend pas exposer toutes les fonctions internes du jeu. Les ajouts de boutons arbitraires, la traction directe et les fonctions non qualifiées ne deviennent pas disponibles par leur mention dans le wiki.',
        ),
      ],
    },
  ],
}
