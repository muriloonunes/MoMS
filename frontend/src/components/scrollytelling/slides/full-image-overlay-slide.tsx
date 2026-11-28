import React from "react";
import {ScrollView, StyleSheet, Text, View} from "react-native";
import {Info} from "lucide-react-native";
import {Colors, Radii, Spacing, Typography} from "@/constants/theme";
import {StoryStep} from "@/data/museum-section";
import {GlossaryEntry} from "@/data/glossary";
import {RichGlossaryText} from "@/components/glossary-overlay";
import {BrazilFlagIcon} from "../brazil-flag-icon";
import {sharedSlideStyles} from "../shared-styles";

/**
 * Slide transparente de sobreposição para passos com `layout: "full-image"`.
 *
 * Lógica interna:
 * - A imagem em si não é renderizada aqui, mas sim na camada fixa [`FullImageTrackLayer`](../full-image-track-layer.tsx) ao fundo.
 * - No topo esquerdo (`fullImageTopCredit`), exibe uma pílula translúcida com o crédito/título da obra.
 * - Na parte inferior (`fullImageBottomOverlay`), posiciona o texto narrativo diretamente sobre o gradiente escuro (scrim)
 *   da imagem, com sombra tipográfica para máxima legibilidade sem bloquear a fotografia com caixas opacas.
 */
export function FullImageOverlaySlide({
                                          step,
                                          pageHeight,
                                          isDesktop,
                                          onOpenGlossary,
                                          onLeaveGlossary,
                                      }: {
    step: StoryStep;
    pageHeight: number;
    isDesktop: boolean;
    onOpenGlossary: (entry: GlossaryEntry, anchor?: { x: number; y: number }) => void;
    onLeaveGlossary: () => void;
}) {
    return (
        <View
            style={[
                styles.fullImageSlideRoot,
                {height: pageHeight},
                !isDesktop && styles.fullImageSlideRootMobile,
            ]}
        >
            <View style={[styles.fullImageTopCredit, !isDesktop && styles.fullImageTopCreditMobile]}>
                {(step.imageCaption || step.title) && (
                    <View style={styles.fullImageCreditRow}>
                        <Info size={14} color={Colors.textPrimary}/>
                        <Text style={styles.fullImageCreditText} numberOfLines={1}>
                            {step.imageCaption ?? step.title}
                        </Text>
                        {step.isBrazil && <BrazilFlagIcon size={18}/>}
                    </View>
                )}
            </View>

            <View
                style={[
                    styles.fullImageBottomOverlay,
                    isDesktop
                        ? styles.fullImageBottomOverlayDesktop
                        : styles.fullImageBottomOverlayMobile,
                ]}
            >
                <View
                    style={[
                        styles.fullImageTextBackdrop,
                        !isDesktop && {maxHeight: pageHeight * 0.44},
                        step.isBrazil && sharedSlideStyles.brazilHighlightBorder,
                    ]}
                >
                    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                        {(step.year || step.isBrazil) && (
                            <View style={sharedSlideStyles.metaBadgeRow}>
                                {step.year && <Text style={sharedSlideStyles.stepYearText}>{step.year}</Text>}
                                {step.isBrazil && <BrazilFlagIcon size={20}/>}
                            </View>
                        )}

                        <RichGlossaryText
                            text={step.text}
                            style={[
                                styles.fullImageOverlayBodyText,
                                isDesktop && styles.fullImageOverlayBodyTextDesktop,
                            ]}
                            isDesktop={isDesktop}
                            onSelectGlossary={onOpenGlossary}
                            onLeaveGlossary={onLeaveGlossary}
                        />
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    fullImageSlideRoot: {
        width: "100%",
        justifyContent: "space-between",
        paddingTop: 24,
        paddingBottom: 72,
    },
    fullImageSlideRootMobile: {
        paddingTop: 16,
    },
    fullImageTopCredit: {
        paddingHorizontal: Spacing.lg,
    },
    fullImageTopCreditMobile: {
        paddingHorizontal: Spacing.md,
    },
    fullImageCreditRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        backgroundColor: "rgba(20, 17, 15, 0.55)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: Radii.full,
    },
    fullImageCreditText: {
        ...Typography.bodySmall,
        color: Colors.textPrimary,
        fontSize: 13,
        fontFamily: Typography.bodySemiBold.fontFamily,
    },
    fullImageBottomOverlay: {
        width: "100%",
        alignItems: "center",
    },
    fullImageBottomOverlayDesktop: {
        paddingHorizontal: Spacing.xxxl,
    },
    fullImageBottomOverlayMobile: {
        paddingHorizontal: Spacing.lg,
    },
    fullImageTextBackdrop: {
        maxWidth: 680,
        width: "100%",
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.xs,
    },
    fullImageOverlayBodyText: {
        ...Typography.body,
        fontSize: 18,
        lineHeight: 26,
        color: "#FFFFFF",
        textShadowColor: "rgba(0, 0, 0, 0.85)",
        textShadowOffset: {width: 0, height: 1},
        textShadowRadius: 8,
    },
    fullImageOverlayBodyTextDesktop: {
        fontSize: 21,
        lineHeight: 32,
    },
});
