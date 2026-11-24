import {Platform} from "react-native";

export const Colors = {
    bgPrimary: '#14110F',
    bgSurface: '#1F1A17',
    bgElevated: '#28221E',
    bgOverlay: 'rgba(12, 10, 9, 0.85)',
    borderSubtle: '#332B26',
    borderStrong: '#4A3F38',
    accentPrimary: '#D97724',
    accentPrimaryHover: '#E58634',
    accentPrimaryMuted: 'rgba(217, 119, 36, 0.14)',
    accentBrazil: '#C89B3C',
    accentBrazilMuted: 'rgba(200, 155, 60, 0.14)',
    accentMap: '#36463A',
    statusSuccess: '#5C8D67',
    statusWarning: '#D97724',
    statusDanger: '#C94A4A',
    textPrimary: '#F2ECE4',
    textSecondary: '#A3968C',
    textMuted: '#756A62',
    textInverse: '#14110F'
} as const

export const Fonts = {
    display: 'SpaceGrotesk_700Bold',
    heading: 'SpaceGrotesk_600SemiBold',
    body: 'Inter_400Regular',
    bodyMedium: 'Inter_500Medium',
    bodySemiBold: 'Inter_600SemiBold',
    mono: 'JetBrainsMono_400Regular',
    monoMedium: 'JetBrainsMono_500Medium',
    monoBold: 'JetBrainsMono_700Bold',
} as const;

export const Typography = {
    heroTitle: {
        fontFamily: Fonts.display,
        fontSize: 36,
        lineHeight: 42,
        letterSpacing: -0.8,
    },
    h1: {
        fontFamily: Fonts.display,
        fontSize: 28,
        lineHeight: 34,
        letterSpacing: -0.5,
    },
    h2: {
        fontFamily: Fonts.heading,
        fontSize: 22,
        lineHeight: 28,
        letterSpacing: -0.3,
    },
    h3: {
        fontFamily: Fonts.heading,
        fontSize: 18,
        lineHeight: 24,
    },
    body: {
        fontFamily: Fonts.body,
        fontSize: 16,
        lineHeight: 24,
    },
    bodySemiBold: {
        fontFamily: Fonts.bodySemiBold,
        fontSize: 16,
        lineHeight: 24,
    },
    bodySmall: {
        fontFamily: Fonts.body,
        fontSize: 14,
        lineHeight: 20,
    },
    coordinate: {
        fontFamily: Fonts.monoMedium,
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 0.8,
        textTransform: 'uppercase' as const,
    },
    badge: {
        fontFamily: Fonts.monoBold,
        fontSize: 11,
        lineHeight: 14,
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
    },
} as const;

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
} as const;

export const Radii = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
} as const;

export const Layout = {
    breakpoints: {
        mobile: 768,
        desktop: 1024,
        wide: 1440,
    },
    sidebarWidth: 280,
    bottomDockHeight: 68,
    maxContentWidth: 1360,
    minTouchTarget: 48,
} as const;

export const Shadows = {
    card: Platform.select({
        web: {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
        },
        default: {
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 4,
        },
    }),
    modal: Platform.select({
        web: {
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.65)',
        },
        default: {
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 12},
            shadowOpacity: 0.6,
            shadowRadius: 16,
            elevation: 12,
        },
    }),
} as const;

export const Theme = {
    Colors,
    Fonts,
    Typography,
    Spacing,
    Radii,
    Layout,
    Shadows,
} as const;

export type AppTheme = typeof Theme;