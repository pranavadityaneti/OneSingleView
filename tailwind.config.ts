import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1057a9',
                    50: '#f0f7ff',
                    100: '#e0effe',
                    200: '#bae0fd',
                    300: '#7cc5fb',
                    400: '#36a6f6',
                    500: '#1089e8',
                    600: '#1057a9', // Brand color
                    700: '#0e468a',
                    800: '#0f3c71',
                    900: '#11335a',
                    950: '#0b203c',
                },
                secondary: {
                    DEFAULT: '#64748B', // Slate (Cool Gray)
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A',
                    950: '#020617',
                },
                accent: '#0EA5E9', // Sky Blue
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444',
                'gray-soft': '#F8FAFC',
            },
            boxShadow: {
                'soft': '0 2px 10px rgba(0, 0, 0, 0.03)',
                'card': '0 4px 20px rgba(0, 0, 0, 0.04)',
                'hover': '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                'glow': '0 0 20px rgba(37, 99, 235, 0.15)',
            },
            fontFamily: {
                sans: ['var(--font-red-hat-display)', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
        },
    },
    plugins: [],
};

export default config;
