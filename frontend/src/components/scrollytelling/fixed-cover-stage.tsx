import React from "react";
import {StyleSheet, Text, View} from "react-native";
import {Image} from "expo-image";
import Animated, {Extrapolation, interpolate, SharedValue, useAnimatedStyle} from "react-native-reanimated";
import {Colors, Spacing, Typography} from "@/constants/theme";
import {SectionData} from "@/data/museum-section";
import {hasValidImage} from "./utils";
import {sharedSlideStyles} from "./shared-styles";

/**
 * Camada fixa de abertura (capa) da seção histórica.
 *
 * Lógica interna de animação baseada no scroll (`scrollY`):
 * - Pode ocupar 1 página (apenas `introText`) ou 2 páginas (`introText` + `extraText`).
 * - **Zoom da imagem de fundo (`imageAnimStyle`)**: Aplica um leve zoom progressivo de `1x` até `1.18x`
 *   enquanto o usuário rola pela capa, ocultando a camada (`opacity: 0`) assim que a capa sai totalmente de vista
 *   para poupar processamento gráfico.
 * - **Escurecimento dinâmico (`scrimAnimStyle`)**: Se houver `extraText` (2ª página de capa), escurece o véu
 *   sobre a imagem de `0.52` para `0.78` para aumentar o contraste de leitura.
 * - **Troca de textos (`introTextAnimStyle` e `extraTextAnimStyle`)**: Quando há 2 páginas de capa, o `introText`
 *   sobe e desaparece nos primeiros 38% da rolagem, enquanto o `extraText` surge no mesmo lugar entre 35% e 72%
 *   da primeira página e desaparece ao avançar para o primeiro passo narrativo.
 * - **Saída do título (`titleAnimStyle`)**: O título principal permanece fixo durante a troca entre `introText`
 *   e `extraText`, subindo e desaparecendo apenas ao final da última página de capa (`coverEndScroll`).
 */
export function FixedCoverStage({
                                    section,
                                    coverPagesCount,
                                    pageHeight,
                                    isDesktop,
                                    scrollY,
                                }: {
    section: SectionData;
    coverPagesCount: number;
    pageHeight: number;
    isDesktop: boolean;
    scrollY: SharedValue<number>;
}) {
    const validCover = hasValidImage(section.coverImage);
    const hasExtra = coverPagesCount === 2;
    const coverEndScroll = (coverPagesCount - 1) * pageHeight;

    // Zoom gradual na imagem de capa e corte de visibilidade após sair da área da capa
    const imageAnimStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            scrollY.value,
            [0, coverEndScroll + pageHeight],
            [1, 1.18],
            Extrapolation.CLAMP
        );

        const opacity = scrollY.value > coverEndScroll + pageHeight ? 0 : 1;

        return {
            opacity,
            transform: [{scale}],
        };
    });

    // Véu escuro sobre a imagem de capa (intensifica na segunda página de introdução, se existir)
    const scrimAnimStyle = useAnimatedStyle(() => {
        const bgOpacity = hasExtra
            ? interpolate(
                scrollY.value,
                [0, pageHeight * 0.7],
                [0.52, 0.78],
                Extrapolation.CLAMP
            )
            : 0.58;
        return {backgroundColor: `rgba(20, 17, 15, ${bgOpacity})`};
    });

    // Animação de saída do primeiro parágrafo introdutório
    const introTextAnimStyle = useAnimatedStyle(() => {
        if (!hasExtra) {
            const opacity = interpolate(
                scrollY.value,
                [0, pageHeight * 0.65],
                [1, 0],
                Extrapolation.CLAMP
            );
            return {opacity, transform: [{translateY: 0}]};
        }

        const opacity = interpolate(
            scrollY.value,
            [0, pageHeight * 0.38],
            [1, 0],
            Extrapolation.CLAMP
        );
        const translateY = interpolate(
            scrollY.value,
            [0, pageHeight * 0.38],
            [0, -18],
            Extrapolation.CLAMP
        );
        return {opacity, transform: [{translateY}]};
    });

    // Animação de entrada e saída do segundo parágrafo introdutório (extraText)
    const extraTextAnimStyle = useAnimatedStyle(() => {
        if (!hasExtra) return {opacity: 0};

        const opacity = interpolate(
            scrollY.value,
            [pageHeight * 0.35, pageHeight * 0.72, pageHeight * 1.45],
            [0, 1, 0],
            Extrapolation.CLAMP
        );
        const translateY = interpolate(
            scrollY.value,
            [pageHeight * 0.35, pageHeight * 0.72],
            [18, 0],
            Extrapolation.CLAMP
        );
        return {opacity, transform: [{translateY}]};
    });

    // Animação de saída do título da seção ao deixar a capa rumo ao primeiro passo
    const titleAnimStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [coverEndScroll, coverEndScroll + pageHeight * 0.65],
            [1, 0],
            Extrapolation.CLAMP
        );
        const translateY = interpolate(
            scrollY.value,
            [coverEndScroll, coverEndScroll + pageHeight * 0.65],
            [0, -24],
            Extrapolation.CLAMP
        );
        return {opacity, transform: [{translateY}]};
    });

    return (
        <View style={[sharedSlideStyles.fullBleedLayer, !validCover && {backgroundColor: Colors.bgPrimary}]}>
            {validCover && (
                <Animated.View style={[sharedSlideStyles.fullBleedLayer, imageAnimStyle]}>
                    <Image
                        source={section.coverImage as any}
                        style={sharedSlideStyles.fullBleedImage}
                        contentFit="cover"
                    />
                    <Animated.View style={[sharedSlideStyles.fullBleedLayer, scrimAnimStyle]}/>
                </Animated.View>
            )}

            <View style={styles.coverCenteredContainer}>
                <View style={styles.coverContent}>
                    <Animated.View style={titleAnimStyle}>
                        <Text
                            accessibilityRole="header"
                            style={[
                                styles.coverTitle,
                                isDesktop ? {fontSize: 54, lineHeight: 60} : {fontSize: 34, lineHeight: 40},
                            ]}
                        >
                            {section.title}
                        </Text>
                    </Animated.View>

                    <View style={styles.coverTextSwapBox}>
                        <Animated.View style={introTextAnimStyle}>
                            <Text style={[styles.coverIntroText, !isDesktop && {fontSize: 16, lineHeight: 24}]}>
                                {section.introText ||
                                    "Esta seção está em processo de curadoria pela equipe de pesquisa do MoMS."}
                            </Text>
                        </Animated.View>

                        {hasExtra && (
                            <Animated.View style={[styles.coverExtraOverlay, extraTextAnimStyle]}>
                                <Text style={[styles.coverIntroText, !isDesktop && {fontSize: 16, lineHeight: 24}]}>
                                    {section.extraText}
                                </Text>
                            </Animated.View>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    coverCenteredContainer: {
        ...StyleSheet.absoluteFill,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.xl,
    },
    coverContent: {
        maxWidth: 680,
        width: "100%",
        alignItems: "center",
    },
    coverTitle: {
        ...Typography.heroTitle,
        color: Colors.textPrimary,
        textAlign: "center",
        marginBottom: Spacing.lg,
    },
    coverTextSwapBox: {
        position: "relative",
        width: "100%",
        minHeight: 110,
        alignItems: "center",
        justifyContent: "center",
    },
    coverExtraOverlay: {
        ...StyleSheet.absoluteFill,
        alignItems: "center",
        justifyContent: "center",
    },
    coverIntroText: {
        ...Typography.body,
        fontSize: 18,
        lineHeight: 28,
        color: Colors.textPrimary,
        textAlign: "center",
    },
});
