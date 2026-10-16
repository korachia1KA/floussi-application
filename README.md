# 💰 Floussi - Application de Gestion de Budget Marocaine

**Floussi** est une solution mobile complète conçue pour simplifier la gestion financière quotidienne au Maroc. Elle combine un suivi budgétaire moderne avec des pratiques culturelles locales comme la **Daret** (Tontine) et la **Sando9ti** (Tirelire).

---

## 🌟 Fonctionnalités Détaillées

### 1. 🔐 Authentification & Sécurité
* **Connexion / Inscription :** Sécurisée via Firebase Authentication.
* **Mot de passe oublié :** Envoi d'email de réinitialisation automatique.
* **Sécurité :** Les données sensibles sont protégées.

### 2. 💸 Gestion de Budget (Cœur de l'appli)
* **Suivi en temps réel :** Calcul automatique du "Solde Restant" (Revenus - Dépenses).
* **Ajout rapide :** Interface type "Calculatrice" pour ajouter une dépense en 2 secondes.
* **Catégorisation :** Icônes intelligentes (Nourriture, Transport, Factures...).
* **Historique :** Liste des dernières opérations avec indicateurs visuels (Flèches Verte/Rouge).

### 3. 🤝 Module "Daret" (Gestion de Tontine)
* **Création personnalisée :** Définition du montant, du nombre de membres et de la fréquence.
* **Suivi des tours :** Visualisation claire de qui doit recevoir l'argent ce mois-ci.
* **Logique comptable :**
    * *Paiement :* Déduit automatiquement la cotisation du solde principal.
    * *Réception :* Ajoute automatiquement le "Pot" total au solde principal.
* **États :** Possibilité de mettre une Daret en pause.

### 4. 🐷 Module "Sando9ti" (Épargne & Objectifs)
* **Objectifs multiples :** Créer des cagnottes virtuelles (ex: "Voyage", "PC", "Urgence").
* **Barres de progression :** Visualisation graphique de l'avancement et couleurs dynamiques (Jaune/Vert).
* **Opérations :** Déposer ou Retirer de l'argent d'un objectif (connecté au solde principal).

### 5. 📊 Statistiques & Analyse
* **Visualisation :** Graphiques (Camembert) pour comprendre la répartition des dépenses.
* **Détails par catégorie :** Voir exactement combien a été dépensé pour chaque poste.

### 6. ⚙️ Outils & Personnalisation
* **Mode Sombre (Dark Mode) :** Interface entièrement adaptative (Noir/Vert) pour le confort visuel.
* **Devises en temps réel :** Affichage des taux de change (Euro/Dollar vers Dirham) via API.
* **Profil Utilisateur :**
    * Ajout de photo de profil (Stockage local).
    * Modification du Nom/Mot de passe.
* **Export & Rappels :** Génération de rapports PDF et notifications de rappel quotidien.
* **Zone de Danger :** Possibilité de réinitialiser toutes les données.

---

## 🛠️ Stack Technique

* **Framework :** React Native (Expo SDK 51).
* **Langage :** JavaScript (ES6+).
* **Backend (Auth) :** Firebase Authentication.
* **Base de Données Locale :** `@react-native-async-storage` (Architecture Hybride Offline-First).
* **API Externe :** Frankfurter API (Taux de change).
* **UI/UX :**
    * `lucide-react-native` (Icônes vectorielles).
    * `expo-linear-gradient` (Design).
    * `expo-image-picker` (Galerie photo).

---

## 📦 Installation & Démarrage

1.  **Cloner le projet :**
    ```bash
    git clone [https://github.com/ouissalhfd/floussi-app.git](https://github.com/ouissalhfd/floussi-app.git)
    cd floussi-app
    ```

2.  **Installer les dépendances :**
    ```bash
    npm install
    ```

3.  **Lancer l'application :**
    ```bash
    npx expo start -c
    ```

4.  **Tester :**
    * Scannez le QR Code avec l'application **Expo Go** (Android) ou l'appareil photo (iOS).

---

## 👥 Auteurs du Projet

Ce projet a été conçu et développé par :

* **Haffad Ouissal**
* **Sadoq Aya**
* **Zarouil Ghita**

---
*Projet Académique - 2025*