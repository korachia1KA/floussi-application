import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { useBudget } from './BudgetContext';

const DaretContext = createContext();

/**
 * Structure d'une Daret :
 * {
 *   id: string (uuid),
 *   name: string,
 *   monthlyAmount: number,
 *   members: [
 *     { id: string, name: string, joinedAt: date, status: 'active'|'inactive' }
 *   ],
 *   currentRoundIndex: number (0 = first member gets money),
 *   roundHistory: [
 *     {
 *       roundNumber: number,
 *       recipientId: string,
 *       recipientName: string,
 *       plannedDate: date,
 *       receivedDate: date | null,
 *       totalAmount: number,
 *       contributions: [{ memberId, name, amount, paid: bool }]
 *     }
 *   ],
 *   createdAt: date,
 *   totalCycles: number (nombre de tours complets = members.length),
 *   status: 'active' | 'paused' | 'completed',
 *   nextDueDate: date,
 * }
 */

export const DaretProvider = ({ children }) => {
  const [darets, setDarets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useBudget(); // Récupérer l'user du BudgetContext

  // Charger les darets au mount ou quand l'user change
  useEffect(() => {
    if (user) {
      loadDarets(user.uid);
    } else {
      setDarets([]);
      setLoading(false);
    }
  }, [user]);

  /**
   * Charge les Darets depuis le stockage local
   */
  const loadDarets = async (userId) => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(`darets_${userId}`);
      if (stored) {
        setDarets(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Erreur chargement Darets:', e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sauvegarde les Darets dans le stockage local
   */
  const saveDarets = async (data) => {
    if (user) {
      try {
        await AsyncStorage.setItem(`darets_${user.uid}`, JSON.stringify(data));
      } catch (e) {
        console.error('Erreur sauvegarde Darets:', e);
      }
    }
  };

  /**
   * Crée une nouvelle Daret
   */
  const createDaret = async (daretData) => {
    const newDaret = {
      id: `daret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: daretData.name,
      monthlyAmount: parseFloat(daretData.monthlyAmount),
      members: daretData.members || [], // Format: { id, name, joinedAt }
      currentRoundIndex: 0,
      roundHistory: [], // Historique des tours
      createdAt: new Date().toISOString(),
      totalCycles: (daretData.members || []).length,
      status: 'active', // 'active' | 'paused' | 'completed'
      nextDueDate: calculateNextDueDate(new Date()),
    };

    const updated = [newDaret, ...darets];
    setDarets(updated);
    await saveDarets(updated);
    return newDaret;
  };

  /**
   * Récupère les détails d'une Daret
   */
  const getDaretById = (daretId) => {
    return darets.find(d => d.id === daretId);
  };

  /**
   * Met à jour une Daret complète
   */
  const updateDaret = async (daretId, updates) => {
    const updated = darets.map(d =>
      d.id === daretId ? { ...d, ...updates } : d
    );
    setDarets(updated);
    await saveDarets(updated);
  };

  /**
   * Supprime une Daret
   */
  const deleteDaret = async (daretId) => {
    const updated = darets.filter(d => d.id !== daretId);
    setDarets(updated);
    await saveDarets(updated);
  };

  /**
   * Ajoute un membre à une Daret existante
   */
  const addMemberToDaret = async (daretId, member) => {
    const updated = darets.map(d => {
      if (d.id === daretId) {
        return {
          ...d,
          members: [...d.members, {
            id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: member.name,
            joinedAt: new Date().toISOString(),
            status: 'active'
          }],
          totalCycles: d.members.length + 1,
        };
      }
      return d;
    });
    setDarets(updated);
    await saveDarets(updated);
  };

  /**
   * Retire un membre d'une Daret
   */
  const removeMemberFromDaret = async (daretId, memberId) => {
    const updated = darets.map(d => {
      if (d.id === daretId) {
        const filteredMembers = d.members.filter(m => m.id !== memberId);
        return {
          ...d,
          members: filteredMembers,
          totalCycles: filteredMembers.length,
        };
      }
      return d;
    });
    setDarets(updated);
    await saveDarets(updated);
  };

  /**
   * Enregistre un tour complété (un membre reçoit la somme totale)
   */
  const completeDaretRound = async (daretId) => {
    const updated = darets.map(d => {
      if (d.id === daretId) {
        const recipient = d.members[d.currentRoundIndex];
        
        if (!recipient) return d; // Aucun membre

        // Créer l'enregistrement du tour
        const newRound = {
          roundNumber: d.roundHistory.length + 1,
          recipientId: recipient.id,
          recipientName: recipient.name,
          plannedDate: d.nextDueDate,
          receivedDate: new Date().toISOString(),
          totalAmount: d.monthlyAmount * d.members.length,
          contributions: d.members.map(m => ({
            memberId: m.id,
            name: m.name,
            amount: d.monthlyAmount,
            paid: true,
          })),
        };

        const nextIndex = (d.currentRoundIndex + 1) % d.members.length;
        const newStatus = nextIndex === 0 && d.roundHistory.length > 0 ? 'completed' : 'active';

        return {
          ...d,
          roundHistory: [...d.roundHistory, newRound],
          currentRoundIndex: nextIndex,
          nextDueDate: calculateNextDueDate(new Date(newRound.receivedDate)),
          status: newStatus,
        };
      }
      return d;
    });

    setDarets(updated);
    await saveDarets(updated);
  };

  /**
   * Enregistre une contribution d'un membre pour un tour spécifique
   */
  const recordContribution = async (daretId, roundNumber, memberId, amount, paid) => {
    const updated = darets.map(d => {
      if (d.id === daretId) {
        const updatedRoundHistory = d.roundHistory.map(round => {
          if (round.roundNumber === roundNumber) {
            return {
              ...round,
              contributions: round.contributions.map(contrib =>
                contrib.memberId === memberId ? { ...contrib, amount, paid } : contrib
              ),
            };
          }
          return round;
        });
        return { ...d, roundHistory: updatedRoundHistory };
      }
      return d;
    });

    setDarets(updated);
    await saveDarets(updated);
  };

  /**
   * Récupère les statistiques d'une Daret
   */
  const getDaretStats = (daretId) => {
    const daret = getDaretById(daretId);
    if (!daret) return null;

    const totalContributed = daret.roundHistory.reduce((sum, round) => {
      return sum + round.contributions.reduce((s, c) => s + (c.paid ? c.amount : 0), 0);
    }, 0);

    const memberStats = {};
    daret.members.forEach(m => {
      memberStats[m.id] = {
        name: m.name,
        totalContributed: 0,
        timesReceived: 0,
        nextTurnRound: null,
      };
    });

    daret.roundHistory.forEach((round, idx) => {
      round.contributions.forEach(c => {
        if (memberStats[c.memberId]) {
          memberStats[c.memberId].totalContributed += c.paid ? c.amount : 0;
        }
      });

      if (memberStats[round.recipientId]) {
        memberStats[round.recipientId].timesReceived += 1;
      }
    });

    // Déterminer le prochain tour de chaque membre
    const nextRound = daret.roundHistory.length + 1;
    for (let i = 0; i < daret.members.length; i++) {
      const memberIdx = (daret.currentRoundIndex + i) % daret.members.length;
      memberStats[daret.members[memberIdx].id].nextTurnRound = nextRound + i;
    }

    return {
      totalContributed,
      totalRoundsCompleted: daret.roundHistory.length,
      memberStats,
      currentRecipient: daret.members[daret.currentRoundIndex],
    };
  };

  /**
   * Pause une Daret
   */
  const pauseDaret = async (daretId) => {
    await updateDaret(daretId, { status: 'paused' });
  };

  /**
   * Reprend une Daret
   */
  const resumeDaret = async (daretId) => {
    await updateDaret(daretId, { status: 'active' });
  };

  return (
    <DaretContext.Provider
      value={{
        darets,
        loading,
        createDaret,
        getDaretById,
        updateDaret,
        deleteDaret,
        addMemberToDaret,
        removeMemberFromDaret,
        completeDaretRound,
        recordContribution,
        getDaretStats,
        pauseDaret,
        resumeDaret,
      }}
    >
      {children}
    </DaretContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte Daret
 */
export const useDaret = () => {
  const context = useContext(DaretContext);
  if (!context) {
    throw new Error('useDaret doit être utilisé dans un DaretProvider');
  }
  return context;
};

/**
 * Utilitaire : Calcule la date du prochain tour (30 jours après)
 */
export const calculateNextDueDate = (baseDate = new Date()) => {
  const next = new Date(baseDate);
  next.setDate(next.getDate() + 30);
  return next.toISOString();
};
