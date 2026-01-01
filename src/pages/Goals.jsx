import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { Plus, Target, Repeat, Trash2, CheckCircle, Trophy } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../utils/animations';

const Goals = () => {
    const [items, setItems] = useState([]);
    const [activeTab, setActiveTab] = useState('habits'); // 'habits' | 'goals'
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [targetVal, setTargetVal] = useState(7);

    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const { addXP } = useGame();

    useEffect(() => {
        if (!currentUser) return;
        const q = query(collection(db, "user_items"), where("userId", "==", currentUser.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [currentUser]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;

        try {
            const newItem = {
                userId: currentUser.uid,
                name: newName,
                createdAt: new Date(),
                type: activeTab,
            };

            if (activeTab === 'habits') {
                newItem.streak = 0;
                newItem.target = parseInt(targetVal) || 7;
                newItem.lastCompleted = null;
            } else {
                // Metas (Vision Board) - Sin fechas, solo checkbox
                newItem.completed = false;
            }

            await addDoc(collection(db, "user_items"), newItem);
            addToast("Guardado correctamente", "success");
            setNewName('');
            setShowAdd(false);
        } catch (error) {
            addToast("Error al guardar", "error");
        }
    };

    const completeHabitToday = async (item) => {
        const today = new Date().toDateString();
        const lastDate = item.lastCompleted ? new Date(item.lastCompleted.toDate()).toDateString() : null;
        if (today === lastDate) {
            addToast("Ya completaste este hábito hoy", "info");
            return;
        }
        await updateDoc(doc(db, "user_items", item.id), {
            streak: (item.streak || 0) + 1,
            lastCompleted: new Date()
        });
        addToast("¡Racha aumentada! 🔥", "success");
        addXP(50); // XP Reward
    };

    const toggleGoal = async (item) => {
        await updateDoc(doc(db, "user_items", item.id), {
            completed: !item.completed
        });
        if (!item.completed) {
            addToast("¡Meta Alcanzada! 🎉", "success");
            addXP(200); // Massive Reward
        }
    };

    const deleteItem = async (id) => deleteDoc(doc(db, "user_items", id));

    const filteredItems = items.filter(i => i.type === activeTab);

    return (
        <motion.div
            className="page-container"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div style={{ marginBottom: '2rem' }}>
                <h1>{activeTab === 'habits' ? 'Hábitos Diarios' : 'Visión de Vida'}</h1>
                <div style={{ display: 'flex', gap: '1rem', background: 'var(--glass-bg)', padding: '0.5rem', borderRadius: '16px', display: 'inline-flex', border: '1px solid var(--glass-border)' }}>
                    <button
                        onClick={() => setActiveTab('habits')}
                        style={{
                            padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none',
                            background: activeTab === 'habits' ? 'var(--accent-gradient)' : 'transparent',
                            color: 'white', cursor: 'pointer', fontWeight: 'bold', display: 'flex', gap: '8px'
                        }}
                    >
                        <Repeat size={18} /> Hábitos (Rachas)
                    </button>
                    <button
                        onClick={() => setActiveTab('goals')}
                        style={{
                            padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none',
                            background: activeTab === 'goals' ? 'var(--accent-gradient)' : 'transparent',
                            color: 'white', cursor: 'pointer', fontWeight: 'bold', display: 'flex', gap: '8px'
                        }}
                    >
                        <Target size={18} /> Metas (Visión)
                    </button>
                </div>
            </div>

            <button className="btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} /> Nuevo
            </button>

            {/* Add Form */}
            <AnimatePresence>
                {showAdd && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleAddItem}
                        className="card glass"
                        style={{ marginBottom: '2rem', overflow: 'hidden' }}
                    >
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'end' }}>
                            <div style={{ flex: '1 1 200px' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                    {activeTab === 'habits' ? 'Nombre del Hábito' : 'Mi Meta / Sueño'}
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder={activeTab === 'habits' ? "Ej. Leer 10 min" : "Ej. Ser Millonario"}
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>

                            {activeTab === 'habits' && (
                                <div style={{ width: '120px' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Días Meta</label>
                                    <input type="number" value={targetVal} onChange={(e) => setTargetVal(e.target.value)} />
                                </div>
                            )}
                            <button type="submit" className="btn-primary" style={{ height: '50px' }}>Crear</button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredItems.map((item) => (
                    <motion.div
                        layout key={item.id} className="card glass"
                        style={{ borderLeft: `4px solid ${activeTab === 'habits' ? '#8b5cf6' : '#3b82f6'}` }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>{item.name}</h3>
                            <button onClick={() => deleteItem(item.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', opacity: 0.5 }}>
                                <Trash2 size={18} />
                            </button>
                        </div>

                        {activeTab === 'habits' ? (
                            // VISTA DE HÁBITO (CON RACHAS)
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    <span>Racha actual</span>
                                    <span style={{ color: 'white', fontWeight: 'bold' }}>{item.streak} días</span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((item.streak / item.target) * 100, 100)}%` }}
                                        style={{ height: '100%', background: 'var(--accent-gradient)' }}
                                    />
                                </div>
                                <button
                                    onClick={() => completeHabitToday(item)}
                                    style={{
                                        width: '100%', padding: '0.8rem', borderRadius: '10px',
                                        border: '1px solid var(--accent-purple)', background: 'rgba(139, 92, 246, 0.1)',
                                        color: 'var(--accent-purple)', fontWeight: '600', cursor: 'pointer',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                                    }}
                                >
                                    <CheckCircle size={18} /> Marcar Hoy
                                </button>
                            </div>
                        ) : (
                            // VISTA DE META (SOLO VISIÓN)
                            <div
                                onClick={() => toggleGoal(item)}
                                style={{
                                    padding: '1rem', borderRadius: '12px', cursor: 'pointer',
                                    background: item.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.2)',
                                    border: item.completed ? '1px solid #10b981' : '1px solid var(--glass-border)',
                                    display: 'flex', alignItems: 'center', gap: '1rem'
                                }}
                            >
                                <div style={{
                                    width: '24px', height: '24px', borderRadius: '50%',
                                    border: '2px solid ' + (item.completed ? '#10b981' : 'var(--text-secondary)'),
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {item.completed && <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '50%' }} />}
                                </div>
                                <span style={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#10b981' : 'white' }}>
                                    {item.completed ? '¡Logrado!' : 'Por cumplir'}
                                </span>
                                {item.completed && <Trophy size={20} color="#fbbf24" style={{ marginLeft: 'auto' }} />}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};
export default Goals;
