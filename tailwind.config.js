/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F58D54', // El fondo de la primera imagen
          yellow: '#FCD144', // El amarillo del icono de los niños
          coral: '#E86B5A', // El color de la palabra "LITTLE"
          cream: '#FFF6E0', // El fondo clarito del logo
          dark: '#333333', // El color del eslogan
        },
      },
    },
  },
  plugins: [],
}
