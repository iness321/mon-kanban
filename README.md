# 🗂 KanbanRT

Application web Kanban complète permettant de gérer des tâches par statut, priorité et catégorie.

## 👥 Équipe

- Inass Atouil
- Matisse Neau
- Fatou Binetou Diallo

## 🛠 Stack technique

- **React** + Vite — interface utilisateur
- **Supabase** — base de données PostgreSQL + authentification
- **Vercel** — déploiement et fonctions serverless
- **React Router** — navigation SPA
- **Resend** — envoi d'e-mails

## 🚀 Installation locale

git clone https://github.com/iness321/mon-kanban.git
cd mon-kanban
npm install
cp .env.local.example .env.local
npm run dev

## 🔑 Variables d'environnement

Créez un fichier `.env.local` à la racine :

VITE_SUPABASE_URL=https://xxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=ma-clé-anon
RESEND_API_KEY=ma-clé-resend

## ✅ Fonctionnalités

- Inscription / Connexion / Déconnexion
- Dashboard avec tâches en colonnes Kanban (À faire / En cours / Validation / Terminée)
- Création, modification et suppression de tâches
- Filtres par priorité et statut
- Système de commentaires sur les tâches
- Page profil avec upload d'avatar
- Compteurs de tâches par statut
- Envoi d'e-mails via Resend

## 🌐 Application déployée

https://mon-kanban-olive.vercel.app