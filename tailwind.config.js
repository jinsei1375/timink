/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Timinkブランドカラー
        brand: {
          blue: '#5C73E6', // メインブルー（グラデーション左上）
          purple: '#A164E6', // メインパープル（グラデーション右下）
          primary: '#6C6EE6', // プライマリカラー（青と紫の中間）
          accent: '#F4C15C', // アクセントイエロー（砂時計の砂）
        },
        // アプリ専用カスタムカラー
        'app-primary': {
          DEFAULT: '#6C6EE6', // ブランドプライマリカラー
          light: '#E0E2FB', // 薄い紫青
          dark: '#4A4DB8', // 濃い紫青
        },
        'app-accent': {
          DEFAULT: '#F4C15C', // アクセントイエロー
          light: '#FDF3E0', // 薄いイエロー
          dark: '#D9A640', // 濃いイエロー
        },
        'app-success': {
          DEFAULT: '#10B981', // Green-500
          light: '#D1FAE5', // Green-100
          dark: '#059669', // Green-600
        },
        'app-warning': {
          DEFAULT: '#F59E0B', // Amber-500
          light: '#FEF3C7', // Amber-100
          dark: '#D97706', // Amber-600
        },
        'app-danger': {
          DEFAULT: '#EF4444', // Red-500
          light: '#FEE2E2', // Red-100
          dark: '#DC2626', // Red-600
        },
        'app-info': {
          DEFAULT: '#6366F1', // Indigo-500
          light: '#E0E7FF', // Indigo-100
          dark: '#4338CA', // Indigo-700
        },
        // ニュートラルカラー
        'app-neutral': {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        'app-white': '#FFFFFF',
        'app-light-gray': '#EAEAEA',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #5C73E6 0%, #A164E6 100%)',
      },
    },
  },
  plugins: [],
};
