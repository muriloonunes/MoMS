import React, {useMemo, useState} from "react";
import {Linking, Platform, Pressable, StyleSheet, Text, View} from "react-native";
import {ArrowLeft, ArrowRight, BookOpen, ChevronDown, ChevronUp, ExternalLink, Home} from "lucide-react-native";
import {Colors, Radii, Spacing, Typography} from "@/constants/theme";
import {SECOES, SectionData, SectionSource} from "@/data/museum-section";
import {normalizeSource} from "../utils";

/**
 * Rodapé editorial exibido ao final do scroll de cada seção histórica.
 *
 * Lógica interna:
 * - **Desktop (`footerDesktopRow`)**: Layout horizontal composto por 3 elementos alinhados:
 *   1. Botão quadrado com ícone `Home` para voltar ao início;
 *   2. Faixa informativa central (`nextBanner`) anunciando a próxima seção ou a conclusão da jornada;
 *   3. Botão quadrado de destaque com ícone `ArrowRight` para avançar diretamente à próxima seção.
 * - **Mobile (`footerMobileCol`)**: Layout em coluna onde a faixa da próxima parada fica no topo e os botões
 *   com rótulos textuais (`Início`, seção anterior e `Próxima seção`) ficam alinhados logo abaixo.
 * - **Fontes bibliográficas (`footerSourcesSection`)**: Painel retrátil (acordeão) que lista todas as referências
 *   da seção normalizadas por [`normalizeSource`](../utils.ts#L60), abrindo o link externo ao clicar.
 */
export function SectionFooterSlide({
                                       isDesktop,
                                       sources,
                                       nextSectionId,
                                       prevSectionId,
                                       onBackHome,
                                       onSelectSection,
                                   }: {
    isDesktop: boolean;
    sources?: SectionSource[];
    nextSectionId: SectionData["sectionId"] | null;
    prevSectionId: SectionData["sectionId"] | null;
    onBackHome: () => void;
    onSelectSection?: (id: SectionData["sectionId"]) => void;
}) {
    const [sourcesExpanded, setSourcesExpanded] = useState(false);
    const nextSection = nextSectionId ? SECOES[nextSectionId] : null;
    const prevSection = prevSectionId ? SECOES[prevSectionId] : null;
    const normalizedSources = useMemo(
        () => (sources ?? []).map(normalizeSource),
        [sources]
    );

    const handleOpenUrl = (url: string) => {
        Linking.openURL(url).catch(() => {
        });
    };

    const nextBanner = nextSection ? (
        <View style={styles.footerNextFeatureCard}>
            <View style={styles.footerNextTextCol}>
                <View style={styles.footerNextKickerRow}>
                    <Text style={styles.footerNextKicker}>PRÓXIMA PARADA</Text>
                    {nextSection.period ? (
                        <Text style={styles.footerNextPeriod}>
                            • {nextSection.period}
                        </Text>
                    ) : null}
                </View>
                <Text
                    style={[
                        styles.footerNextTitle,
                        !isDesktop && styles.footerNextTitleMobile,
                    ]}
                >
                    {nextSection.code}: {nextSection.title}
                </Text>
            </View>
        </View>
    ) : (
        <View style={styles.footerNextFeatureCard}>
            <View style={styles.footerNextTextCol}>
                <Text style={styles.footerNextKicker}>JORNADA CONCLUÍDA</Text>
                <Text
                    style={[
                        styles.footerNextTitle,
                        !isDesktop && styles.footerNextTitleMobile,
                    ]}
                >
                    Você percorreu todas as eras do acervo
                </Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.footerSlide, !isDesktop && styles.footerSlideMobile]}>
            <View style={styles.footerContainer}>
                {isDesktop ? (
                    <View style={styles.footerDesktopRow}>
                        <Pressable
                            onPress={onBackHome}
                            accessibilityRole="button"
                            accessibilityLabel="Voltar para o início"
                            style={({hovered, pressed}: any) => [
                                styles.footerDesktopIconBtn,
                                hovered && styles.footerDesktopIconBtnHover,
                                pressed && {opacity: 0.8},
                            ]}
                        >
                            <Home size={20} color={Colors.textPrimary}/>
                        </Pressable>

                        {nextBanner}

                        {nextSection && onSelectSection && (
                            <Pressable
                                onPress={() => onSelectSection(nextSection.sectionId)}
                                accessibilityRole="button"
                                accessibilityLabel={`Avançar para ${nextSection.code}`}
                                style={({hovered, pressed}: any) => [
                                    styles.footerDesktopNextIconBtn,
                                    hovered && styles.footerDesktopNextIconBtnHover,
                                    pressed && {opacity: 0.9},
                                ]}
                            >
                                <ArrowRight size={22} color={Colors.textInverse}/>
                            </Pressable>
                        )}
                    </View>
                ) : (
                    <View style={styles.footerMobileCol}>
                        {nextBanner}

                        <View style={styles.footerMobileSecondaryRow}>
                            <Pressable
                                onPress={onBackHome}
                                style={({hovered, pressed}: any) => [
                                    styles.footerMobileActionBtn,
                                    hovered && {borderColor: Colors.accentPrimary},
                                    pressed && {opacity: 0.8},
                                ]}
                            >
                                <Home size={16} color={Colors.textSecondary}/>
                                <Text style={styles.footerMobileActionText} numberOfLines={1}>
                                    Início
                                </Text>
                            </Pressable>

                            {prevSection && onSelectSection && (
                                <Pressable
                                    onPress={() => onSelectSection(prevSection.sectionId)}
                                    style={({hovered, pressed}: any) => [
                                        styles.footerMobileActionBtn,
                                        hovered && {borderColor: Colors.accentPrimary},
                                        pressed && {opacity: 0.8},
                                    ]}
                                >
                                    <ArrowLeft size={16} color={Colors.textSecondary}/>
                                    <Text style={styles.footerMobileActionText} numberOfLines={1}>
                                        {prevSection.code}
                                    </Text>
                                </Pressable>
                            )}

                            {nextSection && onSelectSection && (
                                <Pressable
                                    onPress={() => onSelectSection(nextSection.sectionId)}
                                    style={({hovered, pressed}: any) => [
                                        styles.footerMobilePrimaryBtn,
                                        hovered && {backgroundColor: Colors.accentPrimaryHover},
                                        pressed && {opacity: 0.9},
                                    ]}
                                >
                                    <Text style={styles.footerMobilePrimaryBtnText} numberOfLines={1}>
                                        Próxima seção
                                    </Text>
                                    <ArrowRight size={16} color={Colors.textInverse}/>
                                </Pressable>
                            )}
                        </View>
                    </View>
                )}

                {normalizedSources.length > 0 && (
                    <View style={styles.footerSourcesSection}>
                        <Pressable
                            onPress={() => setSourcesExpanded((prev) => !prev)}
                            accessibilityRole="button"
                            accessibilityLabel="Alternar exibição de fontes e referências desta seção"
                            style={({hovered, pressed}: any) => [
                                styles.footerSourcesToggleBtn,
                                hovered && styles.footerSourcesToggleBtnHover,
                                pressed && {opacity: 0.85},
                            ]}
                        >
                            <View style={styles.footerSourcesToggleLeft}>
                                <BookOpen size={14} color={Colors.accentPrimary}/>
                                <Text style={styles.footerSourcesToggleText}>
                                    FONTES DESTA SEÇÃO ({normalizedSources.length})
                                </Text>
                            </View>
                            {sourcesExpanded ? (
                                <ChevronUp size={15} color={Colors.textSecondary}/>
                            ) : (
                                <ChevronDown size={15} color={Colors.textSecondary}/>
                            )}
                        </Pressable>

                        {sourcesExpanded && (
                            <View style={styles.footerSourcesList}>
                                {normalizedSources.map((item, idx) => {
                                    const indexCode = String(idx + 1).padStart(2, "0");
                                    return (
                                        <Pressable
                                            key={`${item.url}-${idx}`}
                                            onPress={() => handleOpenUrl(item.url)}
                                            accessibilityRole="link"
                                            accessibilityLabel={`Abrir fonte ${item.label}`}
                                            style={({hovered, pressed}: any) => [
                                                styles.footerSourceItem,
                                                hovered && styles.footerSourceItemHover,
                                                pressed && {opacity: 0.8},
                                            ]}
                                        >
                                            <Text style={styles.footerSourceIndex}>[{indexCode}]</Text>
                                            <View style={styles.footerSourceTextCol}>
                                                <Text style={styles.footerSourceLabel} numberOfLines={1}>
                                                    {item.label}
                                                </Text>
                                                <Text style={styles.footerSourceUrl} numberOfLines={1}>
                                                    {item.url}
                                                </Text>
                                            </View>
                                            <ExternalLink size={14} color={Colors.textSecondary}/>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    footerSlide: {
        width: "100%",
        backgroundColor: Colors.bgPrimary,
        borderTopWidth: 1,
        borderTopColor: Colors.borderSubtle,
        alignItems: "center",
        paddingVertical: 44,
        paddingHorizontal: Spacing.xl,
    },
    footerSlideMobile: {
        paddingVertical: 28,
        paddingHorizontal: Spacing.md,
        paddingBottom: 68,
    },
    footerContainer: {
        width: "100%",
        maxWidth: 880,
    },
    footerDesktopRow: {
        flexDirection: "row",
        alignItems: "stretch",
        gap: Spacing.md,
    },
    footerDesktopIconBtn: {
        width: 68,
        borderRadius: Radii.md,
        backgroundColor: Colors.bgSurface,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({web: {cursor: "pointer" as any}}),
    },
    footerDesktopIconBtnHover: {
        borderColor: Colors.accentPrimary,
        backgroundColor: Colors.bgElevated,
    },
    footerDesktopNextIconBtn: {
        width: 68,
        borderRadius: Radii.md,
        backgroundColor: Colors.accentPrimary,
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({web: {cursor: "pointer" as any}}),
    },
    footerDesktopNextIconBtnHover: {
        backgroundColor: Colors.accentPrimaryHover,
    },
    footerMobileCol: {
        flexDirection: "column",
        gap: Spacing.sm,
    },
    footerMobileSecondaryRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
    },
    footerMobileActionBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: Colors.bgSurface,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        borderRadius: Radii.md,
        paddingVertical: 12,
        paddingHorizontal: Spacing.md,
        ...Platform.select({web: {cursor: "pointer" as any}}),
    },
    footerMobileActionText: {
        ...Typography.bodySemiBold,
        fontSize: 13,
        color: Colors.textPrimary,
    },
    footerMobilePrimaryBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: Colors.accentPrimary,
        borderRadius: Radii.md,
        paddingVertical: 12,
        paddingHorizontal: Spacing.md,
        ...Platform.select({web: {cursor: "pointer" as any}}),
    },
    footerMobilePrimaryBtnText: {
        ...Typography.bodySemiBold,
        fontSize: 13,
        color: Colors.textInverse,
    },
    footerNextFeatureCard: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: Spacing.md,
        backgroundColor: Colors.bgSurface,
        borderWidth: 1,
        borderColor: Colors.borderStrong,
        borderLeftWidth: 3,
        borderLeftColor: Colors.accentPrimary,
        borderRadius: Radii.md,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.lg,
    },
    footerNextTextCol: {
        flex: 1,
        gap: 4,
    },
    footerNextKickerRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 6,
    },
    footerNextKicker: {
        ...Typography.badge,
        color: Colors.accentPrimary,
    },
    footerNextPeriod: {
        ...Typography.coordinate,
        fontSize: 12,
        color: Colors.textSecondary,
    },
    footerNextTitle: {
        ...Typography.h2,
        color: Colors.textPrimary,
    },
    footerNextTitleMobile: {
        fontSize: 19,
        lineHeight: 25,
    },
    footerSourcesSection: {
        marginTop: Spacing.md,
        width: "100%",
    },
    footerSourcesToggleBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: Spacing.md,
        borderRadius: Radii.sm,
        backgroundColor: Colors.bgSurface,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        ...Platform.select({web: {cursor: "pointer" as any}}),
    },
    footerSourcesToggleBtnHover: {
        borderColor: Colors.borderStrong,
        backgroundColor: Colors.bgElevated,
    },
    footerSourcesToggleLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs + 2,
    },
    footerSourcesToggleText: {
        ...Typography.badge,
        color: Colors.textSecondary,
    },
    footerSourcesList: {
        marginTop: Spacing.xs,
        borderRadius: Radii.sm,
        backgroundColor: Colors.bgSurface,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        overflow: "hidden",
    },
    footerSourceItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        paddingVertical: 10,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderSubtle,
        ...Platform.select({web: {cursor: "pointer" as any}}),
    },
    footerSourceItemHover: {
        backgroundColor: Colors.bgElevated,
    },
    footerSourceIndex: {
        ...Typography.coordinate,
        fontSize: 12,
        color: Colors.accentPrimary,
    },
    footerSourceTextCol: {
        flex: 1,
        gap: 1,
    },
    footerSourceLabel: {
        ...Typography.bodySemiBold,
        fontSize: 13,
        lineHeight: 18,
        color: Colors.textPrimary,
    },
    footerSourceUrl: {
        ...Typography.bodySmall,
        fontSize: 11,
        lineHeight: 15,
        color: Colors.textMuted,
    },
});
