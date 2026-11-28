import React from "react";
import {ImageSourcePropType} from "react-native";
import {Image} from "expo-image";
import Animated, {Easing, SharedValue, useAnimatedStyle, withTiming} from "react-native-reanimated";
import {sharedSlideStyles} from "./shared-styles";

/**
 * Renderiza uma imagem individual dentro de uma trilha que possui múltiplas imagens distintas
 * (ex.: passos agrupados pelo mesmo `sequenceId` que trocam de figura mantendo a mesma moldura/câmera).
 *
 * Lógica interna:
 * - Observa o `activeIndex` (SharedValue calculado a partir da posição do scroll).
 * - Quando `activeIndex.value === index`, anima a opacidade para `1` em 380ms com curva bezier suave;
 *   caso contrário, faz fade-out para `0`, resultando em um efeito de crossfade contínuo entre as imagens.
 */
export function TrackKeyframeImage({
                                       image,
                                       index,
                                       activeIndex,
                                       contentFit,
                                       style,
                                       onLoad,
                                   }: {
    image: ImageSourcePropType | { uri: string };
    index: number;
    activeIndex: SharedValue<number>;
    contentFit: "cover" | "contain";
    style: any;
    onLoad?: (event: any) => void;
}) {
    const fadeStyle = useAnimatedStyle(() => {
        const isCurrent = activeIndex.value === index;
        return {
            opacity: withTiming(isCurrent ? 1 : 0, {
                duration: 380,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
        };
    });

    return (
        <Animated.View style={[sharedSlideStyles.fullBleedLayer, fadeStyle]}>
            <Image source={image as any} style={style} contentFit={contentFit} onLoad={onLoad}/>
        </Animated.View>
    );
}
