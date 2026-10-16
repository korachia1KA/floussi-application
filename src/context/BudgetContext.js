import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../constants/theme'; 
import { Tag } from 'lucide-react-native'; 

const BudgetContext = createContext();

// --- CORRECTION ICI : Tout le monde commence à 0 DH ---
const DEFAULT_GOALS = [
  { id: '1', name: "Voyage à Essaouira", target: 8000, saved: 0 }, // <--- 0
  { id: '2', name: "Achat d'un PC", target: 12000, saved: 0 },     // <--- 0
  { id: '3', name: "Épargne Urgence", target: 10000, saved: 0 },   // <--- 0
];

export const BudgetProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(20000); 
  const [categoryLimits, setCategoryLimits] = useState({});
  const [darets, setDarets] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  
  const [goals, setGoals] = useState(DEFAULT_GOALS); 

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const allCategories = [
    ...DEFAULT_CATEGORIES, 
    ...customCategories.map(cat => ({ ...cat, icon: Tag })) 
  ];

  const getDefaultLimits = () => {
    const limits = {};
    DEFAULT_CATEGORIES.forEach(cat => { if (cat.defaultLimit) limits[cat.id] = cat.defaultLimit; });
    return limits;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadUserData(currentUser.uid);
      } else {
        setTransactions([]);
        setDarets([]);
        setCustomCategories([]);
        setGoals(DEFAULT_GOALS);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  };

  const saveData = async (key, value) => {
    if (user) await AsyncStorage.setItem(`${key}_${user.uid}`, JSON.stringify(value));
  };

  const loadUserData = async (userId) => {
    try {
      setLoading(true);
      const keys = [`trans_${userId}`, `inc_${userId}`, `lim_${userId}`, `darets_${userId}`, `customCats_${userId}`, `goals_${userId}`];
      const results = await AsyncStorage.multiGet(keys);

      if (results[0][1]) setTransactions(JSON.parse(results[0][1]));
      if (results[1][1]) setIncome(JSON.parse(results[1][1]));
      
      if (results[2][1]) setCategoryLimits(JSON.parse(results[2][1]));
      else setCategoryLimits(getDefaultLimits());

      if (results[3][1]) setDarets(JSON.parse(results[3][1]));
      if (results[4][1]) setCustomCategories(JSON.parse(results[4][1]));
      
      // Chargement des objectifs
      if (results[5][1]) {
        const loadedGoals = JSON.parse(results[5][1]);
        if (loadedGoals.length > 0) {
            setGoals(loadedGoals);
        } else {
            setGoals(DEFAULT_GOALS);
        }
      } else {
        setGoals(DEFAULT_GOALS);
      }

    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // --- ACTIONS SANDO9TI ---
  const addGoal = async (goalData) => {
    const newGoals = [...goals, goalData];
    setGoals(newGoals);
    await saveData('goals', newGoals);
  };

  const updateGoal = async (updatedGoal) => {
    const newGoals = goals.map(g => g.id === updatedGoal.id ? updatedGoal : g);
    setGoals(newGoals);
    await saveData('goals', newGoals);
  };

  const deleteGoal = async (id) => {
    const newGoals = goals.filter(g => g.id !== id);
    setGoals(newGoals);
    await saveData('goals', newGoals);
  };

  // ... Autres fonctions inchangées ...
  const updateMonthlyIncome = async (amount) => {
    const value = parseFloat(amount);
    if (!isNaN(value)) { setIncome(value); await saveData('inc', value); }
  };

  const addTransaction = async (t) => {
    const newT = [t, ...transactions];
    setTransactions(newT);
    await saveData('trans', newT);
  };

  const updateTransaction = async (updatedT) => {
    const newT = transactions.map(t => t.id === updatedT.id ? updatedT : t);
    setTransactions(newT);
    await saveData('trans', newT);
  };

  const deleteTransaction = async (id) => {
    const newT = transactions.filter(t => t.id !== id);
    setTransactions(newT);
    await saveData('trans', newT);
  };

  const addDaret = async (daretData) => {
    const newDaret = { id: Date.now().toString(), ...daretData };
    const updatedDarets = [newDaret, ...darets];
    setDarets(updatedDarets);
    await saveData('darets', updatedDarets);
  };

  const deleteDaret = async (id) => {
    const updatedDarets = darets.filter(d => d.id !== id);
    setDarets(updatedDarets);
    await saveData('darets', updatedDarets);
  };

  const addCustomCategory = async (name, limit) => {
    const newCat = { id: `custom_${Date.now()}`, name, color: '#64748b', bg: '#f1f5f9', defaultLimit: parseFloat(limit) || 0 };
    const updatedCats = [...customCategories, newCat];
    setCustomCategories(updatedCats);
    await saveData('customCats', updatedCats);
    if (limit) await setLimitForCategory(newCat.id, limit);
  };
  
  const deleteCustomCategory = async (catId) => {
     const updatedCats = customCategories.filter(c => c.id !== catId);
     setCustomCategories(updatedCats);
     await saveData('customCats', updatedCats);
  };

  const setLimitForCategory = async (catId, amount) => {
    const newLimits = { ...categoryLimits, [catId]: parseFloat(amount) };
    setCategoryLimits(newLimits);
    await saveData('lim', newLimits);
  };

  const checkBudgetAlert = (catId, amountToAdd) => {
    const limit = categoryLimits[catId];
    if (!limit) return null;
    const now = new Date();
    const spent = transactions
      .filter(t => t.category === catId && t.type === 'expense')
      .filter(t => {
         const d = new Date(t.dateISO);
         return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((acc, t) => acc + t.amount, 0);
    if (spent + amountToAdd > limit) return `Attention ! Tu dépasses ton objectif de ${limit} DH.`;
    return null;
  };

  const now = new Date();
  const monthlyData = transactions.filter(t => {
    if (!t.dateISO) return true;
    const d = new Date(t.dateISO);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalExpenses = monthlyData.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const totalExtraIncome = monthlyData.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const balance = (income + totalExtraIncome) - totalExpenses;

  // RESET
  const resetAllData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setTransactions([]);
      setIncome(20000);
      setDarets([]);
      setCustomCategories([]);
      // ICI : On remet les objectifs par défaut (vides)
      setGoals(DEFAULT_GOALS); 
      setCategoryLimits(getDefaultLimits());
      
      const keys = [`trans_${user.uid}`, `inc_${user.uid}`, `lim_${user.uid}`, `darets_${user.uid}`, `customCats_${user.uid}`, `goals_${user.uid}`];
      await AsyncStorage.multiRemove(keys);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <BudgetContext.Provider value={{ 
      transactions, addTransaction, updateTransaction, deleteTransaction,
      income, updateMonthlyIncome, 
      balance, totalExpenses, totalExtraIncome,
      categoryLimits, setLimitForCategory, checkBudgetAlert,
      darets, addDaret, deleteDaret, 
      allCategories, addCustomCategory, deleteCustomCategory,
      goals, addGoal, updateGoal, deleteGoal,
      user, loading, resetAllData, refreshUser
    }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => useContext(BudgetContext);