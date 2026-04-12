/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#4F46E5',
          600: '#4338CA',
          700: '#3730A3',
          800: '#312E81',
          900: '#1E1B4B',
        },
        accent: {
          teal: '#06B6D4',
          'teal-light': '#22D3EE',
          'teal-dark': '#0891B2',
          amber: '#F59E0B',
          'amber-light': '#FCD34D',
          violet: '#7C3AED',
          'violet-light': '#A78BFA',
          orange: '#FF6B35',
          'orange-light': '#FF8555',
        },
        success: {
          light: '#6EE7B7',
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        warning: {
          light: '#FCD34D',
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
        danger: {
          light: '#FCA5A5',
          DEFAULT: '#F43F5E',
          dark: '#E11D48',
        },
        neutral: {
          50: '#F8F7FF',
          100: '#F0EFFE',
          200: '#E4E3F8',
          300: '#C8C7E8',
          400: '#9D9DC0',
          500: '#6B6B94',
          600: '#4A4A6A',
          700: '#2E2E4A',
          800: '#1A1A2E',
          900: '#0D0D1A',
        },
      },
      boxShadow: {
        '3d-sm': '0 2px 4px rgba(79,70,229,0.06), 0 4px 8px rgba(79,70,229,0.04)',
        '3d-md': '0 4px 8px rgba(79,70,229,0.10), 0 8px 16px rgba(79,70,229,0.07)',
        '3d-lg': '0 8px 16px rgba(79,70,229,0.12), 0 16px 32px rgba(79,70,229,0.08)',
        '3d-xl': '0 12px 24px rgba(79,70,229,0.14), 0 24px 48px rgba(79,70,229,0.10)',
        '3d-2xl': '0 16px 32px rgba(79,70,229,0.16), 0 32px 64px rgba(79,70,229,0.12)',
        'glass': '0 8px 32px 0 rgba(79, 70, 229, 0.12)',
        'glass-lg': '0 8px 32px 0 rgba(79, 70, 229, 0.22)',
        'neumorphism': '8px 8px 16px #d0d0ef, -8px -8px 16px #ffffff',
        'neumorphism-inset': 'inset 8px 8px 16px #d0d0ef, inset -8px -8px 16px #ffffff',
        'glow-primary': '0 0 24px rgba(79,70,229,0.4), 0 0 48px rgba(79,70,229,0.15)',
        'glow-accent': '0 0 24px rgba(6,182,212,0.4), 0 0 48px rgba(6,182,212,0.15)',
        'glow-amber': '0 0 24px rgba(245,158,11,0.4)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-left': 'slideLeft 0.4s ease-out',
        'slide-right': 'slideRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-up': 'scaleUp 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'orb-drift': 'orbDrift 20s ease-in-out infinite',
        'orb-drift-alt': 'orbDriftAlt 25s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        orbDrift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(40px, -30px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.97)' },
        },
        orbDriftAlt: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '40%': { transform: 'translate(-50px, 30px) scale(1.08)' },
          '70%': { transform: 'translate(30px, -20px) scale(0.95)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      perspective: {
        '500': '500px',
        '1000': '1000px',
        '1500': '1500px',
        '2000': '2000px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
        'mesh-light': 'radial-gradient(at 40% 20%, hsla(252,100%,70%,0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.08) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(272,100%,65%,0.08) 0px, transparent 50%)',
        'mesh-dark': 'radial-gradient(at 40% 20%, hsla(252,100%,60%,0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.12) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(272,100%,65%,0.10) 0px, transparent 50%)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.transform-style-3d': {
          'transform-style': 'preserve-3d',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.rotate-y-180': {
          transform: 'rotateY(180deg)',
        },
        '.font-display': {
          'font-family': 'Syne, system-ui, sans-serif',
        },
        '.font-mono-data': {
          'font-family': 'JetBrains Mono, Consolas, monospace',
        },
        '.text-balance': {
          'text-wrap': 'balance',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
