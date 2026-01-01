import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, FileText, Calendar, Target, MessageSquare, LogOut, ChevronRight, PiggyBank } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import Logo from './Logo';

const Sidebar = () => {
    const { logout, currentUser } = useAuth();
    const { level, xp, nextLevelXP } = useGame();
    const navigate = useNavigate();

    const navItems = [
        { path: '/', icon: <Home size={22} />, label: 'Inicio' },
        { path: '/notes', icon: <FileText size={22} />, label: 'Notas' },
        { path: '/schedule', icon: <Calendar size={22} />, label: 'Horario' },
        { path: '/goals', icon: <Target size={22} />, label: 'Metas' },
        { path: '/savings', icon: <PiggyBank size={22} />, label: 'Ahorros' },
        { path: '/chat', icon: <MessageSquare size={22} />, label: 'Mentalidad IA' },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <nav className="glass" style={{
            margin: '1rem',
            borderRadius: '24px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 2rem)',
            position: 'sticky',
            top: '1rem',
            border: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(15, 23, 42, 0.4)'
        }}>
            <div style={{
                marginBottom: '2.5rem',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <Logo size={42} showText={true} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            padding: '1rem 1.25rem',
                            borderRadius: '16px',
                            textDecoration: 'none',
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            background: isActive ? 'var(--accent-gradient)' : 'transparent',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            fontWeight: isActive ? 600 : 400
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                                {isActive && (
                                    <motion.div layoutId="activeIndicator">
                                        <ChevronRight size={16} />
                                    </motion.div>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '0.5rem' }}>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '6px' }}>
                            <p style={{ fontSize: '0.9rem', fontWeight: '800', fontFamily: 'monospace', color: '#fbbf24' }}>
                                LVL {level}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{Math.floor(xp)} XP</p>
                        </div>

                        {/* XP Bar */}
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((xp / nextLevelXP) * 100, 100)}%` }}
                                style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                                    boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)'
                                }}
                            />
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', textAlign: 'right' }}>
                            Next: {Math.floor(nextLevelXP)}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.8rem',
                        padding: '1rem',
                        borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'all 0.2s',
                        fontWeight: '500'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                >
                    <LogOut size={18} />
                    Cerrar Sesión
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;
