import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Calendar, Target, PiggyBank, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = () => {
    const navItems = [
        { path: '/', icon: <Home size={20} />, label: 'Inicio' },
        { path: '/notes', icon: <FileText size={20} />, label: 'Notas' },
        { path: '/schedule', icon: <Calendar size={20} />, label: 'Horario' },
        { path: '/goals', icon: <Target size={20} />, label: 'Metas' },
        { path: '/savings', icon: <PiggyBank size={20} />, label: 'Ahorros' },
        { path: '/chat', icon: <MessageSquare size={20} />, label: 'Chat' },
    ];

    return (
        <nav className="glass" style={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            right: '10px',
            height: '70px',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '0 0.5rem',
            zIndex: 1000,
            borderRadius: '24px',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 -5px 20px rgba(0,0,0,0.3)'
        }}>
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    style={({ isActive }) => ({
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        color: isActive ? '#a855f7' : 'var(--text-secondary)',
                        position: 'relative',
                        padding: '5px',
                        transition: 'color 0.3s'
                    })}
                >
                    {({ isActive }) => (
                        <>
                            <div style={{
                                background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))' : 'transparent',
                                borderRadius: '16px',
                                padding: '10px',
                                transition: 'all 0.3s ease',
                                transform: isActive ? 'translateY(-5px) scale(1.1)' : 'scale(1)',
                                boxShadow: isActive ? '0 4px 12px rgba(168, 85, 247, 0.3)' : 'none'
                            }}>
                                {item.icon}
                            </div>
                            {/* <span style={{ fontSize: '0.6rem', marginTop: '2px' }}>{item.label}</span> */}
                            {isActive && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    style={{
                                        position: 'absolute',
                                        bottom: '-8px',
                                        width: '4px',
                                        height: '4px',
                                        background: '#a855f7',
                                        borderRadius: '50%'
                                    }}
                                />
                            )}
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;
