import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Platform, Pressable, StyleSheet, View} from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedRef,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import {ChevronDown, ChevronUp} from "lucide-react-native";
import {Colors, Radii, Shadows} from "@/constants/theme";
import {useResponsive} from "@/hooks/use-responsive";
import {SectionData} from "@/data/museum-section";
import {GlossaryEntry} from "@/data/glossary";
import {ActiveGlossaryState, GlossaryOverlay} from "@/components/glossary-overlay";
import {scheduleOnRN} from "react-native-worklets";
import {ScrollytellingStageProps} from "@/components/scrollytelling/types";
import {buildFullImageTracks, buildSplitTracks} from "@/components/scrollytelling/utils";
import {sharedSlideStyles} from "@/components/scrollytelling/shared-styles";
import {TopHud} from "@/components/scrollytelling/top-hud";
import {FixedCoverStage} from "@/components/scrollytelling/fixed-cover-stage";
import {FullImageTrackLayer} from "@/components/scrollytelling/full-image-track-layer";
import {SplitTrackLayer} from "@/components/scrollytelling/split-track-layer";
import {SplitStorySlide} from "@/components/scrollytelling/slides/split-story-slide";
import {TextOnlyStorySlide} from "@/components/scrollytelling/slides/text-only-story-slide";
import {FullImageOverlaySlide} from "@/components/scrollytelling/slides/full-image-overlay-slide";
import {SectionFooterSlide} from "@/components/scrollytelling/slides/section-footer-slide";

export type {ScrollytellingStageProps};

/**
 * Orquestrador principal da experiência de Scrollytelling de uma seção do museu.
 *
 * Arquitetura em camadas:
 * 1. **HUD Superior ([`TopHud`](./scrollytelling/top-hud.tsx))**: Barra de navegação fixa com indicador de progresso.
 * 2. **Camada de Palco Traseira (`fullBleedLayer` antes do `ScrollView`)**:
 *    - Renderiza a capa animada ([`FixedCoverStage`](./scrollytelling/fixed-cover-stage.tsx));
 *    - Renderiza todas as trilhas de tela cheia ([`FullImageTrackLayer`](./scrollytelling/full-image-track-layer.tsx));
 *    - No **desktop**, renderiza também as trilhas de imagem dividida ([`SplitTrackLayer`](./scrollytelling/split-track-layer.tsx)).
 * 3. **Camada de Rolagem (`Animated.ScrollView`)**:
 *    - Contém um espaçador transparente inicial equivalente à altura das páginas de capa (`stageHeight * coverPagesCount`);
 *    - Renderiza os slides narrativos ([`SplitStorySlide`](./scrollytelling/slides/split-story-slide.tsx), [`TextOnlyStorySlide`](./scrollytelling/slides/text-only-story-slide.tsx), [`FullImageOverlaySlide`](./scrollytelling/slides/full-image-overlay-slide.tsx));
 *    - Finaliza com o rodapé da seção ([`SectionFooterSlide`](./scrollytelling/slides/section-footer-slide.tsx)).
 * 4. **Camada de Palco Frontal Mobile (`fullBleedLayer` após o `ScrollView`)**:
 *    - No **mobile**, as trilhas [`SplitTrackLayer`](./scrollytelling/split-track-layer.tsx) são posicionadas acima do `ScrollView`
 *      com `pointerEvents="none"` e escudo superior opaco, garantindo que o texto rolável passe por baixo da imagem sem cobri-la.
 * 5. **Controles Flutuantes e Glossário**:
 *    - Botões flutuantes superior/inferior (`ChevronUp`/`ChevronDown`) e suporte a setas do teclado na Web para avançar/retroceder página a página;
 *    - Modal/popover de glossário ([`GlossaryOverlay`](./glossary-overlay.tsx)) acionado pelos termos destacados no texto.
 */
export function ScrollytellingStage({
                                        section,
                                        onBackHome,
                                        onSelectSection,
                                    }: ScrollytellingStageProps) {
    const {width, height, isDesktop} = useResponsive();
    const [stageHeight, setStageHeight] = useState(Math.max(height - 56, 560));

    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollY = useSharedValue(0);
    const contentHeight = useSharedValue(0);
    const [activeGlossary, setActiveGlossary] = useState<ActiveGlossaryState | null>(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const hoverCloseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Se a seção possuir extraText, a capa ocupa 2 páginas de scroll em vez de 1
    const hasExtraIntroPage = Boolean(section.extraText && section.extraText.trim().length > 0);
    const coverPagesCount = hasExtraIntroPage ? 2 : 1;
    const totalPages = coverPagesCount + section.steps.length + 1;

    // Como o rodapé (SectionFooterSlide) é mais compacto que uma página inteira (stageHeight),
    // o scroll máximo real do ScrollView é menor que (totalPages - 1) * stageHeight.
    // Quando o scroll atinge o final real do conteúdo, consideramos que o usuário está na página do footer (totalPages - 1).
    const updatePageIndex = (offsetY: number, currentContentHeight: number) => {
        const maxScroll =
            currentContentHeight > stageHeight
                ? currentContentHeight - stageHeight
                : (totalPages - 1) * stageHeight;

        if (maxScroll > 0 && offsetY >= maxScroll - 24) {
            setCurrentPageIndex(totalPages - 1);
            return;
        }

        const index = Math.round(offsetY / stageHeight);
        setCurrentPageIndex(Math.max(0, Math.min(totalPages - 1, index)));
    };

    // Atualiza o SharedValue de scroll na UI thread (Reanimated) e sincroniza o índice da página na thread JS
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
            contentHeight.value = event.contentSize.height;
            scheduleOnRN(updatePageIndex, event.contentOffset.y, event.contentSize.height);
        },
    });

    const scrollToPage = useCallback(
        (targetIndex: number) => {
            const clamped = Math.max(0, Math.min(totalPages - 1, targetIndex));
            setCurrentPageIndex(clamped);

            const maxScroll =
                contentHeight.value > stageHeight
                    ? contentHeight.value - stageHeight
                    : (totalPages - 1) * stageHeight;

            const targetY =
                clamped === totalPages - 1
                    ? maxScroll
                    : Math.min(clamped * stageHeight, maxScroll);

            scrollRef.current?.scrollTo({
                y: targetY,
                animated: true,
            });
        },
        [totalPages, stageHeight, scrollRef, contentHeight]
    );

    // Atalhos de teclado na Web (Setas e PageUp/PageDown) para navegação página a página
    useEffect(() => {
        if (Platform.OS !== "web") return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (
                target &&
                (target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.isContentEditable)
            ) {
                return;
            }

            if (e.key === "ArrowDown" || e.key === "PageDown") {
                e.preventDefault();
                scrollToPage(currentPageIndex + 1);
            } else if (e.key === "ArrowUp" || e.key === "PageUp") {
                e.preventDefault();
                scrollToPage(currentPageIndex - 1);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentPageIndex, scrollToPage]);

    // Calcula a largura percentual da barra de progresso no topo usando o limite máximo real de rolagem
    const progressBarStyle = useAnimatedStyle(() => {
        const fallbackMax = Math.max((totalPages - 1) * stageHeight, 1);
        const realMax =
            contentHeight.value > stageHeight
                ? Math.max(contentHeight.value - stageHeight, 1)
                : fallbackMax;

        const progress = interpolate(
            scrollY.value,
            [0, realMax],
            [0, 100],
            Extrapolation.CLAMP
        );
        return {width: `${progress}%`};
    });

    const nextSectionId = useMemo(() => {
        const num = Number(section.sectionId);
        return num < 5 ? (String(num + 1) as SectionData["sectionId"]) : null;
    }, [section.sectionId]);

    const prevSectionId = useMemo(() => {
        const num = Number(section.sectionId);
        return num > 1 ? (String(num - 1) as SectionData["sectionId"]) : null;
    }, [section.sectionId]);

    // Constrói as trilhas agrupadas para passos full-image e split
    const fullImageTracks = useMemo(
        () => buildFullImageTracks(section.steps, coverPagesCount, isDesktop),
        [section.steps, coverPagesCount, isDesktop]
    );

    const {splitTracks, splitStepMeta} = useMemo(
        () => buildSplitTracks(section.steps, coverPagesCount, isDesktop),
        [section.steps, coverPagesCount, isDesktop]
    );

    // Gerenciamento de abertura e fechamento com atraso (hover delay no desktop) do glossário
    const handleOpenGlossary = (entry: GlossaryEntry, anchor?: { x: number; y: number }) => {
        if (hoverCloseTimeout.current) {
            clearTimeout(hoverCloseTimeout.current);
            hoverCloseTimeout.current = null;
        }
        setActiveGlossary({entry, anchor});
    };

    const handleScheduleCloseGlossary = () => {
        if (!isDesktop) return;
        if (hoverCloseTimeout.current) clearTimeout(hoverCloseTimeout.current);
        hoverCloseTimeout.current = setTimeout(() => setActiveGlossary(null), 180);
    };

    const handleCancelCloseGlossary = () => {
        if (hoverCloseTimeout.current) {
            clearTimeout(hoverCloseTimeout.current);
            hoverCloseTimeout.current = null;
        }
    };

    return (
        <View style={styles.root}>
            <TopHud
                section={section}
                isDesktop={isDesktop}
                onBackHome={onBackHome}
                progressBarStyle={progressBarStyle}
            />

            <View
                style={styles.stageViewport}
                onLayout={(e) => {
                    const h = e.nativeEvent.layout.height;
                    if (h > 200 && Math.abs(h - stageHeight) > 2) {
                        setStageHeight(h);
                    }
                }}
            >
                <View style={sharedSlideStyles.fullBleedLayer} pointerEvents="none">
                    <FixedCoverStage
                        section={section}
                        coverPagesCount={coverPagesCount}
                        pageHeight={stageHeight}
                        isDesktop={isDesktop}
                        scrollY={scrollY}
                    />

                    {fullImageTracks.map((track) => (
                        <FullImageTrackLayer
                            key={track.id}
                            track={track}
                            pageHeight={stageHeight}
                            stageWidth={width}
                            stageHeight={stageHeight}
                            isDesktop={isDesktop}
                            scrollY={scrollY}
                        />
                    ))}

                    {isDesktop &&
                        splitTracks.map((track) => (
                            <SplitTrackLayer
                                key={`split-track-${track.id}`}
                                track={track}
                                pageHeight={stageHeight}
                                stageWidth={width}
                                isDesktop={isDesktop}
                                scrollY={scrollY}
                            />
                        ))}
                </View>

                <Animated.ScrollView
                    ref={scrollRef}
                    onScroll={scrollHandler}
                    onContentSizeChange={(_w, h) => {
                        if (h > 0) {
                            contentHeight.value = h;
                        }
                    }}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={isDesktop}
                >
                    <View style={{height: stageHeight * coverPagesCount}} pointerEvents="none"/>

                    {section.steps.map((step) => {
                        if (step.layout === "split") {
                            return (
                                <SplitStorySlide
                                    key={step.id}
                                    step={step}
                                    sequenceMeta={splitStepMeta[step.id]}
                                    pageHeight={stageHeight}
                                    isDesktop={isDesktop}
                                    onOpenGlossary={handleOpenGlossary}
                                    onLeaveGlossary={handleScheduleCloseGlossary}
                                />
                            );
                        }

                        if (step.layout === "text-only") {
                            return (
                                <TextOnlyStorySlide
                                    key={step.id}
                                    step={step}
                                    pageHeight={stageHeight}
                                    isDesktop={isDesktop}
                                    onOpenGlossary={handleOpenGlossary}
                                    onLeaveGlossary={handleScheduleCloseGlossary}
                                />
                            );
                        }

                        return (
                            <FullImageOverlaySlide
                                key={step.id}
                                step={step}
                                pageHeight={stageHeight}
                                isDesktop={isDesktop}
                                onOpenGlossary={handleOpenGlossary}
                                onLeaveGlossary={handleScheduleCloseGlossary}
                            />
                        );
                    })}

                    <SectionFooterSlide
                        isDesktop={isDesktop}
                        sources={section.sources}
                        nextSectionId={nextSectionId}
                        prevSectionId={prevSectionId}
                        onBackHome={onBackHome}
                        onSelectSection={onSelectSection}
                    />
                </Animated.ScrollView>

                {!isDesktop && (
                    <View style={sharedSlideStyles.fullBleedLayer} pointerEvents="none">
                        {splitTracks.map((track) => (
                            <SplitTrackLayer
                                key={`split-track-mobile-${track.id}`}
                                track={track}
                                pageHeight={stageHeight}
                                stageWidth={width}
                                isDesktop={isDesktop}
                                scrollY={scrollY}
                            />
                        ))}
                    </View>
                )}

                {currentPageIndex > 0 && (
                    <View style={styles.floatingTopChevronWrapper} pointerEvents="box-none">
                        <Pressable
                            onPress={() => scrollToPage(currentPageIndex - 1)}
                            accessibilityRole="button"
                            accessibilityLabel="Subir para o trecho anterior"
                            style={({hovered, pressed}: any) => [
                                styles.floatingChevronBtn,
                                hovered && styles.floatingChevronBtnHover,
                                pressed && {opacity: 0.8},
                            ]}
                        >
                            <ChevronUp size={18} color={Colors.textPrimary}/>
                        </Pressable>
                    </View>
                )}

                {currentPageIndex < totalPages - 1 && (
                    <View style={styles.floatingBottomChevronWrapper} pointerEvents="box-none">
                        <Pressable
                            onPress={() => scrollToPage(currentPageIndex + 1)}
                            accessibilityRole="button"
                            accessibilityLabel="Descer para o próximo trecho"
                            style={({hovered, pressed}: any) => [
                                styles.floatingChevronBtn,
                                hovered && styles.floatingChevronBtnHover,
                                pressed && {opacity: 0.8},
                            ]}
                        >
                            <ChevronDown size={18} color={Colors.textPrimary}/>
                        </Pressable>
                    </View>
                )}
            </View>

            <GlossaryOverlay
                activeState={activeGlossary}
                isDesktop={isDesktop}
                viewportWidth={width}
                viewportHeight={height}
                onHoverEnter={handleCancelCloseGlossary}
                onHoverLeave={handleScheduleCloseGlossary}
                onClose={() => setActiveGlossary(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.bgPrimary,
    },
    stageViewport: {
        flex: 1,
        position: "relative",
        overflow: "hidden",
    },
    floatingTopChevronWrapper: {
        position: "absolute",
        top: 14,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 15,
    },
    floatingBottomChevronWrapper: {
        position: "absolute",
        bottom: 16,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 15,
    },
    floatingChevronBtn: {
        width: 38,
        height: 38,
        borderRadius: Radii.full,
        backgroundColor: "rgba(31, 26, 23, 0.88)",
        borderWidth: 1,
        borderColor: Colors.borderStrong,
        alignItems: "center",
        justifyContent: "center",
        ...Shadows.card,
        ...Platform.select({web: {cursor: "pointer" as any}}),
    },
    floatingChevronBtnHover: {
        borderColor: Colors.accentPrimary,
        backgroundColor: Colors.bgElevated,
    },
});