import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, Loader } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
            navigate('/');
        } catch (err) {
            setError('Error: ' + err.message);
        }
        setLoading(false);
    }

    async function handleGoogleLogin() {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            setError('Error de Google: ' + err.message);
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(50px)'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                right: '-10%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(50px)'
            }} />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="glass"
                style={{
                    maxWidth: '450px',
                    width: '100%',
                    padding: '3rem 2rem',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <Logo size={60} showText={false} />
                    </div>
                    <motion.h2
                        key={isLogin ? 'login' : 'register'}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            marginBottom: '0.5rem',
                            background: 'linear-gradient(to right, #fff, #94a3b8)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
                    </motion.h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isLogin ? 'Ingresa a tu espacio de productividad' : 'Empieza a cumplir tus metas hoy'}
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#fca5a5',
                            padding: '1rem',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <User size={16} /> {error}
                    </motion.div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            width: '100%',
                            padding: '0.8rem',
                            background: 'white',
                            color: '#0f172a',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginBottom: '1.5rem',
                            transition: 'transform 0.2s',
                            opacity: loading ? 0.7 : 1
                        }}
                        onMouseOver={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseOut={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continuar con Google
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)' }}></div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>o con email</span>
                        <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ paddingLeft: '3rem', width: '100%', background: 'rgba(0,0,0,0.2)' }}
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingLeft: '3rem', width: '100%', background: 'rgba(0,0,0,0.2)' }}
                            />
                        </div>

                        <button
                            className="btn-primary"
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? <Loader className="spin" size={20} /> : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {isLogin ? '¿Todavía no tienes cuenta? ' : '¿Ya tienes una cuenta? '}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-blue)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            textDecoration: 'none'
                        }}
                    >
                        {isLogin ? 'Registrarse gratis' : 'Inicia Sesión'}
                    </button>
                </div>
            </motion.div>

            <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default Login;
