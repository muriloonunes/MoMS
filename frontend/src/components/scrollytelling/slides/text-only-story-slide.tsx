import React from "react";
import {ScrollView, StyleSheet, Text, View} from "react-native";
import {Colors, Spacing} from "@/constants/theme";
import {StoryStep} from "@/data/museum-section";
import {GlossaryEntry} from "@/data/glossary";
import {RichGlossaryText} from "@/components/glossary-overlay";
import {BrazilFlagIcon} from "../brazil-flag-icon";
import {sharedSlideStyles} from "../shared-styles";

/**
 * Slide narrativo para passos com `layout: "text-only"`.
 *
 * - Apresenta uma página com fundo sólido que cobre as camadas de imagem de fundo,
 *   servindo como respiro editorial centralizado (máximo de 620px de largura) entre sequências visuais.
 * - Suporta destaque para marcos brasileiros (`isBrazil`), ano, título e termos interativos do glossário.
 */
export function TextOnlyStorySlide({
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
                styles.textOnlySlideRoot,
                isDesktop ? {minHeight: pageHeight} : {height: pageHeight, paddingVertical: Spacing.xl},
            ]}
        >
            <ScrollView
                style={{width: "100%"}}
                contentContainerStyle={styles.textOnlyScrollContent}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
            >
                <View
                    style={[
                        styles.textOnlyContainer,
                        step.isBrazil && sharedSlideStyles.brazilHighlightBorder,
                    ]}
                >
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
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    textOnlySlideRoot: {
        width: "100%",
        backgroundColor: Colors.bgPrimary,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.xl,
        paddingVertical: 72,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderSubtle,
    },
    textOnlyScrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 32,
    },
    textOnlyContainer: {
        maxWidth: 620,
        width: "100%",
    },
});
