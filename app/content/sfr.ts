import type { Article } from './schema'
import { text, table, code, note, links } from './schema'

export const sfrGuide: Article = {
  slug: 'mods/sfr',
  title: 'Signalisation française réaliste',
  group: 'Créer un mod',
  status: 'development',
  description:
    'Le mod SFR comme exemple complet : BAL, Carré simple Avertissement, réglages et organisation du Kotlin.',
  sections: [
    {
      id: 'modeles',
      title: 'Deux modèles dans le même mod',
      blocks: [
        table(
          ['Modèle', 'Catalogue', 'Comportement'],
          [
            [
              'BAL — Sémaphore A',
              'sfr_bal_a_cpp_v1',
              'Indications BAL selon le canton, le voisin et les options activées.',
            ],
            [
              'Carré simple Avertissement',
              'sfr_cs_a_v1',
              'Carré au repos ; avertissement à l’approche confirmée, lorsque le canton protégé est libre.',
            ],
          ],
        ),
        text(
          'Le Carré simple Avertissement peut être utilisé en fin de BAL, mais cet usage ne limite pas le modèle. Il demeure fermé si le profil, l’itinéraire, l’occupation ou les données fraîches manquent. Une approche ne remplace pas les permissions natives du jeu.',
        ),
        note(
          'SFR doit rester utilisable seul. Le bouton de répétition prévu avec Signal Placement est une intégration optionnelle encore à terminer ; aucune dépendance obligatoire n’est ajoutée au mod.',
        ),
      ],
    },
    {
      id: 'options',
      title: 'Les cases du BAL',
      blocks: [
        table(
          ['Case', 'Effet'],
          [
            ['Vert CLI Cantonnement', 'Préannonce selon le signal suivant.'],
            [
              'Vert CLI Travaux',
              'Indication de travaux si une indication plus restrictive ne s’impose pas.',
            ],
            ['Jaune CLI', 'Annonce à distance réduite selon le voisin.'],
            [
              'Rouge CLI',
              'Condition de rouge clignotant sur canton occupé et itinéraire connu ; ne force pas une permission native.',
            ],
          ],
        ),
        text(
          'Le BAL est calculé automatiquement pour chaque signal de ce modèle. Ces quatre cases choisissent uniquement les variantes clignotantes. Les anciennes clés active, endOfBal et needsReview sont retirées des profils : elles ne désactivent plus le BAL et ne peuvent plus supposer un aval libre. Sans signal aval exploitable, le résultat reste indéterminé.',
        ),
        text(
          'La migration conserve les conditions combinées des anciennes options clignotantes ; une option incomplète reste décochée. Le Carré possède sa propre case d’ouverture automatique : décochée, elle maintient le carré fermé.',
        ),
      ],
    },
    {
      id: 'code',
      title: 'Où modifier le comportement',
      blocks: [
        table(
          ['Fichier / dossier', 'Responsabilité'],
          [
            ['Entry.kt', 'Appelle la déclaration du mod.'],
            [
              'sfr/FrenchSignalsMod.kt',
              'Assemble les modèles, les images et la conduite avec signalMod.',
            ],
            [
              'sfr/signalling/BalSignals.kt',
              'Déclare le modèle BAL, ses migrations et ses observations.',
            ],
            ['sfr/signalling/BalRules.kt', 'Décide les indications BAL à partir des observations.'],
            [
              'sfr/signalling/CarreAvertissement.kt',
              'Déclare le Carré et ses conditions d’ouverture.',
            ],
            ['sfr/settings', 'Options utilisateur et conversion des anciens réglages.'],
            ['sfr/rendering', 'Choix des SVG et clignotement au temps simulé.'],
            ['sfr/driving', 'Vitesses, annonces, contraintes et modèle de conduite propres à SFR.'],
          ],
        ),
        text(
          'SignalDecision est un alias du type Indication du SDK avec les enums Aspect et Reason de SFR. Le mod ne convertit plus chaque résultat en entiers pour traverser le pont natif.',
        ),
      ],
    },
    {
      id: 'textures',
      title: 'Les textures utilisées',
      blocks: [
        table(
          ['Indication', 'Image dans le projet SFR'],
          [
            ['Indéterminé / inactif', 'imgs/ca/sem_bal/xx.svg / tex00.svg'],
            [
              'Voie libre / avertissement / sémaphore',
              'imgs/ca/sem_bal/tex02.svg / tex03.svg / tex04.svg',
            ],
            [
              'Vert / jaune / rouge clignotants',
              'Paires tex05–06 / tex07–08 / tex09–10 dans imgs/ca/sem_bal.',
            ],
            ['Carré fermé', 'imgs/cc/cs_a/tex01.svg'],
            ['Carré ouvert à l’avertissement', 'imgs/cc/cs_a/tex03.svg'],
          ],
        ),
      ],
    },
    {
      id: 'intellij',
      title: 'Ouvrir SFR dans IntelliJ',
      blocks: [
        text(
          'Ouvrez le projet Gradle via settings.gradle.kts et choisissez un JDK 21 pour Gradle. Définissez nrfSdkDir dans le gradle.properties utilisateur, ou NRF_KOTLIN_SDK dans l’environnement, vers un kit contenant la nouvelle API. Rechargez ensuite tous les projets Gradle.',
        ),
        code(
          'nrfSdkDir=C:/chemin/vers/le/kit-kotlin',
          '%USERPROFILE%/.gradle/gradle.properties',
          'properties',
        ),
        code(
          '.\\gradlew.bat windowsTest verifyNativeMod\n.\\gradlew.bat assembleReleaseMod',
          'Depuis le projet SFR',
          'powershell',
        ),
        text(
          'windowsTest vérifie les règles sans partie ouverte. verifyNativeMod charge les DLL dans un hôte de diagnostic, puis vérifie démarrage, arrêt et rechargement. assembleReleaseMod prépare build/gradle/mod/release sans installation dans le jeu.',
        ),
        note(
          '« Kotlin is not configured » indique un problème de reconnaissance/import du projet, pas à lui seul une erreur des règles de signalisation. Vérifiez d’abord que Gradle trouve le kit, puis rechargez le modèle Gradle dans IntelliJ.',
        ),
        links(
          { label: 'Préparer un projet Kotlin', to: '/commencer/installation' },
          { label: 'Tester un mod', to: '/maintenance/tests' },
        ),
      ],
    },
  ],
}
