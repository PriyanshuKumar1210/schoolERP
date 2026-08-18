export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7a4e2d',
        secondary: '#a56a43',
        tertiary: '#d8b08c',
        accent: '#b68c67',
        success: '#5f7a46',
        danger: '#9b4d3a',
        warning: '#b9773b',
        light: '#f7efe4',
        dark: '#3f2a1d',
        sage: '#7f634e',
        canvas: '#f4ecdf',
        surface: '#fbf6ee',
        panel: '#fffaf3',
        line: '#dcc9b5',
        ink: '#3f2a1d',
        mint: '#6f8a55',
        gold: '#c28a42',
        sky: '#b68c67',
        rose: '#b05d4d',
      },
      backgroundImage: {
        'gradient-soft': 'linear-gradient(135deg, #7a4e2d 0%, #a56a43 100%)',
        'gradient-pastel': 'linear-gradient(135deg, #f4ecdf 0%, #e8d4bd 100%)',
        'gradient-hero': 'linear-gradient(135deg, #f7efe4 0%, #eadcc9 50%, #d9c5b0 100%)',
        'gradient-card': 'linear-gradient(180deg, #fffaf3 0%, #f7efe4 100%)',
      },
    },
  },
  plugins: [],
}
