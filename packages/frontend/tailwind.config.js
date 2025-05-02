module.exports = {
  important: true,
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#151150',
          foreground: '#ffffff',
          hover: '#1e1a70',
          active: '#120d45',
        },
        secondary: {
          DEFAULT: '#6b7280',
          foreground: '#ffffff',
          hover: '#4b5563',
          active: '#374151',
        },
        success: {
          DEFAULT: '#22c55e',
          foreground: '#ffffff',
          hover: '#16a34a',
          active: '#15803d',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
          hover: '#dc2626',
          active: '#b91c1c',
        },
        warning: {
          DEFAULT: '#f59e0b',
          foreground: '#ffffff',
          hover: '#d97706',
          active: '#b45309',
        },
      },
      fontSize: {
        xs: ['14px', { lineHeight: '1.5' }],
        sm: ['16px', { lineHeight: '1.5' }],
        base: ['18px', { lineHeight: '1.5' }],
        lg: ['20px', { lineHeight: '1.5' }],
        xl: ['24px', { lineHeight: '1.5' }],
        '2xl': ['34px', { lineHeight: '1.25' }],
        '3xl': ['42px', { lineHeight: '1.25' }],
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
