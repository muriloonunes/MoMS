import {useMemo} from "react";
import {ImageSourcePropType} from "react-native";
import {Easing, SharedValue, useAnimatedStyle, useDerivedValue, withTiming} from "react-native-reanimated";

export interface TrackKeyframePose {
    pageIndex: number;
    image?: ImageSourcePropType | { uri: string };
    scale: number;
    focusX: number;
    focusY: number;
}

export interface UseTrackCameraAnimationParams {
    keyframes: TrackKeyframePose[];
    pageHeight: number;
    scrollY: SharedValue<number>;
    /** Largura de referência da área da imagem (viewport inteira ou largura da moldura split). */
    refWidth: number;
    /** Altura de referência da área da imagem (viewport inteira ou altura da moldura split). */
    refHeight: number;
    /** Duração da transição de câmera em milissegundos. */
    durationMs?: number;
    /** Deslocamento vertical extra quando a câmera está em repouso (usado no full-image mobile). */
    restYOffsetWhenUnzoomed?: number;
}

/**
 * Hook compartilhado que encapsula toda a matemática de animação e sincronia de scroll de uma trilha de imagens:
 *
 * 1. **Detecção de múltiplas imagens (`hasDistinctImages`)**:
 *    Verifica se os keyframes da trilha possuem imagens distintas para ativar crossfade via [`TrackKeyframeImage`](./track-keyframe-image.tsx).
 * 2. **Pinning do contêiner (`containerSlideStyle`)**:
 *    Faz a camada entrar por baixo antes do primeiro passo (`enterFromBottom`), permanecer fixa (`translateY = 0`)
 *    enquanto o usuário rola entre o primeiro e o último passo da trilha, e sair pelo topo (`exitToTop`) ao final.
 * 3. **Índice ativo com antecipação (`activeKeyframeIndex`)**:
 *    Determina qual keyframe de câmera está ativo disparando a transição 40% de página antes (`pageHeight * 0.4`).
 * 4. **Interpolação de câmera (`animatedImageStyle`)**:
 *    Calcula e anima com `withTiming` o zoom (`scale`) e o deslocamento (`translateX`, `translateY`) a partir
 *    de `focusX` e `focusY` normalizados (-0.5 a 0.5).
 */
export function useTrackCameraAnimation({
                                            keyframes,
                                            pageHeight,
                                            scrollY,
                                            refWidth,
                                            refHeight,
                                            durationMs = 700,
                                            restYOffsetWhenUnzoomed = 0,
                                        }: UseTrackCameraAnimationParams) {
    const firstPage = keyframes[0].pageIndex;
    const lastPage = keyframes[keyframes.length - 1].pageIndex;
    const firstCenter = firstPage * pageHeight;
    const lastCenter = lastPage * pageHeight;

    const scrollInputRange = useMemo(
        () => keyframes.map((kf) => kf.pageIndex * pageHeight),
        [keyframes, pageHeight]
    );
    const scaleOutputRange = useMemo(
        () => keyframes.map((kf) => kf.scale),
        [keyframes]
    );
    const focusXOutputRange = useMemo(
        () => keyframes.map((kf) => kf.focusX),
        [keyframes]
    );
    const focusYOutputRange = useMemo(
        () => keyframes.map((kf) => kf.focusY),
        [keyframes]
    );

    const hasDistinctImages = useMemo(() => {
        const firstStr = JSON.stringify(keyframes[0]?.image);
        return keyframes.some((kf) => JSON.stringify(kf.image) !== firstStr);
    }, [keyframes]);

    // Controla a entrada por baixo, permanência fixa durante os passos da trilha e saída pelo topo
    const containerSlideStyle = useAnimatedStyle(() => {
        const enterFromBottom = firstCenter - scrollY.value;
        const exitToTop = lastCenter - scrollY.value;

        let containerY = 0;
        if (scrollY.value < firstCenter) {
            containerY = enterFromBottom;
        } else if (scrollY.value > lastCenter) {
            containerY = exitToTop;
        }

        const isVisible =
            scrollY.value >= firstCenter - pageHeight &&
            scrollY.value <= lastCenter + pageHeight;

        return {
            opacity: isVisible ? 1 : 0,
            transform: [{translateY: containerY}],
        };
    });

    // Determina qual keyframe de câmera está ativo com antecipação de 40% da altura da página
    const activeKeyframeIndex = useDerivedValue(() => {
        const triggerAnticipation = pageHeight * 0.4;
        let current = 0;

        for (let i = 0; i < scrollInputRange.length; i++) {
            if (scrollY.value >= scrollInputRange[i] - triggerAnticipation) {
                current = i;
            }
        }
        return current;
    });

    // Interpola zoom (scale) e deslocamento (pan X/Y) com transição suave
    const animatedImageStyle = useAnimatedStyle(() => {
        const idx = activeKeyframeIndex.value;
        const targetScale = scaleOutputRange[idx];
        const targetFocusX = focusXOutputRange[idx];
        const targetFocusY = focusYOutputRange[idx];

        const maxOffsetX = refWidth * (targetScale - 1) * 0.5;
        const maxOffsetY = refHeight * (targetScale - 1) * 0.5;
        const targetTranslateX = -targetFocusX * 2 * maxOffsetX;
        const restOffset = targetScale <= 1.05 ? restYOffsetWhenUnzoomed : 0;
        const targetTranslateY = -targetFocusY * 2 * maxOffsetY + restOffset;

        const timingConfig = {
            duration: durationMs,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        };

        return {
            transform: [
                {translateX: withTiming(targetTranslateX, timingConfig)},
                {translateY: withTiming(targetTranslateY, timingConfig)},
                {scale: withTiming(targetScale, timingConfig)},
            ],
        };
    });

    return {
        hasDistinctImages,
        containerSlideStyle,
        activeKeyframeIndex,
        animatedImageStyle,
    };
}
