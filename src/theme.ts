// Tokens from design.md — "Transit Map": Tokyo metro signage, flat, single accent.
export const colors = {
  primary: '#121212',
  secondary: '#666666',
  tertiary: '#0064D2', // the one interactive accent per screen
  neutral: '#F8F8F8',
  surface: '#FFFFFF',
  onPrimary: '#FFFFFF',
  hairline: '#E4E4E4',
  faded: '#B8B8B8',
};

export const radius = { sm: 2, md: 4, lg: 6 };
export const space = { sm: 8, md: 16, lg: 32 };

export const font = {
  regular: 'WorkSans_400Regular',
  medium: 'WorkSans_500Medium',
  semibold: 'WorkSans_600SemiBold',
  bold: 'WorkSans_700Bold',
};

export const type = {
  display: { fontFamily: font.bold, fontSize: 60, lineHeight: 62, letterSpacing: -1.8, color: colors.primary },
  h1: { fontFamily: font.bold, fontSize: 36, lineHeight: 40, letterSpacing: -0.7, color: colors.primary },
  h2: { fontFamily: font.bold, fontSize: 20, lineHeight: 24, letterSpacing: -0.2, color: colors.primary },
  body: { fontFamily: font.regular, fontSize: 15.2, lineHeight: 23.5, color: colors.primary },
  label: { fontFamily: font.bold, fontSize: 11.5, letterSpacing: 0.92, color: colors.secondary, textTransform: 'uppercase' as const },
};

// Route colours — each shopping list runs on its own line.
export type LineKey = keyof typeof lines;
export const lines = {
  G: { name: 'Ginza', color: '#F39700' },
  M: { name: 'Marunouchi', color: '#E60012' },
  H: { name: 'Hibiya', color: '#9CAEB7' },
  T: { name: 'Tozai', color: '#00A7DB' },
  C: { name: 'Chiyoda', color: '#009944' },
  Y: { name: 'Yurakucho', color: '#C1A470' },
  Z: { name: 'Hanzomon', color: '#9B7CB6' },
  N: { name: 'Namboku', color: '#00ADA9' },
  F: { name: 'Fukutoshin', color: '#BB641D' },
};
