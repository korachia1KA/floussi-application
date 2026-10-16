/**
 * 🔧 Utilitaires pour la fonctionnalité Daret
 * Fonctions d'aide pour les calculs, formatages et validations
 */

/**
 * Formate une date en format français lisible
 * @param {Date|string} date
 * @returns {string} "1 janvier 2025"
 */
export const formatDateFR = (date) => {
  const d = new Date(date);
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

/**
 * Calcule le nombre de jours restants avant la date limite
 * @param {Date|string} dueDate
 * @returns {number} nombre de jours (positif si futur, négatif si passé)
 */
export const getDaysUntilDue = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Vérifie si une date est en retard
 * @param {Date|string} dueDate
 * @returns {boolean}
 */
export const isOverdue = (dueDate) => {
  return getDaysUntilDue(dueDate) < 0;
};

/**
 * Formate un montant en DH marocain
 * @param {number} amount
 * @returns {string} "1.234,50 DH"
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
  }).format(amount).replace('MAD', 'DH');
};

/**
 * Calcule le total d'un tour complet
 * @param {number} monthlyAmount montant par personne
 * @param {number} memberCount nombre de membres
 * @returns {number}
 */
export const calculateRoundTotal = (monthlyAmount, memberCount) => {
  return monthlyAmount * memberCount;
};

/**
 * Génère un ID unique pour les ressources
 * @returns {string} identifiant unique
 */
export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calcule les statistiques de contribution d'un membre
 * @param {array} roundHistory historique des tours
 * @param {string} memberId ID du membre
 * @returns {object} { totalContributed, timesReceived, balance }
 */
export const calculateMemberStats = (roundHistory, memberId) => {
  let totalContributed = 0;
  let timesReceived = 0;
  let totalReceived = 0;

  roundHistory.forEach(round => {
    // Contributions
    const contribution = round.contributions.find(c => c.memberId === memberId);
    if (contribution && contribution.paid) {
      totalContributed += contribution.amount;
    }

    // Paiements reçus
    if (round.recipientId === memberId) {
      timesReceived += 1;
      totalReceived += round.totalAmount;
    }
  });

  return {
    totalContributed,
    timesReceived,
    totalReceived,
    balance: totalReceived - totalContributed, // Positif = plus reçu que donné
  };
};

/**
 * Valide les données d'une Daret avant création
 * @param {object} data
 * @returns {object} { isValid, errors: [] }
 */
export const validateDaretData = (data) => {
  const errors = [];

  if (!data.name || !data.name.trim()) {
    errors.push('Le nom de la Daret est requis');
  }

  if (!data.monthlyAmount || data.monthlyAmount <= 0) {
    errors.push('Le montant mensuel doit être positif');
  }

  if (!Array.isArray(data.members) || data.members.length < 2) {
    errors.push('Une Daret doit avoir au moins 2 membres');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Génère un rapport mensuel d'une Daret
 * @param {object} daret
 * @param {number} month (0-11)
 * @param {number} year
 * @returns {object} rapport
 */
export const generateMonthlyReport = (daret, month, year) => {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const roundsThisMonth = daret.roundHistory.filter(round => {
    const roundDate = new Date(round.receivedDate || round.plannedDate);
    return roundDate >= monthStart && roundDate <= monthEnd;
  });

  const report = {
    month: month + 1,
    year,
    roundsCompleted: roundsThisMonth.length,
    totalCollected: 0,
    totalDistributed: 0,
    memberContributions: {},
  };

  roundsThisMonth.forEach(round => {
    report.totalDistributed += round.totalAmount;

    round.contributions.forEach(contrib => {
      if (!report.memberContributions[contrib.memberId]) {
        report.memberContributions[contrib.memberId] = {
          name: contrib.name,
          contributed: 0,
          received: 0,
        };
      }
      if (contrib.paid) {
        report.memberContributions[contrib.memberId].contributed += contrib.amount;
        report.totalCollected += contrib.amount;
      }

      if (round.recipientId === contrib.memberId) {
        report.memberContributions[contrib.memberId].received += round.totalAmount;
      }
    });
  });

  return report;
};

/**
 * Génère un rappel pour les membres qui n'ont pas payé
 * @param {object} daret
 * @returns {array} liste des rappels [{ memberId, name, daysOverdue }]
 */
export const generatePaymentReminders = (daret) => {
  const reminders = [];

  if (daret.roundHistory.length === 0) {
    // Premier tour : tous les membres doivent payer
    daret.members.forEach(member => {
      reminders.push({
        memberId: member.id,
        name: member.name,
        message: `Premier paiement: ${daret.monthlyAmount} DH`,
        daysOverdue: getDaysUntilDue(daret.nextDueDate),
      });
    });
  } else {
    // Tours suivants
    const lastRound = daret.roundHistory[daret.roundHistory.length - 1];
    daret.members.forEach(member => {
      const contribution = lastRound.contributions.find(c => c.memberId === member.id);
      if (contribution && !contribution.paid) {
        reminders.push({
          memberId: member.id,
          name: member.name,
          message: `Paiement dû: ${daret.monthlyAmount} DH (Tour #${lastRound.roundNumber})`,
          daysOverdue: getDaysUntilDue(daret.nextDueDate),
        });
      }
    });
  }

  return reminders;
};

/**
 * Exporte les données d'une Daret en format CSV
 * @param {object} daret
 * @returns {string} contenu CSV
 */
export const exportDaretToCSV = (daret) => {
  let csv = 'Daret,Montant/mois,Membres,Tours complétés\n';
  csv += `"${daret.name}",${daret.monthlyAmount},${daret.members.length},${daret.roundHistory.length}\n\n`;

  csv += 'Membres\n';
  csv += 'Nom,Ajouté le,Statut\n';
  daret.members.forEach(member => {
    csv += `"${member.name}",${formatDateFR(member.joinedAt)},${member.status}\n`;
  });

  csv += '\n\nHistorique des Tours\n';
  csv += 'Tour,Bénéficiaire,Total,Montant,Date Prévue,Date Reçue\n';
  daret.roundHistory.forEach(round => {
    csv += `${round.roundNumber},"${round.recipientName}",${round.totalAmount},${daret.monthlyAmount},"${formatDateFR(round.plannedDate)}","${round.receivedDate ? formatDateFR(round.receivedDate) : 'En attente'}"\n`;
  });

  return csv;
};

/**
 * Calcule la prochaine date d'échéance basée sur une date
 * @param {Date} baseDate
 * @param {number} daysToAdd nombre de jours à ajouter (par défaut 30)
 * @returns {Date}
 */
export const calculateNextDueDate = (baseDate = new Date(), daysToAdd = 30) => {
  const next = new Date(baseDate);
  next.setDate(next.getDate() + daysToAdd);
  return next;
};

/**
 * Obtient l'ordre de rotation pour une Daret
 * @param {array} members
 * @param {number} currentIndex index du bénéficiaire actuel
 * @returns {array} ordre de passage des membres
 */
export const getRotationOrder = (members, currentIndex = 0) => {
  const order = [];
  for (let i = 0; i < members.length; i++) {
    const index = (currentIndex + i) % members.length;
    order.push({
      round: i + 1,
      memberId: members[index].id,
      name: members[index].name,
    });
  }
  return order;
};
