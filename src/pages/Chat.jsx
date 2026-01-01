import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Loader, HeartHandshake } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../utils/animations';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isThinking, setIsThinking] = useState(false);

    const messagesEndRef = useRef(null);
    const { currentUser } = useAuth();
    const { addToast } = useToast();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    useEffect(() => {
        if (!currentUser) return;
        const q = query(
            collection(db, "chats"),
            where("userId", "==", currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            msgs.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Lógica "Cerebro" de la IA mejorada
    const generateAIResponse = async (userText) => {
        setIsThinking(true);

        try {
            // 1. Obtener contexto real del usuario (¿Tiene metas? ¿Tiene ahorros?)
            let contextStatus = { hasHabits: false, hasGoals: false };
            try {
                const itemsRef = collection(db, "user_items");
                const qH = query(itemsRef, where("userId", "==", currentUser.uid));
                const snapshot = await getDocs(qH);
                if (!snapshot.empty) {
                    const data = snapshot.docs.map(d => d.data());
                    contextStatus.hasHabits = data.some(i => i.type === 'habits');
                    contextStatus.hasGoals = data.some(i => i.type === 'goals');
                }
            } catch (e) { console.log("Context error:", e); }

            setTimeout(async () => {
                let responseText = "";
                const lower = userText.toLowerCase();

                // DETECTOR DE EMOCIONES Y CRISIS
                if (lower.includes("triste") || lower.includes("depri") || lower.includes("llorar") || lower.includes("soledad")) {
                    responseText = "Siento que estés pasando por esto. Está bien no estar bien a veces. Recuerda: tu valor no depende de tu productividad de hoy, ni de quien se fue. Tu valor es intrínseco. Tómate un respiro, bebe agua y cuando estés listo, demos un paso pequeño. Solo uno.";

                } else if (lower.includes("novia") || lower.includes("pareja") || lower.includes("dejo") || lower.includes("dejó") || lower.includes("cortamos") || lower.includes("amor")) {
                    responseText = "Las rupturas son duras, hermano. El dolor es real, pero también es combustible. Ahora tienes todo este tiempo y energía para reinvertirlo en TI. Conviértete en la versión de ti mismo que esa persona lamentará haber perdido. Vamos a construir ese imperio juntos.";

                } else if (lower.includes("fracas") || lower.includes("no puedo") || lower.includes("rendir") || lower.includes("imposible")) {
                    responseText = "El único fracaso real es no intentarlo. ¿Sabías que los aviones despegan contra el viento? Si sientes resistencia, es porque estás a punto de despegar. No mires la cima de la montaña, mira solo el siguiente paso.";

                    // DETECTOR DE PROGRESO (¿El usuario es nuevo?)
                } else if (!contextStatus.hasHabits && !contextStatus.hasGoals) {
                    if (lower.includes("hola") || lower.includes("empezar")) {
                        responseText = `¡Hola ${currentUser?.displayName?.split(' ')[0] || 'Campeón'}! Veo que tu tablero está limpio. Eso es un lienzo en blanco perfecto. ¿Por qué no vamos a 'Metas' y creamos tu primer hábito simple? (Ej: Beber agua).`;
                    } else {
                        responseText = "Entiendo. Para ayudarte mejor, necesito que definamos hacia dónde vamos. Aún no tienes metas registradas. ¿Qué es lo primero que quieres lograr este año?";
                    }

                } else {
                    // RESPUESTAS GENERALES (CON CONTEXTO DE QUE SÍ TIENE METAS)
                    if (lower.includes("hola")) {
                        responseText = `¡Hola de nuevo! Tus metas te están esperando. ¿Listo para atacar el día?`;
                    } else if (lower.includes("gracias")) {
                        responseText = "Estamos en el mismo equipo. 👊";
                    } else {
                        responseText = "Interesante perspectiva. ¿Cómo podemos usar esa energía para avanzar en tus objetivos hoy?";
                    }
                }

                await addDoc(collection(db, "chats"), {
                    text: responseText,
                    sender: 'ai',
                    userId: currentUser.uid,
                    timestamp: new Date()
                });

                setIsThinking(false);
            }, 2000); // 2 segundos para dar sensación de "pensar"

        } catch (e) {
            setIsThinking(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const textToSend = input;
        setInput('');
        setIsTyping(true);

        try {
            await addDoc(collection(db, "chats"), {
                text: textToSend,
                sender: 'user',
                userId: currentUser.uid,
                timestamp: new Date()
            });
            setIsTyping(false);
            generateAIResponse(textToSend);
        } catch (error) {
            addToast("Error de conexión", "error");
            setIsTyping(false);
        }
    };

    return (
        <motion.div
            className="page-container"
            style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)', paddingBottom: '1rem', maxWidth: '900px', margin: '0 auto' }}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >

            <div className="glass" style={{ padding: '1rem 2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '16px' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bot color="white" size={24} />
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', border: '2px solid #0f172a' }}></div>
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Mentalidad IA</h2>
                    <div style={{ fontSize: '0.8rem', color: '#10b981' }}>Tu Coach Personal</div>
                </div>
            </div>

            <div className="card glass" style={{
                flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0', background: 'rgba(15, 23, 42, 0.6)'
            }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <AnimatePresence>
                        {messages.map(msg => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                style={{
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div style={{
                                    background: msg.sender === 'user' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)',
                                    padding: '1rem 1.2rem',
                                    borderRadius: '18px',
                                    borderBottomRightRadius: msg.sender === 'user' ? '4px' : '18px',
                                    borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : '18px',
                                    color: 'white',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                    lineHeight: '1.5'
                                }}>
                                    {msg.text}
                                </div>

                                {/* Botón de acción rápida si la IA detecta tristeza extrema */}
                                {msg.sender === 'ai' && (msg.text.includes("imperio") || msg.text.includes("valor")) && (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                                        style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}
                                    >
                                        <HeartHandshake size={14} color="var(--text-secondary)" />
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Estoy contigo en esto</span>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}

                        {isThinking && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '18px', borderBottomLeftRadius: '4px' }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} style={{ width: '8px', height: '8px', background: 'var(--text-secondary)', borderRadius: '50%' }} />
                                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: '8px', height: '8px', background: 'var(--text-secondary)', borderRadius: '50%' }} />
                                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: '8px', height: '8px', background: 'var(--text-secondary)', borderRadius: '50%' }} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                <div style={{ padding: '1.2rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Escribe algo..."
                        disabled={isTyping}
                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '1rem 1.5rem', color: 'white' }}
                    />
                    <button className="btn-primary" onClick={handleSend} disabled={!input.trim() || isTyping} style={{ borderRadius: '50%', width: '54px', height: '54px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isTyping ? <Loader className="spin" size={24} /> : <Send size={24} />}
                    </button>
                </div>
            </div>
            <style>{` .spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } `}</style>
        </motion.div>
    );
};
export default Chat;
