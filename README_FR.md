# Notre Mariage — Isaora & David

Projet de départ d'une application iOS native avec Expo / React Native.

## Fonctionnalités incluses
- Planning avec tâches, échéances et cases à cocher.
- Budget avec dépenses et statut payé / à payer.
- Liste des invités et suivi des réponses.
- Prestataires, contacts et devis.
- Sauvegarde JSON exportable et importable.
- Enregistrement local sur l'appareil avec AsyncStorage.
- Design romantique pastel : rose poudré, bleu ciel, ivoire et eucalyptus.

## Important
Cette archive est le **projet source**, pas encore une application `.ipa` installable.
Le projet doit être configuré dans un compte Expo/EAS et compilé pour iOS.
Le champ `extra.eas.projectId` dans `app.json` doit être remplacé par l'identifiant du projet EAS après son initialisation.

## Méthode recommandée sans Mac
1. Décompresser cette archive.
2. Mettre le dossier du projet dans un dépôt GitHub privé.
3. Créer/ouvrir un compte Expo et configurer EAS Build.
4. Remplacer le projectId de `app.json` par celui fourni par EAS.
5. Installer les dépendances et lancer une compilation iOS depuis un environnement qui exécute Node.js et EAS CLI, ou utiliser un service cloud compatible.
6. Pour installer sur ton propre iPhone, choisir une méthode de distribution/signature Apple adaptée. TestFlight ou la distribution interne iOS requièrent généralement l'adhésion Apple Developer Program payante. Les exigences exactes sont déterminées par Apple et EAS au moment de la compilation.

## Commandes usuelles
```bash
npm install
npx expo install --check
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform ios --profile preview
```

Si EAS te demande de configurer les identifiants Apple, suis les instructions affichées. Ne partage jamais ton mot de passe Apple, tes codes à usage unique, ni une clé privée dans un chat.

## Sauvegarde et confidentialité
Les données de suivi sont enregistrées localement sur l'appareil. Le bouton « Exporter la sauvegarde » crée un fichier JSON que tu peux conserver. Le bouton « Importer une sauvegarde » restaure un fichier JSON précédemment exporté.
La sauvegarde locale n'est pas une synchronisation entre plusieurs téléphones. Garde une copie de secours du fichier exporté.
