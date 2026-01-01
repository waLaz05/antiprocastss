import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Trash2, Clock, Plus, Zap, Briefcase, Coffee, Book, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../utils/animations';
import { useToast } from '../context/ToastContext';

const Schedule = () => {
    // Generar horas de 5:00 AM a 11:00 PM
    const timeSlots = Array.from({ length: 19 }, (_, i) => i + 5);
    const { currentUser } = useAuth();
    const { addToast } = useToast();

    const [activities, setActivities] = useState([]);
    const [editingSlot, setEditingSlot] = useState(null); // { hour: 5 }
    const [tempText, setTempText] = useState('');
    const inputRef = useRef(null);

    // Auto-focus al editar
    useEffect(() => {
        if (editingSlot && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingSlot]);

    useEffect(() => {
        if (!currentUser) return;
        const q = query(collection(db, "schedule"), where("userId", "==", currentUser.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setActivities(data);
        }, (error) => {
            console.error("Error fetching schedule:", error);
            addToast("Error cargando horario (permisos)", "error");
        });
        return () => unsubscribe();
    }, [currentUser]);

    const handleSave = async (hour) => {
        if (!tempText.trim()) {
            setEditingSlot(null);
            return;
        }

        try {
            const existing = activities.find(a => a.hour === hour);
            if (existing) {
                await updateDoc(doc(db, "schedule", existing.id), { description: tempText });
            } else {
                await addDoc(collection(db, "schedule"), {
                    hour,
                    description: tempText,
                    userId: currentUser.uid
                });
            }
            setEditingSlot(null);
            setTempText('');
            // addToast("Guardado", "success");
        } catch (error) {
            addToast("Error al guardar", "error");
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("¿Borrar actividad?")) {
            try {
                await deleteDoc(doc(db, "schedule", id));
                addToast("Eliminado", "success");
            } catch (error) {
                addToast("Error al eliminar", "error");
            }
        }
    };

    const startEditing = (hour, currentText = '') => {
        setEditingSlot(hour);
        setTempText(currentText);
    };

    const getActivityColor = (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('gimnasio') || lower.includes('ejercicio') || lower.includes('correr')) return 'var(--accent-blue)';
        if (lower.includes('trabajo') || lower.includes('reunión') || lower.includes('proyecto')) return 'var(--accent-purple)';
        if (lower.includes('estudiar') || lower.includes('leer') || lower.includes('clase')) return '#10b981'; // Green
        if (lower.includes('comer') || lower.includes('almuerzo') || lower.includes('cena')) return '#f59e0b'; // Amber
        if (lower.includes('dormir') || lower.includes('descanso')) return '#64748b'; // Slate
        return 'rgba(255,255,255,0.1)'; // Default
    };

    const getIcon = (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('trabajo')) return <Briefcase size={16} />;
        if (lower.includes('comer')) return <Coffee size={16} />;
        if (lower.includes('estudiar')) return <Book size={16} />;
        if (lower.includes('dormir')) return <Moon size={16} />;
        if (lower.includes('entrenar')) return <Zap size={16} />;
        return <Clock size={16} />;
    };

    // Calculate current hour line position
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const isCurrentDay = true; // Por ahora asumimos horario diario siempre

    return (
        <motion.div
            className="page-container"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Agenda Diaria</h1>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
            </div>

            <div className="glass" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
                {timeSlots.map((hour) => {
                    const activity = activities.find(a => a.hour === hour);
                    const isEditing = editingSlot === hour;
                    // ... (resto logic)
                    const isPast = hour < currentHour;
                    const isNow = hour === currentHour;

                    return (
                        <motion.div
                            key={hour}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '80px 1fr',
                                borderBottom: '1px solid var(--glass-border)',
                                minHeight: '70px',
                                position: 'relative',
                                background: isNow ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                            }}
                            onClick={() => !isEditing && startEditing(hour, activity?.description)}
                        >
                            {/* Time Column */}
                            <div style={{
                                padding: '1rem',
                                borderRight: '1px solid var(--glass-border)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isNow ? 'var(--accent-blue)' : 'var(--text-secondary)',
                                fontWeight: isNow ? 'bold' : 'normal',
                                fontSize: '0.9rem'
                            }}>
                                {hour}:00
                                {hour < 12 ? ' AM' : ' PM'}
                            </div>

                            {/* Content Column */}
                            <div style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
                                {isEditing ? (
                                    <div style={{ width: '100%', display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={tempText}
                                            onChange={(e) => setTempText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSave(hour);
                                                if (e.key === 'Escape') setEditingSlot(null);
                                            }}
                                            onBlur={() => handleSave(hour)}
                                            placeholder="Escribe actividad..."
                                            style={{
                                                background: 'rgba(0,0,0,0.3)',
                                                border: '1px solid var(--accent-blue)',
                                                borderRadius: '8px',
                                                padding: '0.8rem',
                                                width: '100%',
                                                color: 'white'
                                            }}
                                        />
                                    </div>
                                ) : (
                                    activity ? (
                                        <motion.div
                                            layoutId={`act-${hour}`}
                                            style={{
                                                background: getActivityColor(activity.description),
                                                width: '100%',
                                                height: '90%',
                                                borderRadius: '8px',
                                                padding: '0.5rem 1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                                opacity: isPast ? 0.6 : 1,
                                                border: isNow ? '1px solid rgba(255,255,255,0.2)' : 'none'
                                            }}
                                        >
                                            {getIcon(activity.description)}
                                            <span style={{ fontWeight: '500' }}>{activity.description}</span>
                                            <button
                                                onClick={(e) => handleDelete(e, activity.id)}
                                                className="delete-btn"
                                                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'white', opacity: 0.5, cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <div style={{
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: 'var(--text-secondary)'
                                        }} className="hover-hint">
                                            <Plus size={16} /> <span>Click para añadir</span>
                                        </div>
                                    )
                                )}
                            </div>
                        </motion.div>
                    );
                })}

                {/* Indicador de "Ahora" (Línea roja) solo si es dentro del rango */}
                {currentHour >= 5 && currentHour <= 23 && (
                    <div style={{
                        position: 'absolute',
                        top: `${(currentHour - 5) * 70 + (currentMin / 60) * 70}px`,
                        left: '0',
                        right: '0',
                        height: '2px',
                        background: '#ef4444',
                        pointerEvents: 'none',
                        zIndex: 10,
                        boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)'
                    }}>
                        <div style={{
                            position: 'absolute',
                            left: '70px',
                            top: '-5px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#ef4444'
                        }} />
                    </div>
                )}
            </div>

            <style>{`
                .hover-hint { opacity: 0; }
                div:hover > .hover-hint { opacity: 0.5; }
            `}</style>
        </motion.div>
    );
};

export default Schedule;
