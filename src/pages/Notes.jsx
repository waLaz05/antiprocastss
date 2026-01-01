import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../utils/animations';
import { Plus, X, Check, Search, Palette, Loader, AlertCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, updateDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [input, setInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedColor, setSelectedColor] = useState('default');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    const { currentUser } = useAuth();
    const { addToast } = useToast();

    const colors = {
        default: 'rgba(30, 41, 59, 0.7)',
        purple: 'rgba(124, 58, 237, 0.2)',
        blue: 'rgba(37, 99, 235, 0.2)',
        green: 'rgba(5, 150, 105, 0.2)',
        rose: 'rgba(225, 29, 72, 0.2)'
    };

    useEffect(() => {
        if (!currentUser) return;

        // Subscribe to notes
        const q = query(collection(db, "notes"), where("userId", "==", currentUser.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const liveNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort in client side to avoid complex index requirements
            liveNotes.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
            setNotes(liveNotes);
            setLoading(false);
        }, (error) => {
            console.error(error);
            addToast("Error cargando notas: " + error.message, "error");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, addToast]);

    const addNote = async () => {
        if (!input.trim()) return;

        setAdding(true);
        try {
            await addDoc(collection(db, "notes"), {
                text: input,
                completed: false,
                userId: currentUser.uid,
                color: selectedColor,
                createdAt: new Date()
            });
            setInput('');
            addToast("Nota agregada correctamente", "success");
        } catch (e) {
            console.error("Error adding note: ", e);
            addToast("No se pudo guardar la nota. Revisa tu conexión.", "error");
        } finally {
            setAdding(false);
        }
    }

    const toggleNote = async (id, status) => {
        try {
            await updateDoc(doc(db, "notes", id), { completed: !status });
        } catch (e) {
            addToast("Error al actualizar nota", "error");
        }
    };

    const deleteNote = async (id) => {
        try {
            await deleteDoc(doc(db, "notes", id));
            addToast("Nota eliminada", "success");
        } catch (e) {
            addToast("Error al eliminar nota", "error");
        }
    };

    const filteredNotes = notes.filter(n => n.text.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <motion.div
            className="page-container"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <h1>Notas & Ideas</h1>
                <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0.8rem 1rem', borderRadius: '12px', minWidth: '250px' }}>
                    <Search size={18} style={{ marginRight: '0.8rem', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Buscar en tus notas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', background: 'transparent', padding: '0', width: '100%', outline: 'none', boxShadow: 'none' }}
                    />
                </div>
            </div>

            {/* Input Area */}
            <div className="glass" style={{ padding: '2rem', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <input
                        type="text"
                        autoFocus
                        placeholder="¿Qué tienes en mente hoy?"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addNote()}
                        style={{ flex: 1, background: 'rgba(0,0,0,0.3)', fontSize: '1.2rem', padding: '1rem' }}
                        disabled={adding}
                    />
                    <button
                        className="btn-primary"
                        onClick={addNote}
                        disabled={adding || !input.trim()}
                        style={{ width: '60px', height: '60px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}
                    >
                        {adding ? <Loader className="spin" size={24} /> : <Plus size={28} />}
                    </button>
                </div>

                {/* Color Selector */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Palette size={16} /> Color:
                    </span>
                    {Object.keys(colors).map(color => (
                        <motion.button
                            key={color}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedColor(color)}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: colors[color],
                                border: selectedColor === color ? '2px solid white' : '2px solid transparent',
                                cursor: 'pointer',
                                boxShadow: selectedColor === color ? '0 0 0 2px var(--accent-blue)' : 'none',
                                transition: 'border 0.2s'
                            }}
                            title={color}
                        />
                    ))}
                </div>
            </div>

            {/* Grid of Notes */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <Loader className="spin" size={32} style={{ marginBottom: '1rem' }} />
                    <p>Cargando tus notas...</p>
                </div>
            ) : filteredNotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                    {searchTerm ? <p>No se encontraron notas con "{searchTerm}"</p> : <p>Empieza escribiendo algo arriba ✨</p>}
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    gridAutoRows: 'minmax(150px, auto)'
                }}>
                    <AnimatePresence>
                        {filteredNotes.map(note => (
                            <motion.div
                                key={note.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                layout
                                className="card glass"
                                style={{
                                    background: colors[note.color] || colors.default,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    borderTop: `4px solid ${note.completed ? '#10b981' : 'rgba(255,255,255,0.1)'}`
                                }}
                            >
                                <div style={{
                                    fontSize: '1.1rem',
                                    lineHeight: '1.6',
                                    marginBottom: '1.5rem',
                                    textDecoration: note.completed ? 'line-through' : 'none',
                                    color: note.completed ? 'rgba(255,255,255,0.5)' : 'white',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                }}>
                                    {note.text}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <button
                                        onClick={() => toggleNote(note.id, note.completed)}
                                        style={{
                                            background: note.completed ? '#10b981' : 'rgba(255,255,255,0.1)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '0.5rem 1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            cursor: 'pointer',
                                            color: 'white',
                                            transition: 'all 0.2s',
                                            fontSize: '0.9rem',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {note.completed ? <><Check size={16} /> Completada</> : 'Marcar lista'}
                                    </button>
                                    <button
                                        onClick={() => deleteNote(note.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#f87171',
                                            cursor: 'pointer',
                                            opacity: 0.7,
                                            padding: '0.5rem'
                                        }}
                                        title="Eliminar"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </motion.div>
    );
};
export default Notes;
