import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { GameProvider } from './context/GameContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Schedule from './pages/Schedule';
import Chat from './pages/Chat';
import Goals from './pages/Goals';
import Savings from './pages/Savings';
import Login from './pages/Login';
import BottomNav from './components/BottomNav';
import MobileTopBar from './components/MobileTopBar';

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }) => {
    const { currentUser } = useAuth();
    return currentUser ? children : <Navigate to="/login" />;
};

// Layout para usuarios autenticados
const AuthenticatedLayout = ({ children }) => (
    <div className="layout">
        <aside className="desktop-nav">
            <Sidebar />
        </aside>

        <div className="mobile-header">
            <MobileTopBar />
        </div>

        <main className="main-content" style={{ position: 'relative', overflowX: 'hidden' }}>
            {children}
            {/* Espacio extra abajo para que el contenido no quede tapado por el nav móvil */}
            <div className="mobile-spacer"></div>
        </main>

        <div className="mobile-nav">
            <BottomNav />
        </div>
    </div>
);

// Modificación: Necesitamos separar las rutas en un componente hijo para usar useLocation
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<Login />} />

                <Route path="/" element={
                    <PrivateRoute>
                        <AuthenticatedLayout>
                            <Dashboard />
                        </AuthenticatedLayout>
                    </PrivateRoute>
                } />

                <Route path="/notes" element={
                    <PrivateRoute>
                        <AuthenticatedLayout>
                            <Notes />
                        </AuthenticatedLayout>
                    </PrivateRoute>
                } />

                <Route path="/schedule" element={
                    <PrivateRoute>
                        <AuthenticatedLayout>
                            <Schedule />
                        </AuthenticatedLayout>
                    </PrivateRoute>
                } />

                <Route path="/goals" element={
                    <PrivateRoute>
                        <AuthenticatedLayout>
                            <Goals />
                        </AuthenticatedLayout>
                    </PrivateRoute>
                } />

                <Route path="/savings" element={
                    <PrivateRoute>
                        <AuthenticatedLayout>
                            <Savings />
                        </AuthenticatedLayout>
                    </PrivateRoute>
                } />

                <Route path="/chat" element={
                    <PrivateRoute>
                        <AuthenticatedLayout>
                            <Chat />
                        </AuthenticatedLayout>
                    </PrivateRoute>
                } />
            </Routes>
        </AnimatePresence>
    );
};

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <GameProvider>
                    <Router>
                        <AnimatedRoutes />
                    </Router>
                </GameProvider>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
