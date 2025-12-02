/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tech: {
          black: '#0A0A0A',      // Void Black
          bg: '#0D0D0F',         // Fondo principal (del segundo config)
          card: '#121212',       // Titanium (Superficies)
          cardHover: '#16171a',  // Tarjetas hover (del segundo config)
          input: '#1a1c20',
          zinc: '#27272a',
          border: '#333333',
        },
        neon: {
          main: '#00FF99',       // Cyber Neon (Principal)
          dark: '#00cc7a',       // Estado activo/oscuro
          hover: '#00e68f',      // Hover state
          glow: 'rgba(0, 255, 153, 0.5)', // Para sombras
          teal: '#00D1B2',       // Gradiente secundario
        },
        gray: {
          main: '#EDEDED',       // Texto Principal (Off-white)
          muted: '#A1A1AA',      // Texto Secundario
          border: '#333333',
        }
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'], // Fuente tecnológica
        sans: ['Inter', 'sans-serif'],       // Fuente legible
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #00FF99 0%, #00D1B2 100%)',
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2300FF99' fill-opacity='0.03' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'neon': '0 0 20px -5px rgba(0, 255, 153, 0.4)',
        'neon-strong': '0 0 40px -10px rgba(0, 255, 153, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite', // Agregada del segundo config
      }
    },
  },
  plugins: [],
}