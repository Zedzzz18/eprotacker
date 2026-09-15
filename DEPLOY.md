# Déployer e-PRO Control Tower

Ce guide explique comment mettre l'application en ligne. Pas de connaissances techniques poussées requises.

## 1. La base de données (déjà faite)

L'application utilise une base de données Postgres hébergée gratuitement chez **Neon** (https://neon.tech). C'est déjà configuré et fonctionne — vous n'avez rien à faire ici, sauf si vous voulez créer votre propre compte Neon plus tard (gratuit, aucune carte bancaire requise).

Les identifiants de connexion sont dans le fichier `.env` (ne jamais partager ce fichier ni le mettre sur un site public).

## 2. Mettre l'application en ligne — 2 options

### Option A — Railway (le plus simple, recommandé)

Railway héberge l'application pour vous, sans serveur à gérer.

1. Créer un compte sur https://railway.app
2. Choisir un plan payant (~5$/mois, nécessaire après l'essai gratuit)
3. Depuis le dossier du projet, lancer :
   ```
   railway init
   railway up
   ```
4. Dans les paramètres du service sur Railway, ajouter les variables d'environnement présentes dans `.env` (`DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`)
5. Railway donne une adresse web (ex: `https://votre-app.up.railway.app`) — c'est le lien à partager avec l'équipe

### Option B — Votre propre serveur (VPS) avec Docker

Si vous préférez louer un petit serveur (ex: Hetzner, DigitalOcean, OVH — environ 5€/mois) :

1. Installer Docker sur le serveur (voir la documentation du fournisseur, une seule commande en général)
2. Copier tout le dossier du projet sur le serveur
3. Vérifier que le fichier `.env` contient les bonnes valeurs (copier depuis `.env.example` si besoin)
4. Lancer :
   ```
   docker compose up -d --build
   ```
5. L'application est accessible sur `http://adresse-du-serveur:3000`
6. Pour un vrai nom de domaine avec HTTPS, mettre un reverse-proxy devant (ex: Caddy ou Nginx + Let's Encrypt — étape optionnelle, à faire accompagné si besoin)

## 3. Après le déploiement

- Les comptes de démonstration restent valides : `admin`, `hq.belux`, `local.be`, `local.lu` — mot de passe `e-PRO2026`
- **Changer ces mots de passe** avant d'utiliser l'app en production
- Chaque mise à jour du code nécessite de relancer `railway up` (Option A) ou `docker compose up -d --build` (Option B) — les migrations de base de données s'appliquent automatiquement au démarrage
