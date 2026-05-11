/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Colores de gym.manumontaraz.es
        'bg': '#0f172a',
        'card': '#1e293b',
        'card-hover': '#334155',
        'primary': '#059669',
        'primary-dark': '#047857',
        'primary-light': '#34d399',
        'secondary': '#10b981',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        'border': '#334155',
        'danger': '#ef4444',
        'warning': '#f59e0b',
        'success': '#22c55e',
        // Legacy colors (para compatibilidad)
        'dark-bg': '#0f172a',
        'dark-card': '#1e293b',
        'dark-border': '#334155',
        'accent': '#059669',
        'accent-hover': '#047857'
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)'
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
      }
    }
  },
  plugins: []
}
