import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { motion } from 'framer-motion';

const MobileTopBar = () => {
    const { currentUser, logout } = useAuth();
    const { level, xp, nextLevelXP } = useGame();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="glass" style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1rem',
            zIndex: 1000,
            borderRadius: '0 0 16px 16px',
            background: 'rgba(15, 23, 42, 0.9)',
            borderBottom: '1px solid var(--glass-border)',
            backdropFilter: 'blur(20px)'
        }}>
            {/* Left: Logo */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Logo size={32} showText={false} />
                <span style={{ fontWeight: '800', marginLeft: '8px', fontSize: '1rem' }}>AP</span>
            </div>

            {/* Center: XP Bar Compact */}
            <div style={{ flex: 1, margin: '0 1rem', maxWidth: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '3px', color: '#fbbf24', fontWeight: 'bold' }}>
                    <span>LVL {level}</span>
                    <span>{Math.floor(xp)} XP</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((xp / nextLevelXP) * 100, 100)}%` }}
                        style={{ height: '100%', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }}
                    />
                </div>
            </div>

            {/* Right: User / Logout */}
            <button
                onClick={handleLogout}
                style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: 'none',
                    color: '#fca5a5',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                }}
            >
                <LogOut size={16} />
            </button>
        </div>
    );
};

export default MobileTopBar;
