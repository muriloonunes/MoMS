import React from "react";
import {ScrollView, StyleSheet, Text, View} from "react-native";
import {Colors, Layout, Spacing} from "@/constants/theme";
import {StoryStep} from "@/data/museum-section";
import {GlossaryEntry} from "@/data/glossary";
import {RichGlossaryText} from "@/components/glossary-overlay";
import {SplitStepMeta} from "../types";
import {BrazilFlagIcon} from "../brazil-flag-icon";
import {sharedSlideStyles} from "../shared-styles";

/**
 * Slide narrativo para passos com `layout: "split"`.
 *
 * Lógica interna:
 * - Renderiza apenas a coluna/área de texto e um espaçador transparente (`imageSpacer`) com as mesmas
 *   proporções do painel de imagem renderizado pela [`SplitTrackLayer`](../split-track-layer.tsx).
 * - Utiliza `sequenceMeta` (`isFirstInTrack` e `isLastInTrack`) para exibir bordas horizontais divisórias
 *   somente ao entrar e ao sair de uma sequência de passos que compartilham a mesma imagem.
 * - No mobile, envolve o texto em um `ScrollView` interno com `nestedScrollEnabled` abaixo do `imageSpacer`
 *   para acomodar textos mais longos sem ultrapassar a altura da página.
 */
export function SplitStorySlide({
                                    step,
                                    sequenceMeta,
                                    pageHeight,
                                    isDesktop,
                                    onOpenGlossary,
                                    onLeaveGlossary,
                                }: {
    step: StoryStep;
    sequenceMeta?: SplitStepMeta;
    pageHeight: number;
    isDesktop: boolean;
    onOpenGlossary: (entry: GlossaryEntry, anchor?: { x: number; y: number }) => void;
    onLeaveGlossary: () => void;
}) {
    const imageOnLeft = step.imagePosition === "left";
    const isFirstInTrack = (sequenceMeta?.stepIndexInTrack ?? 0) === 0;
    const isLastInTrack =
        sequenceMeta
            ? sequenceMeta.stepIndexInTrack === sequenceMeta.totalInTrack - 1
            : true;

    const textBody = (
        <View style={[styles.splitTextInner, step.isBrazil && sharedSlideStyles.brazilHighlightBorder]}>
            {(step.year || (!step.title && step.isBrazil)) && (
                <View style={sharedSlideStyles.metaBadgeRow}>
                    {step.year && <Text style={sharedSlideStyles.stepYearText}>{step.year}</Text>}
                    {!step.title && step.isBrazil && <BrazilFlagIcon size={20}/>}
                </View>
            )}

            {step.title && (
                <View style={sharedSlideStyles.headingWithFlagRow}>
                    <Text style={[sharedSlideStyles.stepHeadingInline, !isDesktop && {fontSize: 24, lineHeight: 30}]}>
                        {step.title}
                    </Text>
                    {step.isBrazil && <BrazilFlagIcon size={22}/>}
                </View>
            )}

            <RichGlossaryText
                text={step.text}
                style={[
                    sharedSlideStyles.editorialBodyText,
                    isDesktop ? {fontSize: 18, lineHeight: 30} : {fontSize: 16, lineHeight: 25},
                ]}
                isDesktop={isDesktop}
                onSelectGlossary={onOpenGlossary}
                onLeaveGlossary={onLeaveGlossary}
            />
        </View>
    );

    // Espaçador invisível que reserva o lugar exato ocupado pela imagem na camada SplitTrackLayer
    const imageSpacer = (
        <View
            pointerEvents="none"
            style={[
                styles.splitImagePane,
                isDesktop
                    ? [styles.splitImagePaneDesktop, {height: pageHeight * 0.72, maxHeight: 680}]
                    : [styles.splitImagePaneMobile, {height: pageHeight * 0.42}],
            ]}
        />
    );

    if (!isDesktop) {
        return (
            <View
                style={[
                    styles.splitSlideRoot,
                    {
                        height: pageHeight,
                        paddingVertical: Spacing.md,
                        borderTopWidth: isFirstInTrack ? 1 : 0,
                        borderBottomWidth: isLastInTrack ? 1 : 0,
                    },
                ]}
            >
                <View style={styles.splitColMobile}>
                    {imageSpacer}
                    <ScrollView
                        style={styles.mobileSplitTextScroll}
                        contentContainerStyle={{paddingBottom: 44}}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                    >
                        {textBody}
                    </ScrollView>
                </View>
            </View>
        );
    }

    const textColumn = (
        <View style={[styles.splitTextPane, styles.splitTextPaneDesktop]}>
            {textBody}
        </View>
    );

    return (
        <View
            style={[
                styles.splitSlideRoot,
                {
                    minHeight: pageHeight,
                    borderTopWidth: isFirstInTrack ? 1 : 0,
                    borderBottomWidth: isLastInTrack ? 1 : 0,
                },
            ]}
        >
            <View style={[styles.splitSlideContainer, styles.splitRowDesktop]}>
                {imageOnLeft ? (
                    <>
                        {imageSpacer}
                        {textColumn}
                    </>
                ) : (
                    <>
                        {textColumn}
                        {imageSpacer}
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    splitSlideRoot: {
        width: "100%",
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 48,
        borderColor: Colors.borderSubtle,
    },
    splitSlideContainer: {
        width: "100%",
        maxWidth: Layout.maxContentWidth,
        flex: 1,
    },
    splitRowDesktop: {
        flexDirection: "row",
        alignItems: "center",
    },
    splitColMobile: {
        width: "100%",
        flex: 1,
        flexDirection: "column",
        paddingHorizontal: Spacing.md,
        paddingTop: 36,
        gap: Spacing.lg,
    },
    mobileSplitTextScroll: {
        flex: 1,
    },
    splitTextPane: {
        justifyContent: "center",
    },
    splitTextPaneDesktop: {
        flex: 0.48,
        paddingHorizontal: Spacing.xxl,
        alignItems: "center",
    },
    splitTextInner: {
        maxWidth: 460,
        width: "100%",
    },
    splitImagePane: {
        justifyContent: "center",
    },
    splitImagePaneDesktop: {
        flex: 0.52,
        paddingHorizontal: Spacing.lg,
    },
    splitImagePaneMobile: {
        width: "100%",
    },
});
