import React, {useCallback, useMemo, useState} from "react";
import {StyleSheet, Text, View} from "react-native";
import {Image} from "expo-image";
import Animated, {SharedValue} from "react-native-reanimated";
import {ImageIcon, Info} from "lucide-react-native";
import Svg, {Defs, LinearGradient, Rect, Stop} from "react-native-svg";
import {Colors, Layout, Radii, Spacing, Typography} from "@/constants/theme";
import {SplitTrack} from "./types";
import {hasValidImage} from "./utils";
import {TrackKeyframeImage} from "./track-keyframe-image";
import {sharedSlideStyles} from "./shared-styles";
import {useTrackCameraAnimation} from "./use-track-camera-animation";

/**
 * Camada fixa que renderiza o painel de imagem dos passos com `layout: "split"`.
 *
 * Lógica interna:
 * 1. **Moldura adaptativa sem sobras (`frameWidth` e `frameHeight`)**:
 *    - Mede automaticamente a proporção natural da imagem no evento `onLoad` (`handleImageLoad`),
 *      ou utiliza `track.imageAspectRatio` caso tenha sido definido manualmente.
 *    - Ajusta as dimensões exatas da moldura (`splitImageFrame`) para abraçar a imagem sem barras vazias
 *      laterais ou superiores, respeitando os limites máximos do painel (`maxPaneWidth` e `maxPaneHeight`).
 * 2. **Animação compartilhada de trilha e câmera ([`useTrackCameraAnimation`](./use-track-camera-animation.ts))**:
 *    - Reutiliza o mesmo hook de pinning e interpolação de câmera de `FullImageTrackLayer`, passando
 *      `frameWidth` e `frameHeight` como dimensões de referência para o cálculo de zoom e foco.
 * 3. **Comportamento Desktop vs Mobile**:
 *    - **Desktop**: Renderizada na camada de fundo (atrás do `ScrollView`), ocupando a coluna esquerda ou direita
 *      (`52%` da largura máxima) enquanto o texto rola na coluna oposta (`48%`).
 *    - **Mobile**: Renderizada na camada superior (acima do `ScrollView`, com `pointerEvents="none"`),
 *      utilizando um escudo opaco no topo (`splitMobileTopShield`) seguido de um gradiente SVG de 28px
 *      (`splitMobileBottomFade`). Assim, quando o texto rola para cima, ele desaparece suavemente por baixo
 *      da imagem sem jamais invadir ou cobrir a fotografia.
 */
export function SplitTrackLayer({
                                    track,
                                    pageHeight,
                                    stageWidth,
                                    isDesktop,
                                    scrollY,
                                }: {
    track: SplitTrack;
    pageHeight: number;
    stageWidth: number;
    isDesktop: boolean;
    scrollY: SharedValue<number>;
}) {
    const [naturalAspectRatio, setNaturalAspectRatio] = useState<number | undefined>(
        track.imageAspectRatio
    );

    // Limites máximos disponíveis para a coluna/painel de imagem
    const maxPaneWidth = isDesktop
        ? Math.min(stageWidth, Layout.maxContentWidth) * 0.52 - Spacing.lg * 2
        : stageWidth - Spacing.md * 2;
    const maxPaneHeight = isDesktop
        ? Math.min(pageHeight * 0.72, 680)
        : pageHeight * 0.40;

    const effectiveRatio = track.imageAspectRatio ?? naturalAspectRatio;

    // Calcula o tamanho exato da moldura para envolver a imagem mantendo sua proporção real
    const {frameWidth, frameHeight} = useMemo(() => {
        if (track.imageFit === "cover" && !track.imageAspectRatio) {
            return {frameWidth: maxPaneWidth, frameHeight: maxPaneHeight};
        }
        if (!effectiveRatio || effectiveRatio <= 0) {
            return {frameWidth: maxPaneWidth, frameHeight: maxPaneHeight};
        }
        let w = maxPaneWidth;
        let h = w / effectiveRatio;
        if (h > maxPaneHeight) {
            h = maxPaneHeight;
            w = h * effectiveRatio;
        }
        return {frameWidth: w, frameHeight: h};
    }, [track.imageFit, track.imageAspectRatio, effectiveRatio, maxPaneWidth, maxPaneHeight]);

    // Captura as dimensões intrínsecas da imagem assim que ela é carregada
    const handleImageLoad = useCallback((event: any) => {
        const w = event?.source?.width;
        const h = event?.source?.height;
        if (w && h && h > 0) {
            setNaturalAspectRatio(w / h);
        }
    }, []);

    const {
        hasDistinctImages,
        containerSlideStyle,
        activeKeyframeIndex,
        animatedImageStyle,
    } = useTrackCameraAnimation({
        keyframes: track.keyframes,
        pageHeight,
        scrollY,
        refWidth: frameWidth,
        refHeight: frameHeight,
        durationMs: 650,
    });

    const imageOnLeft = track.imagePosition === "left";
    const firstKf = track.keyframes[0];
    const validFirstImage = hasValidImage(firstKf?.image);
    const caption = track.keyframes.find((kf) => kf.imageCaption)?.imageCaption;

    const imagePane = (
        <View
            style={[
                styles.splitImagePane,
                isDesktop
                    ? [styles.splitImagePaneDesktop, {height: pageHeight * 0.72, maxHeight: 680}]
                    : [styles.splitImagePaneMobile, {height: pageHeight * 0.42}],
            ]}
        >
            <View style={{width: frameWidth, alignSelf: "center"}}>
                <View
                    style={[
                        styles.splitImageFrame,
                        {width: frameWidth, height: frameHeight},
                    ]}
                >
                    <Animated.View style={[sharedSlideStyles.fullBleedLayer, animatedImageStyle]}>
                        {validFirstImage ? (
                            hasDistinctImages ? (
                                track.keyframes.map((kf, idx) =>
                                    hasValidImage(kf.image) ? (
                                        <TrackKeyframeImage
                                            key={`${track.id}-split-kf-${idx}`}
                                            image={kf.image!}
                                            index={idx}
                                            activeIndex={activeKeyframeIndex}
                                            contentFit={track.imageFit}
                                            style={styles.splitImage}
                                            onLoad={idx === 0 ? handleImageLoad : undefined}
                                        />
                                    ) : null
                                )
                            ) : (
                                <Image
                                    source={firstKf.image as any}
                                    style={styles.splitImage}
                                    contentFit={track.imageFit}
                                    onLoad={handleImageLoad}
                                />
                            )
                        ) : (
                            <View style={styles.splitImagePlaceholder}>
                                <ImageIcon size={32} color={Colors.textMuted}/>
                                <Text style={styles.placeholderCaptionText}>
                                    {caption ?? firstKf?.title ?? "Registro Fotográfico"}
                                </Text>
                            </View>
                        )}
                    </Animated.View>
                </View>
                {caption && (
                    <View style={styles.captionRow}>
                        <Info size={12} color={Colors.textMuted}/>
                        <Text style={styles.captionText} numberOfLines={1}>
                            {caption}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <Animated.View
            style={[
                isDesktop ? styles.splitTrackBackdrop : styles.splitTrackBackdropMobile,
                containerSlideStyle,
            ]}
        >
            {!isDesktop ? (
                <View style={styles.splitColMobileOverlay}>
                    <View style={styles.splitMobileTopShield}>
                        {imagePane}
                    </View>
                    <View style={styles.splitMobileBottomFade} pointerEvents="none">
                        <Svg width="100%" height="100%" preserveAspectRatio="none">
                            <Defs>
                                <LinearGradient id={`split-mask-${track.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <Stop offset="0" stopColor={Colors.bgPrimary} stopOpacity="1"/>
                                    <Stop offset="1" stopColor={Colors.bgPrimary} stopOpacity="0"/>
                                </LinearGradient>
                            </Defs>
                            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#split-mask-${track.id})`}/>
                        </Svg>
                    </View>
                </View>
            ) : (
                <View style={[styles.splitSlideContainer, styles.splitRowDesktop]}>
                    {imageOnLeft ? (
                        <>
                            {imagePane}
                            <View style={styles.splitTextPaneDesktop}/>
                        </>
                    ) : (
                        <>
                            <View style={styles.splitTextPaneDesktop}/>
                            {imagePane}
                        </>
                    )}
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    splitTrackBackdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: Colors.bgPrimary,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 48,
        overflow: "hidden",
    },
    splitTrackBackdropMobile: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "transparent",
        overflow: "hidden",
    },
    splitColMobileOverlay: {
        width: "100%",
        flexDirection: "column",
    },
    splitMobileTopShield: {
        width: "100%",
        backgroundColor: Colors.bgPrimary,
        paddingHorizontal: Spacing.md,
        paddingTop: 52,
        paddingBottom: Spacing.xs,
    },
    splitMobileBottomFade: {
        width: "100%",
        height: 28,
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
    splitTextPaneDesktop: {
        flex: 0.48,
        paddingHorizontal: Spacing.xxl,
        alignItems: "center",
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
    splitImageFrame: {
        width: "100%",
        borderRadius: Radii.md,
        overflow: "hidden",
        backgroundColor: Colors.bgSurface,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
    },
    splitImage: {
        width: "100%",
        height: "100%",
    },
    splitImagePlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.sm,
        padding: Spacing.lg,
    },
    placeholderCaptionText: {
        ...Typography.bodySmall,
        color: Colors.textMuted,
        textAlign: "center",
    },
    captionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: Spacing.xs + 2,
    },
    captionText: {
        ...Typography.bodySmall,
        fontSize: 12,
        color: Colors.textMuted,
    },
});
