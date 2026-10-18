# 🪙 Floussi, gérez votre budget à la marocaine

**Floussi** est une application mobile qui simplifie le suivi des finances personnelles au Maroc. Elle réunit un outil de budget moderne et deux pratiques d'épargne bien de chez nous : la **Daret** (tontine) et la **Sando9ti** (tirelire).

---

## ✨ Fonctionnalités

### 🔑 Compte et sécurité
- Inscription et connexion via Firebase Authentication
- Réinitialisation du mot de passe par e-mail
- Données utilisateur protégées par l'authentification

### 🧾 Gestion du budget
- **Solde en temps réel** : revenus moins dépenses, calculé automatiquement
- **Saisie express** : une interface de type calculatrice pour noter une dépense en quelques secondes
- **Catégories** : alimentation, transport, factures, etc., avec des icônes dédiées
- **Historique** : liste des dernières opérations, avec flèches verte (revenu) et rouge (dépense)

### 🔄 Daret (tontine)
- **Création sur mesure** : montant, nombre de participants et fréquence au choix
- **Suivi des tours** : on voit clairement qui reçoit le pot ce mois-ci
- **Comptabilité automatique** :
  - *Cotisation* : le montant est déduit du solde principal
  - *Réception* : le pot total est ajouté au solde principal
- **Pause** : une Daret peut être suspendue à tout moment

### 🏺 Sando9ti (épargne)
- **Plusieurs objectifs** : voyage, ordinateur, fonds d'urgence, etc.
- **Progression visuelle** : barres d'avancement dont la couleur évolue (jaune puis vert)
- **Dépôts et retraits** : chaque opération est reliée au solde principal

### 📈 Statistiques
- Graphique en camembert de la répartition des dépenses
- Détail des montants dépensés par catégorie

### 🛠️ Outils et personnalisation
- **Mode sombre** adapté à toute l'interface
- **Taux de change en direct** : euro et dollar face au dirham, via l'API Frankfurter
- **Profil** : photo (stockée sur l'appareil), modification du nom et du mot de passe
- **Export PDF** des transactions et **rappel quotidien** par notification
- **Réinitialisation** complète des données depuis la zone de danger

---

## 🧰 Technologies

| Domaine | Outil |
|---|---|
| Framework | React Native avec Expo (SDK 57) |
| Langage | JavaScript (ES6+) |
| Navigation | React Navigation |
| Authentification | Firebase Authentication |
| Stockage local | AsyncStorage (approche *offline-first*) |
| API externe | Frankfurter (taux de change) |
| Interface | lucide-react-native, expo-linear-gradient, expo-image-picker |
| Export | expo-print, expo-sharing |

---

## 🚀 Installation

1. **Cloner le dépôt**
```bash
   git clone https://github.com/korachia1KA/floussi-application.git
   cd floussi-application
```

2. **Installer les dépendances**
```bash
   npm install
```

3. **Lancer le projet**
```bash
   npx expo start -c
```

4. **Tester l'application**
   - **Téléphone** : scannez le QR code avec **Expo Go** (version SDK 57 requise)
   - **Navigateur** : appuyez sur `w` dans le terminal

> ℹ️ Les notifications de rappel ne fonctionnent pas dans Expo Go. Pour les tester, il faut un build de développement.

---



---

🎓 *Projet académique, 2025*
