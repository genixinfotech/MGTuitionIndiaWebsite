/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: '#cc0000',
          dark: '#8b0000',
          light: '#ff4d4d',
        },
        charcoal: '#2d2d2d',
        'off-white': '#fafafa',
        whatsapp: '#25d366',
      },
      fontFamily: {
        outfit: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(45, 45, 45, 0.08)',
        'glass-lg': '0 16px 48px rgba(204, 0, 0, 0.12)',
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(ellipse 80% 60% at 70% 40%, rgba(204,0,0,0.18), transparent 60%), linear-gradient(135deg, #1a1214 0%, #2d1a1c 40%, #3d2226 100%)',
        'section-soft':
          'linear-gradient(180deg, #fafafa 0%, #f5f0f0 50%, #fafafa 100%)',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
}
