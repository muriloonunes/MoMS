import React from "react";
import {StyleSheet, Text, View} from "react-native";
import {Image} from "expo-image";
import Animated, {SharedValue} from "react-native-reanimated";
import {ImageIcon} from "lucide-react-native";
import Svg, {Defs, LinearGradient, Rect, Stop} from "react-native-svg";
import {Colors, Spacing, Typography} from "@/constants/theme";
import {FullImageTrack} from "./types";
import {hasValidImage} from "./utils";
import {TrackKeyframeImage} from "./track-keyframe-image";
import {sharedSlideStyles} from "./shared-styles";
import {useTrackCameraAnimation} from "./use-track-camera-animation";

/**
 * Camada de fundo para sequências de passos com `layout: "full-image"`.
 *
 * Lógica interna:
 * - Delega o controle de posicionamento fixo (pinning), detecção do keyframe ativo e cálculo de zoom/pan
 *   para o hook compartilhado [`useTrackCameraAnimation`](./use-track-camera-animation.ts).
 * - No mobile, usa `contentFit="contain"` sobre um fundo ambientado e desfocado (`mobileAmbientBackdrop`) para evitar cortes laterais
 *   severos em imagens horizontais, aplicando um pequeno deslocamento superior (`restYOffsetWhenUnzoomed`) para deixar espaço livre para a legenda inferior.
 * - Renderiza um gradiente linear em SVG (`storyGradientScrim`) nos 60% inferiores da tela para garantir contraste ao texto branco de [`FullImageOverlaySlide`](./slides/full-image-overlay-slide.tsx)
 *   tanto na Web quanto no Android/iOS nativo.
 */
export function FullImageTrackLayer({
                                        track,
                                        pageHeight,
                                        stageWidth,
                                        stageHeight,
                                        isDesktop,
                                        scrollY,
                                    }: {
    track: FullImageTrack;
    pageHeight: number;
    stageWidth: number;
    stageHeight: number;
    isDesktop: boolean;
    scrollY: SharedValue<number>;
}) {
    const {
        hasDistinctImages,
        containerSlideStyle,
        activeKeyframeIndex,
        animatedImageStyle,
    } = useTrackCameraAnimation({
        keyframes: track.keyframes,
        pageHeight,
        scrollY,
        refWidth: stageWidth,
        refHeight: isDesktop ? stageHeight : stageWidth * 0.65,
        durationMs: 750,
        restYOffsetWhenUnzoomed: !isDesktop ? -stageHeight * 0.06 : 0,
    });

    const validImage = hasValidImage(track.image);
    const firstKeyframe = track.keyframes[0];
    const imageContentFit = isDesktop ? "cover" : "contain";

    return (
        <Animated.View style={[styles.fullImageTrackContainer, containerSlideStyle]}>
            {!isDesktop && validImage && (
                <View style={styles.mobileAmbientBackdrop} pointerEvents="none">
                    <Image
                        source={track.image as any}
                        style={sharedSlideStyles.fullBleedImage}
                        contentFit="cover"
                        blurRadius={45}
                    />
                    <View style={styles.mobileAmbientDimmer}/>
                </View>
            )}

            <Animated.View style={[sharedSlideStyles.fullBleedLayer, animatedImageStyle]}>
                {validImage ? (
                    hasDistinctImages ? (
                        track.keyframes.map((kf, idx) =>
                            hasValidImage(kf.image) ? (
                                <TrackKeyframeImage
                                    key={`${track.id}-kf-${idx}`}
                                    image={kf.image!}
                                    index={idx}
                                    activeIndex={activeKeyframeIndex}
                                    contentFit={imageContentFit}
                                    style={sharedSlideStyles.fullBleedImage}
                                />
                            ) : null
                        )
                    ) : (
                        <Image
                            source={track.image as any}
                            style={sharedSlideStyles.fullBleedImage}
                            contentFit={imageContentFit}
                        />
                    )
                ) : (
                    <View style={styles.backdropPlaceholder}>
                        <ImageIcon size={48} color={Colors.borderStrong}/>
                        <Text style={styles.placeholderTitle}>
                            {track.title ?? "Imagem Histórica em Curadoria"}
                        </Text>
                        <Text style={styles.placeholderCoords}>
                            CÂMERA: ZOOM {firstKeyframe.scale.toFixed(1)}x • X {firstKeyframe.focusX} •
                            Y {firstKeyframe.focusY}
                        </Text>
                    </View>
                )}
            </Animated.View>

            <View style={styles.storyGradientScrim} pointerEvents="none">
                <Svg width="100%" height="100%" preserveAspectRatio="none">
                    <Defs>
                        <LinearGradient id={`scrim-${track.id}`} x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#0E0C0A" stopOpacity="0"/>
                            <Stop offset="0.45" stopColor="#0E0C0A" stopOpacity="0.65"/>
                            <Stop offset="1" stopColor="#0E0C0A" stopOpacity="0.94"/>
                        </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill={`url(#scrim-${track.id})`}/>
                </Svg>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    fullImageTrackContainer: {
        ...StyleSheet.absoluteFill,
        backgroundColor: Colors.bgPrimary,
        overflow: "hidden",
        borderTopWidth: 1,
        borderTopColor: Colors.borderSubtle,
    },
    mobileAmbientBackdrop: {
        ...StyleSheet.absoluteFill,
        opacity: 0.55,
    },
    mobileAmbientDimmer: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(20, 17, 15, 0.55)",
    },
    storyGradientScrim: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "60%",
    },
    backdropPlaceholder: {
        flex: 1,
        backgroundColor: "#191512",
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.sm,
        padding: Spacing.xl,
    },
    placeholderTitle: {
        ...Typography.h3,
        color: Colors.textMuted,
        textAlign: "center",
    },
    placeholderCoords: {
        ...Typography.coordinate,
        color: Colors.borderStrong,
    },
});
