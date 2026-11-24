import {Platform, Pressable, StyleSheet, Text, View} from "react-native";
import {useRouter} from "expo-router";
import {useResponsive} from "@/hooks/use-responsive";
import {useEffect} from "react";
import {ScreenContainer} from "@/components/screen-container";
import {ArrowRight, ChevronsDown, Compass} from "lucide-react-native";
import {Colors, Layout, Radii, Shadows, Spacing, Typography} from "@/constants/theme";
import {TopographicBackground} from "@/components/TopgraphicBackground";
import Animated, {Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming} from "react-native-reanimated";
import {MUSEUM_SECTIONS, SectionOverview} from "@/data/SectionOverview";

export default function HomeScreen() {
    const router = useRouter();
    const {isDesktop, height} = useResponsive();

    const translateY = useSharedValue(0);

    useEffect(() => {
        if (isDesktop) {
            translateY.value = 0;
            return
        }

        translateY.value = withRepeat(
            withTiming(6, {
                duration: 900,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, [isDesktop, translateY])

    const scrollCueAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{translateY: translateY.value}],
    }));

    const handleIniciarTrilha = () => {
        router.push({
            pathname: '/era',
            params: {}
        })
    }

    const handleAbrirSessao = (sectionId: string) => {
        router.push({
            pathname: '/era',
            params: {eraId: sectionId, mode: 'free'}
        })
    }

    return (
        <ScreenContainer fullBleed scrollable={!isDesktop}>
            <TopographicBackground/>
            {isDesktop ? (
                <View style={styles.desktopWrapper}>
                    <View style={styles.desktopSplitContainer}>
                        <View style={styles.desktopLeftPane}>
                            <Text
                                accessibilityRole="header"
                                style={styles.desktopHeroTitle}
                            >
                                Bem-vindo ao MoMS
                            </Text>

                            <Text style={styles.heroAcronym}>
                                Museum of Malwares and Security
                            </Text>

                            <Text style={styles.heroDescription}>
                                Nosso museu apresenta a história dos malwares e da segurança digital no Brasil e no
                                mundo.
                            </Text>

                            <View style={styles.ctaRow}>
                                <PrimaryTrailButton onPress={handleIniciarTrilha}/>
                            </View>
                        </View>

                        <View style={styles.verticalDivider}/>

                        <View style={styles.desktopRightPane}>
                            <View style={styles.desktopSectionHeader}>
                                <Text style={styles.desktopSectionHeaderTitle}>
                                    Ou escolha por onde começar
                                </Text>
                                <Text style={styles.desktopSectionHeaderSubtitle}>
                                    Navegue livremente por uma época específica do acervo
                                </Text>
                            </View>

                            <View style={styles.sectionList}>
                                {MUSEUM_SECTIONS.map((section) => (
                                    <SectionRowItem
                                        key={section.id}
                                        section={section}
                                        isDesktop
                                        onPress={() => handleAbrirSessao(section.id)}
                                    />
                                ))}
                            </View>
                        </View>
                    </View>
                </View>
            ) : (
                <View style={styles.mobileWrapper}>
                    <View style={[
                        styles.mobileHeroFold,
                        {minHeight: Math.max(height * 0.82, 500)}
                    ]}
                    >
                        <View style={styles.mobileHeroCenter}>
                            <Text
                                accessibilityRole="header"
                                style={styles.mobileHeroTitle}
                            >
                                Bem-vindo ao MoMS
                            </Text>

                            <Text style={[styles.heroAcronym, styles.mobileTextCenter]}>
                                Museum of Malwares and Security
                            </Text>

                            <Text style={styles.mobileHeroDescription}>
                                Explore a evolução das ameaças digitais, técnicas de contenção
                                e os marcos brasileiros da segurança computacional.
                            </Text>

                            <View style={styles.mobileCtaContainer}>
                                <PrimaryTrailButton onPress={handleIniciarTrilha} fullWidth/>
                            </View>
                        </View>

                        <View
                            style={styles.scrollCueContainer}
                            accessibilityLabel="Role para baixo para explorar cada seção manualmente"
                        >
                            <Animated.View style={scrollCueAnimatedStyle}>
                                <ChevronsDown size={24} color={Colors.accentPrimary}/>
                            </Animated.View>
                        </View>
                    </View>
                    <View style={styles.mobileSectionsArea}>
                        <View style={styles.sectionListHeader}>
                            <Text style={styles.sectionListTitle}>
                                Ou escolha por onde começar
                            </Text>
                            <Text style={styles.sectionListSubtitle}>
                                Navegue livremente por uma seção específica
                            </Text>
                        </View>

                        <View style={styles.sectionList}>
                            {MUSEUM_SECTIONS.map((section) => (
                                <SectionRowItem
                                    key={section.id}
                                    section={section}
                                    onPress={() => handleAbrirSessao(section.id)}
                                />
                            ))}
                        </View>
                    </View>
                </View>
            )}
        </ScreenContainer>
    );
}

function PrimaryTrailButton({
                                onPress,
                                fullWidth = false,
                            }: {
    onPress: () => void;
    fullWidth?: boolean;
}) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel="Iniciar Trilha Guiada da Seção 1 até a Seção 5"
            style={({pressed, hovered}: any) => [
                styles.primaryButton,
                fullWidth && {width: '100%'},
                hovered && styles.primaryButtonHover,
                pressed && styles.primaryButtonPressed,
            ]}
        >
            <Compass size={20} color={Colors.textInverse}/>
            <Text style={styles.primaryButtonText}>Iniciar Trilha Guiada</Text>
            <ArrowRight size={18} color={Colors.textInverse}/>
        </Pressable>
    );
}

function SectionRowItem({
                            section,
                            isDesktop = false,
                            onPress,
                        }: {
    section: SectionOverview;
    isDesktop?: boolean;
    onPress: () => void;
}) {
    const formattedNumber = section.id.padStart(2, '0');

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Seção ${formattedNumber}: ${section.title}, período ${section.period}.`}
            style={({pressed, hovered}: any) => [
                styles.sectionRow,
                isDesktop && styles.sectionRowDesktop,
                hovered && styles.sectionRowHover,
                pressed && styles.sectionRowPressed,
            ]}
        >
            <View style={styles.sectionNumberBox}>
                <Text style={styles.sectionNumberText}>{formattedNumber}</Text>
            </View>

            <View style={styles.sectionTileDivider}/>

            {isDesktop ? (
                <View style={styles.sectionDesktopBody}>
                    <View style={styles.sectionDesktopPeriodBox}>
                        <Text style={styles.sectionPeriod}>{section.period}</Text>
                    </View>

                    <View style={styles.sectionTileDivider}/>

                    <Text style={styles.sectionTitleDesktop} numberOfLines={1}>
                        {section.title}
                    </Text>
                </View>
            ) : (
                <View style={styles.sectionMobileBody}>
                    <Text style={styles.sectionPeriod}>{section.period}</Text>
                    <Text style={styles.sectionTitleMobile}>{section.title}</Text>
                </View>
            )}

            <View style={styles.sectionArrowBox}>
                <ArrowRight size={18} color={Colors.accentPrimary}/>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    desktopWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    desktopSplitContainer: {
        flexDirection: 'row',
        width: '100%',
        maxWidth: Layout.maxContentWidth,
        alignItems: 'center',
        gap: Spacing.xxl,
    },
    desktopLeftPane: {
        flex: 0.45,
        justifyContent: 'center',
        paddingRight: Spacing.md,
    },
    verticalDivider: {
        width: 1,
        height: '78%',
        backgroundColor: Colors.borderSubtle,
    },
    desktopRightPane: {
        flex: 0.55,
        justifyContent: 'center',
    },
    desktopSectionHeader: {
        marginBottom: Spacing.md,
        gap: 2,
    },
    desktopSectionHeaderTitle: {
        ...Typography.h3,
        color: Colors.textPrimary,
    },
    desktopSectionHeaderSubtitle: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
    },
    desktopHeroTitle: {
        ...Typography.heroTitle,
        fontSize: 48,
        lineHeight: 54,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    heroAcronym: {
        ...Typography.h3,
        color: Colors.accentPrimary,
    },
    heroDescription: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginTop: Spacing.lg,
        marginBottom: Spacing.xl,
        maxWidth: 480,
    },
    ctaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mobileWrapper: {
        flex: 1,
    },
    mobileHeroFold: {
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    mobileHeroCenter: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 'auto',
    },
    mobileHeroTitle: {
        ...Typography.heroTitle,
        fontSize: 38,
        lineHeight: 44,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
        textAlign: 'center',
        maxWidth: 230,
    },
    mobileTextCenter: {
        textAlign: 'center',
    },
    mobileHeroDescription: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginTop: Spacing.md,
        marginBottom: Spacing.xl,
        textAlign: 'center',
    },
    mobileCtaContainer: {
        width: '100%',
        alignItems: 'center',
    },
    scrollCueContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    mobileSectionsArea: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.xxxl,
    },
    sectionListHeader: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
        gap: Spacing.xs,
    },
    sectionListTitle: {
        ...Typography.h3,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    sectionListSubtitle: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    sectionList: {
        gap: Spacing.sm + 4,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm + 4,
        backgroundColor: Colors.accentPrimary,
        minHeight: 54,
        paddingHorizontal: Spacing.xl,
        borderRadius: Radii.md,
        ...Shadows.card,
        ...Platform.select({
            web: {
                cursor: 'pointer' as any,
                transitionDuration: '150ms' as any,
            },
        }),
    },
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bgSurface,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        borderRadius: Radii.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        minHeight: 72,
        gap: Spacing.md,
        ...Platform.select({
            web: {
                cursor: 'pointer' as any,
                transitionDuration: '150ms' as any,
            },
        }),
    },
    sectionRowDesktop: {
        paddingHorizontal: Spacing.lg,
        minHeight: 68,
    },
    sectionRowHover: {
        backgroundColor: Colors.bgElevated,
        borderColor: Colors.accentPrimary,
    },
    sectionRowPressed: {
        opacity: 0.85,
    },
    sectionNumberBox: {
        width: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionNumberText: {
        ...Typography.h3,
        fontFamily: Typography.coordinate.fontFamily,
        color: Colors.accentPrimary,
    },
    sectionTileDivider: {
        width: 1,
        alignSelf: 'stretch',
        backgroundColor: Colors.borderSubtle,
    },
    sectionDesktopBody: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    sectionDesktopPeriodBox: {
        width: 118,
        justifyContent: 'center',
    },
    sectionMobileBody: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    sectionPeriod: {
        ...Typography.coordinate,
        color: Colors.textSecondary,
    },
    sectionTitleDesktop: {
        ...Typography.h3,
        flex: 1,
        color: Colors.textPrimary,
    },
    sectionTitleMobile: {
        ...Typography.h3,
        fontSize: 16,
        lineHeight: 22,
        color: Colors.textPrimary,
    },
    sectionArrowBox: {
        width: 36,
        height: 36,
        borderRadius: Radii.md,
        backgroundColor: Colors.bgPrimary,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonHover: {
        backgroundColor: Colors.accentPrimaryHover,
    },
    primaryButtonPressed: {
        opacity: 0.9,
        transform: [{scale: 0.99}],
    },
    primaryButtonText: {
        ...Typography.bodySemiBold,
        fontSize: 16,
        color: Colors.textInverse,
    },
});
