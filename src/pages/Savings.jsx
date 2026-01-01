import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, DollarSign, TrendingUp, PiggyBank } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../utils/animations';

const Savings = () => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const [items, setItems] = useState([]);
    const [showAdd, setShowAdd] = useState(false);

    // Form Info
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');

    // Editing logic (Deposit)
    const [depositAmount, setDepositAmount] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        if (!currentUser) return;
        const q = query(collection(db, "savings"), where("userId", "==", currentUser.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [currentUser]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!name.trim() || !targetAmount) return;

        try {
            await addDoc(collection(db, "savings"), {
                userId: currentUser.uid,
                name,
                target: parseFloat(targetAmount),
                current: parseFloat(currentAmount) || 0,
                createdAt: new Date()
            });
            addToast("Meta de ahorro creada", "success");
            setName(''); setTargetAmount(''); setCurrentAmount(''); setShowAdd(false);
        } catch (error) {
            addToast("Error al guardar", "error");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Eliminar esta meta de ahorro?")) {
            await deleteDoc(doc(db, "savings", id));
            addToast("Eliminado", "success");
        }
    };

    const handleDeposit = async () => {
        if (!selectedItem || !depositAmount) return;
        try {
            const newVal = selectedItem.current + parseFloat(depositAmount);
            await updateDoc(doc(db, "savings", selectedItem.id), {
                current: newVal
            });
            addToast(`Agregados $${depositAmount} a ${selectedItem.name}`, "success");
            setSelectedItem(null);
            setDepositAmount('');
        } catch (e) {
            addToast("Error al actualizar", "error");
        }
    };

    const totalSaved = items.reduce((acc, curr) => acc + curr.current, 0);
    const totalTarget = items.reduce((acc, curr) => acc + curr.target, 0);

    return (
        <motion.div
            className="page-container"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Ahorros & Sueños</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Visualiza tus metas materiales</p>
                </div>
                <div className="glass" style={{ padding: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ahorro Total</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>${totalSaved.toLocaleString()}</div>
                    </div>
                    {items.length > 0 && (
                        <div style={{ width: '40px', height: '40px' }}>
                            <PiggyBank size={32} color="#10b981" />
                        </div>
                    )}
                </div>
            </div>

            <button className="btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} /> Nuevo Objetivo
            </button>

            {/* Add Form */}
            <AnimatePresence>
                {showAdd && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleAdd}
                        className="card glass"
                        style={{ marginBottom: '2rem', overflow: 'hidden' }}
                    >
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'end' }}>
                            <div style={{ flex: '1 1 200px' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nombre (Ej. iPhone 16)</label>
                                <input required type="text" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div style={{ flex: '1 1 120px' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Precio Meta ($)</label>
                                <input required type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
                            </div>
                            <div style={{ flex: '1 1 120px' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Inicio ($)</label>
                                <input type="number" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} />
                            </div>
                            <button type="submit" className="btn-primary" style={{ height: '52px' }}>Crear</button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {items.map(item => {
                    const percent = Math.min((item.current / item.target) * 100, 100);
                    return (
                        <motion.div layout key={item.id} className="card glass" style={{ position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0 }}>{item.name}</h3>
                                <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: '#f87171', opacity: 0.6, cursor: 'pointer' }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'end', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>${item.current.toLocaleString()}</span>
                                <span style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}> / ${item.target.toLocaleString()}</span>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    style={{
                                        height: '100%',
                                        background: percent >= 100 ? '#10b981' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                                        borderRadius: '10px'
                                    }}
                                />
                            </div>

                            {selectedItem?.id === item.id ? (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        autoFocus
                                        type="number"
                                        placeholder="Monto a agregar..."
                                        value={depositAmount}
                                        onChange={e => setDepositAmount(e.target.value)}
                                        style={{ padding: '0.5rem' }}
                                    />
                                    <button onClick={handleDeposit} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>OK</button>
                                    <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: '1px solid var(--text-secondary)', color: 'white', borderRadius: '10px', cursor: 'pointer' }}>X</button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setSelectedItem(item)}
                                    disabled={percent >= 100}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        borderRadius: '12px',
                                        background: percent >= 100 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                                        color: percent >= 100 ? '#10b981' : '#3b82f6',
                                        border: '1px solid transparent', // Fixed border property
                                        fontWeight: '600',
                                        cursor: percent >= 100 ? 'default' : 'pointer',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                                    }}
                                >
                                    {percent >= 100 ? <><TrendingUp size={18} /> ¡Completado!</> : <><DollarSign size={18} /> Agregar Dinero</>}
                                </button>
                            )}
                        </motion.div>
                    )
                })}
            </div>
        </motion.div>
    );
};
export default Savings;
