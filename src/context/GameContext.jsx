import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ToastContext';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

// Sonidos en Base64 para no depender de archivos externos
const SOUNDS = {
    success: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbqWEyM2CfutvPZFtfcp+82c9kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2QtLV+g2NvPZC0tX6DY289kLS1foNjbz2",
    levelup: "data:audio/wav;base64,UklGRnoGAABXQVZ..." // Placeholder simplificado, usaremos un Audio object genérico mejor
};

export const GameProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const [level, setLevel] = useState(1);
    const [xp, setXP] = useState(0);
    const [nextLevelXP, setNextLevelXP] = useState(100);

    // Sound Player
    const playSound = (type = 'success') => {
        try {
            // Un sonido de beep simple generado por oscilador sería mejor, pero por ahora usaremos este truco
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            if (type === 'success') {
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.5);
            } else if (type === 'levelup') {
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
                oscillator.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.2);
                oscillator.frequency.linearRampToValueAtTime(900, audioCtx.currentTime + 0.4);
                gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 1);
            }
        } catch (e) {
            console.error("Audio error", e);
        }
    };

    useEffect(() => {
        if (!currentUser) return;

        // Cargar estadísticas del usuario
        const userRef = doc(db, "users", currentUser.uid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setXP(data.xp || 0);
                setLevel(data.level || 1);
            } else {
                // Inicializar si no existe
                setDoc(userRef, { xp: 0, level: 1 }, { merge: true });
            }
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Calcular XP necesaria para el nivel
    useEffect(() => {
        setNextLevelXP(level * 100 * 1.5); // Curva de dificultad
    }, [level]);

    const addXP = async (amount) => {
        if (!currentUser) return;

        playSound('success');

        const newXP = xp + amount;
        let newLevel = level;
        let required = nextLevelXP;

        // Level UP logic
        if (newXP >= required) {
            newLevel += 1;
            playSound('levelup');
            addToast(`¡NIVEL ${newLevel} ALCANZADO! 🎉`, "success");
        }

        // Actualizar DB
        // Usamos setDoc con merge para no borrar otros datos del usuario
        await setDoc(doc(db, "users", currentUser.uid), {
            xp: newXP,
            level: newLevel
        }, { merge: true });

        // Feedback visual
        if (newLevel === level) {
            // Solo toast de XP si no subió de nivel (para no spammear)
            // addToast(`+${amount} XP`, "info"); 
        }
    };

    return (
        <GameContext.Provider value={{ level, xp, nextLevelXP, addXP, playSound }}>
            {children}
        </GameContext.Provider>
    );
};
