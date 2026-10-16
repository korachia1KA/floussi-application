import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// --- NOTIFICATIONS : chargées seulement hors Expo Go et hors web ---
const isExpoGo = Constants.appOwnership === 'expo';
const canUseNotifications = !isExpoGo && Platform.OS !== 'web';

let Notifications = null;
if (canUseNotifications) {
  try {
    Notifications = require('expo-notifications');
  } catch (e) {
    console.log('Notifications indisponibles :', e?.message);
  }
}

// --- 1. GÉNÉRER PDF ---
export const generatePDF = async (transactions) => {
  if (!transactions || transactions.length === 0) {
    Alert.alert('Erreur', 'Aucune transaction à exporter !');
    return;
  }

  try {
    const rows = transactions
      .map(
        (t) => `
      <tr>
        <td>${t.dateISO ? new Date(t.dateISO).toLocaleDateString() : '-'}</td>
        <td>${t.category}</td>
        <td>${t.title || ''}</td>
        <td style="color: ${t.type === 'expense' ? 'red' : 'green'}">
          ${t.type === 'expense' ? '-' : '+'}${t.amount} DH
        </td>
      </tr>
    `
      )
      .join('');

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Helvetica, sans-serif; padding: 20px; }
            h1 { color: #006233; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #006233; color: white; padding: 10px; text-align: left; }
            td { border-bottom: 1px solid #ddd; padding: 10px; }
          </style>
        </head>
        <body>
          <h1>Rapport Floussi 🇲🇦</h1>
          <table>
            <tr><th>Date</th><th>Catégorie</th><th>Titre</th><th>Montant</th></tr>
            ${rows}
          </table>
        </body>
      </html>
    `;

    // Sur le web : ouvre la fenêtre d'impression du navigateur
    if (Platform.OS === 'web') {
      await Print.printAsync({ html });
      return;
    }

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  } catch (error) {
    console.error(error);
    Alert.alert('Erreur PDF', error.message);
  }
};

// --- 2. TAUX DE CHANGE (EUR + USD) ---
export const fetchRates = async () => {
  try {
    const [resEur, resUsd] = await Promise.all([
      fetch('https://api.frankfurter.app/latest?from=EUR&to=MAD'),
      fetch('https://api.frankfurter.app/latest?from=USD&to=MAD'),
    ]);

    const dataEur = await resEur.json();
    const dataUsd = await resUsd.json();

    return {
      EUR: dataEur.rates.MAD,
      USD: dataUsd.rates.MAD,
    };
  } catch (error) {
    console.log('Erreur API Taux :', error);
    return { EUR: 10.7, USD: 10.0 };
  }
};

// --- 3. RAPPEL QUOTIDIEN ---
export const scheduleReminder = async () => {
  if (!Notifications) {
    Alert.alert(
      'Indisponible',
      "Les notifications ne fonctionnent pas dans Expo Go ni sur le web. Elles nécessitent un build de développement."
    );
    return;
  }

  try {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        'Tu dois autoriser les notifications dans les réglages de ton téléphone pour recevoir le rappel.'
      );
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Floussi - Bilan du jour',
        body: 'As-tu pensé à noter tes dépenses aujourd\'hui ? 💸',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
      },
    });

    Alert.alert('Succès', 'Rappel programmé ! Tu recevras une notification chaque soir à 20h00. 🕗');
  } catch (error) {
    console.log(error);
    Alert.alert('Erreur', 'Impossible de programmer le rappel.');
  }
};