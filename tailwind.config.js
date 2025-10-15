/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#8b5cf6',
                secondary: '#ec4899',
                dark: '#111827',
                'dark-lighter': '#1f2937',
                emergency: '#ef4444',
                success: '#10b981',
                warning: '#f59e0b',
            },
            fontFamily: {
                'sans': ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}