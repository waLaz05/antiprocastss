import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { pageVariants, listContainerVariants, listItemVariants } from '../utils/animations';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        completedHabits: 0,
        totalHabits: 0,
        quote: "Cargando..."
    });

    // Datos reales calculados
    const [dailyData, setDailyData] = useState([]);

    useEffect(() => {
        if (!currentUser) return;

        const fetchData = async () => {
            try {
                // 1. Obtener Hábitos para el Pie Chart
                const itemsRef = collection(db, "user_items");
                const habitsQuery = query(itemsRef, where("userId", "==", currentUser.uid), where("type", "==", "habits"));
                const habitsSnapshot = await getDocs(habitsQuery);

                const habits = habitsSnapshot.docs.map(doc => doc.data());
                const totalStreaks = habits.reduce((acc, curr) => acc + (curr.streak || 0), 0);
                const totalTargets = habits.reduce((acc, curr) => acc + (curr.target || 7), 0);

                setStats({
                    completedHabits: totalStreaks,
                    totalHabits: Math.max(totalTargets, 1),
                    // Quotes array
                    quote: [
                        "La disciplina te llevará donde la motivación no alcanza.",
                        "Hazlo ahora. A veces 'después' se convierte en 'nunca'.",
                        "Pequeños pasos todos los días suman grandes resultados.",
                        "No te detengas hasta que estés orgulloso."
                    ][Math.floor(Math.random() * 4)]
                });

                // 2. Obtener Notas completadas para el Line Chart (Actividad Semanal)
                // Simularemos actividad basada en 'createdAt' para notas completadas por ahora, 
                // ya que no guardamos 'completedAt'. 
                // *Mejora futura: Guardar fecha de completado real*
                const notesRef = collection(db, "notes");
                const notesQuery = query(notesRef, where("userId", "==", currentUser.uid)); // Traemos todas para ver creación
                const notesSnapshot = await getDocs(notesQuery);

                // Inicializar días de la semana (Lun-Dom)
                const daysMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
                const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const esLabels = { 'Mon': 'Lun', 'Tue': 'Mar', 'Wed': 'Mié', 'Thu': 'Jue', 'Fri': 'Vie', 'Sat': 'Sáb', 'Sun': 'Dom' };

                notesSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.createdAt) {
                        const date = new Date(data.createdAt.seconds * 1000);
                        const dayStr = date.toDateString().split(' ')[0]; // "Mon", "Tue"...
                        if (daysMap[dayStr] !== undefined) {
                            daysMap[dayStr] += 1;
                        }
                    }
                });

                // Convertir a array para Recharts
                const chartData = dayLabels.map(day => ({
                    name: esLabels[day],
                    tareas: daysMap[day]
                }));

                setDailyData(chartData);

            } catch (error) {
                console.error("Error fetching dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    // Datos Pie Chart
    const pieData = [
        { name: 'Completado', value: stats.completedHabits },
        { name: 'Restante', value: Math.max(0, stats.totalHabits - stats.completedHabits) },
    ];
    const COLORS = ['#8b5cf6', '#1e293b'];

    if (loading) {
        return <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}><p>Cargando panel...</p></div>;
    }

    return (
        <motion.div
            className="page-container"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div>
                <h1>Hola, {currentUser?.displayName || "Crack"} 👋</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Aquí tienes el resumen de tu rendimiento.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                {/* Gráfico Circular Real */}
                <motion.div
                    className="card glass"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <h3>Progreso de Hábitos</h3>
                    <div style={{ width: '100%', height: '220px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={65}
                                    outerRadius={85}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Texto central */}
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                                {Math.round((stats.completedHabits / stats.totalHabits) * 100)}%
                            </span>
                        </div>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                        {stats.completedHabits} rachas completadas de {stats.totalHabits} objetivos.
                    </p>
                </motion.div>

                {/* Frase */}
                <motion.div
                    className="card glass"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))' }}
                >
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔥</span>
                        <p style={{ fontSize: '1.25rem', fontWeight: '500', lineHeight: '1.6', fontStyle: 'italic' }}>
                            "{stats.quote}"
                        </p>
                    </div>
                </motion.div>

                {/* Gráfico de Actividad con Datos Reales */}
                <motion.div
                    className="card glass"
                    style={{ gridColumn: '1 / -1', minHeight: '350px' }}
                >
                    <h3>Actividad Semanal</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Basado en notas creadas por día</p>

                    <div style={{ width: '100%', height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#ec4899" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="tareas"
                                    stroke="url(#colorGradient)"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#0f172a', stroke: '#3b82f6', strokeWidth: 2 }}
                                    activeDot={{ r: 8, fill: '#ec4899' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

            </div>
        </div>
        </motion.div >
    );
};

export default Dashboard;
