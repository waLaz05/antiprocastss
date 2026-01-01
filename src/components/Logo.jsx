import React from 'react';

const Logo = ({ size = 40, showText = true }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="logo_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Abstract Brain/Process Shape */}
                <rect x="20" y="20" width="60" height="60" rx="16" stroke="url(#logo_gradient)" strokeWidth="6" fill="rgba(255,255,255,0.03)" />

                {/* Checkmark / Lightning Bolt / Neural Path */}
                <path
                    d="M35 50 L48 62 L68 38"
                    stroke="url(#logo_gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                />

                {/* Connection Dot */}
                <circle cx="68" cy="38" r="4" fill="#ec4899" />
            </svg>

            {showText && (
                <span style={{
                    fontSize: size * 0.65,
                    fontWeight: '800',
                    background: 'linear-gradient(to right, #fff, #cbd5e1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: 'Outfit, sans-serif',
                    letterSpacing: '-1px'
                }}>
                    AntiProcast
                </span>
            )}
        </div>
    );
};

export default Logo;
