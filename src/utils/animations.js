import { motion } from 'framer-motion';

// Variantes para páginas (Entrada/Salida suave)
export const pageVariants = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for "Apple-like" feel
        }
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.98,
        transition: { duration: 0.3, ease: "easeIn" }
    }
};

// Variantes para listas (Stagger effect - efecto cascada)
export const listContainerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.07, // Retraso entre cada item
            delayChildren: 0.1
        }
    }
};

export const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// Variantes para botones (Click elástico)
export const buttonTap = { scale: 0.95 };
export const buttonHover = { scale: 1.05, filter: "brightness(1.1)" };
