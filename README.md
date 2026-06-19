# Coach du candidat — BEPC & Bac Côte d'Ivoire

Application de tutorat IA pour aider les élèves en classe d'examen (BEPC, Bac)
à comprendre leurs cours, faire des exercices, et gagner en confiance.

## Comment déployer ce projet (étapes)

### 1. Mettre ce code sur GitHub

- Crée un nouveau dépôt (repository) sur https://github.com/new
- Nomme-le par exemple `coach-candidat`
- Mets-le en **Public** ou **Private** (les deux fonctionnent avec Vercel)
- Upload tous les fichiers de ce dossier dans le dépôt
  (tu peux glisser-déposer les fichiers directement sur la page GitHub
  via "uploading an existing file")

### 2. Déployer sur Vercel

- Va sur https://vercel.com/new
- Choisis "Import Project" et sélectionne ton dépôt GitHub `coach-candidat`
- Avant de cliquer "Deploy", va dans **Environment Variables**
- Ajoute une variable :
  - **Nom** : `ANTHROPIC_API_KEY`
  - **Valeur** : ta clé API (celle qui commence par `sk-ant-...`)
- Clique **Deploy**

### 3. Récupérer ton lien

Après quelques secondes, Vercel te donne une URL du type :
`https://coach-candidat-xxxx.vercel.app`

C'est ce lien que tu peux partager aux élèves.

## Important

- Ne mets JAMAIS ta clé API directement dans le code ou sur GitHub.
  Elle doit UNIQUEMENT être dans les "Environment Variables" de Vercel.
- Si tu modifies le code plus tard, chaque mise à jour sur GitHub
  redéploie automatiquement le site sur Vercel.
