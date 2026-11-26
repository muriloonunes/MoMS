import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {ImageSourcePropType, Platform, Pressable, ScrollView, StyleSheet, Text, View,} from "react-native";
import {Image} from "expo-image";
import Animated, {
    Easing,
    Extrapolation,
    interpolate,
    SharedValue,
    useAnimatedRef,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import {ArrowLeft, ArrowRight, ChevronDown, ChevronUp, ImageIcon, Info, MapPin,} from "lucide-react-native";
import {Colors, Layout, Radii, Shadows, Spacing, Typography} from "@/constants/theme";
import {useResponsive} from "@/hooks/use-responsive";
import {SectionData, StoryStep} from "@/data/museum-section";
import {GlossaryEntry} from "@/data/glossary";
import {ActiveGlossaryState, GlossaryOverlay, RichGlossaryText} from "@/components/glossary-overlay";
import {scheduleOnRN} from "react-native-worklets";

function hasValidImage(image?: ImageSourcePropType | { uri: string }): boolean {
    if (!image) return false;
    if (typeof image === "number") return true;
    if (typeof image === "object" && "uri" in image) {
        return typeof image.uri === "string" && image.uri.trim().length > 0;
    }
    return false;
}

export interface ScrollytellingStageProps {
    section: SectionData;
    onBackHome: () => void;
    onSelectSection?: (sectionId: SectionData["sectionId"]) => void;
}

export function ScrollytellingStage({
                                        section,
                                        onBackHome,
                                        onSelectSection,
                                    }: ScrollytellingStageProps) {
    const {width, height, isDesktop} = useResponsive();
    const [stageHeight, setStageHeight] = useState(Math.max(height - 56, 560));

    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollY = useSharedValue(0);
    const [activeGlossary, setActiveGlossary] = useState<ActiveGlossaryState | null>(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const hoverCloseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const hasExtraIntroPage = Boolean(section.extraText && section.extraText.trim().length > 0);
    const coverPagesCount = hasExtraIntroPage ? 2 : 1;
    const totalPages = coverPagesCount + section.steps.length + 1;

    const updatePageIndex = (offsetY: number) => {
        const index = Math.round(offsetY / stageHeight);
        setCurrentPageIndex(Math.max(0, Math.min(totalPages - 1, index)));
    };

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
            scheduleOnRN(updatePageIndex, event.contentOffset.y)
        },
    });

    const scrollToPage = useCallback(
        (targetIndex: number) => {
            const clamped = Math.max(0, Math.min(totalPages - 1, targetIndex));
            setCurrentPageIndex(clamped);
            scrollRef.current?.scrollTo({
                y: clamped * stageHeight,
                animated: true,
            });
        },
        [totalPages, stageHeight, scrollRef]
    );

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

    const progressBarStyle = useAnimatedStyle(() => {
        const maxScroll = Math.max((totalPages - 1) * stageHeight, 1);
        const progress = interpolate(
            scrollY.value,
            [0, maxScroll],
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

    const fullImageTracks = useMemo(() => {
        const tracks: Array<{
            id: string;
            sequenceId?: string;
            image?: ImageSourcePropType | { uri: string };
            title?: string;
            keyframes: Array<{
                pageIndex: number;
                image?: ImageSourcePropType | { uri: string };
                scale: number;
                focusX: number;
                focusY: number;
            }>;
        }> = [];

        section.steps.forEach((step, index) => {
            if (step.layout !== "full-image") return;
            const pageIndex = coverPagesCount + index;
            const prevStep = index > 0 ? section.steps[index - 1] : undefined;
            const sameTrackAsPrev =
                prevStep?.layout === "full-image" &&
                ((step.sequenceId && prevStep.sequenceId === step.sequenceId) ||
                    JSON.stringify(prevStep.image) === JSON.stringify(step.image));

            const pose = {
                pageIndex,
                image: step.image,
                scale: step.camera?.scale ?? 1,
                focusX: step.camera?.focusX ?? 0,
                focusY: step.camera?.focusY ?? 0,
            };

            if (sameTrackAsPrev && tracks.length > 0) {
                tracks[tracks.length - 1].keyframes.push(pose);
            } else {
                tracks.push({
                    id: step.id,
                    sequenceId: step.sequenceId,
                    image: step.image,
                    title: step.title,
                    keyframes: [pose],
                });
            }
        });

        return tracks;
    }, [section.steps, coverPagesCount]);

    const {splitTracks, splitStepMeta} = useMemo(() => {
        const tracks: Array<{
            id: string;
            sequenceId?: string;
            imagePosition: "left" | "right";
            imageFit: "contain" | "cover";
            imageAspectRatio?: number;
            keyframes: Array<{
                pageIndex: number;
                stepId: string;
                image?: ImageSourcePropType | { uri: string };
                imageCaption?: string;
                title?: string;
                scale: number;
                focusX: number;
                focusY: number;
            }>;
        }> = [];

        const metaMap: Record<
            string,
            { trackId: string; stepIndexInTrack: number; totalInTrack: number }
        > = {};

        section.steps.forEach((step, index) => {
            if (step.layout !== "split") return;
            const pageIndex = coverPagesCount + index;
            const prevStep = index > 0 ? section.steps[index - 1] : undefined;
            const pos = step.imagePosition ?? "right";
            const prevPos = prevStep?.imagePosition ?? "right";

            const sameTrackAsPrev =
                prevStep?.layout === "split" &&
                pos === prevPos &&
                ((step.sequenceId && prevStep.sequenceId === step.sequenceId) ||
                    JSON.stringify(prevStep.image) === JSON.stringify(step.image));

            const keyframe = {
                pageIndex,
                stepId: step.id,
                image: step.image,
                imageCaption: step.imageCaption,
                title: step.title,
                scale: step.camera?.scale ?? 1,
                focusX: step.camera?.focusX ?? 0,
                focusY: step.camera?.focusY ?? 0,
            };

            if (sameTrackAsPrev && tracks.length > 0) {
                tracks[tracks.length - 1].keyframes.push(keyframe);
            } else {
                tracks.push({
                    id: step.id,
                    sequenceId: step.sequenceId,
                    imagePosition: pos,
                    imageFit: step.imageFit ?? "contain",
                    imageAspectRatio: step.imageAspectRatio,
                    keyframes: [keyframe],
                });
            }
        });

        tracks.forEach((track) => {
            track.keyframes.forEach((kf, idx) => {
                metaMap[kf.stepId] = {
                    trackId: track.id,
                    stepIndexInTrack: idx,
                    totalInTrack: track.keyframes.length,
                };
            });
        });

        return {splitTracks: tracks, splitStepMeta: metaMap};
    }, [section.steps, coverPagesCount]);

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
            <View style={styles.topHud}>
                <View style={styles.topHudBar}>
                    <Pressable
                        onPress={onBackHome}
                        accessibilityRole="button"
                        accessibilityLabel="Voltar para a página inicial do museu"
                        style={({pressed, hovered}: any) => [
                            styles.hudBackButton,
                            hovered && styles.hudBackButtonHover,
                            pressed && {opacity: 0.8},
                        ]}
                    >
                        <ArrowLeft size={16} color={Colors.textPrimary}/>
                        {isDesktop && <Text style={styles.hudBackText}>Início</Text>}
                    </Pressable>

                    <View
                        style={[
                            styles.hudTitleGroup,
                            !isDesktop && styles.hudTitleGroupMobile,
                        ]}
                    >
                        <Text style={styles.hudCodeText}>
                            {isDesktop ? `${section.code}:` : section.code}
                        </Text>
                        <Text
                            style={[
                                styles.hudSectionTitle,
                                !isDesktop && styles.hudSectionTitleMobile,
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {section.title}
                        </Text>
                    </View>

                    {isDesktop && <View style={styles.hudRightBalanceSpacer}/>}
                </View>

                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, progressBarStyle]}/>
                </View>
            </View>

            <View
                style={styles.stageViewport}
                onLayout={(e) => {
                    const h = e.nativeEvent.layout.height;
                    if (h > 200 && Math.abs(h - stageHeight) > 2) {
                        setStageHeight(h);
                    }
                }}
            >
                <View style={styles.fullBleedLayer} pointerEvents="none">
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
                            scrollY={scrollY}
                        />
                    ))}

                    {splitTracks.map((track) => (
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
                        section={section}
                        pageHeight={stageHeight}
                        nextSectionId={nextSectionId}
                        prevSectionId={prevSectionId}
                        onBackHome={onBackHome}
                        onSelectSection={onSelectSection}
                    />
                </Animated.ScrollView>

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

function FixedCoverStage({
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
        <View style={[styles.fullBleedLayer, !validCover && {backgroundColor: Colors.bgPrimary}]}>
            {validCover && (
                <Animated.View style={[styles.fullBleedLayer, imageAnimStyle]}>
                    <Image
                        source={section.coverImage as any}
                        style={styles.fullBleedImage}
                        contentFit="cover"
                    />
                    <Animated.View style={[styles.fullBleedLayer, scrimAnimStyle]}/>
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

function TrackKeyframeImage({
                                image,
                                index,
                                activeIndex,
                                contentFit,
                                style,
                            }: {
    image: ImageSourcePropType | { uri: string };
    index: number;
    activeIndex: SharedValue<number>;
    contentFit: "cover" | "contain";
    style: any;
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
        <Animated.View style={[styles.fullBleedLayer, fadeStyle]}>
            <Image source={image as any} style={style} contentFit={contentFit}/>
        </Animated.View>
    );
}

function FullImageTrackLayer({
                                 track,
                                 pageHeight,
                                 stageWidth,
                                 stageHeight,
                                 scrollY,
                             }: {
    track: {
        id: string;
        sequenceId?: string;
        image?: ImageSourcePropType | { uri: string };
        title?: string;
        keyframes: Array<{
            pageIndex: number;
            image?: ImageSourcePropType | { uri: string };
            scale: number;
            focusX: number;
            focusY: number;
        }>;
    };
    pageHeight: number;
    stageWidth: number;
    stageHeight: number;
    scrollY: SharedValue<number>;
}) {
    const firstPage = track.keyframes[0].pageIndex;
    const lastPage = track.keyframes[track.keyframes.length - 1].pageIndex;
    const firstCenter = firstPage * pageHeight;
    const lastCenter = lastPage * pageHeight;

    const scrollInputRange = useMemo(
        () => track.keyframes.map((kf) => kf.pageIndex * pageHeight),
        [track.keyframes, pageHeight]
    );
    const scaleOutputRange = useMemo(
        () => track.keyframes.map((kf) => kf.scale),
        [track.keyframes]
    );
    const focusXOutputRange = useMemo(
        () => track.keyframes.map((kf) => kf.focusX),
        [track.keyframes]
    );
    const focusYOutputRange = useMemo(
        () => track.keyframes.map((kf) => kf.focusY),
        [track.keyframes]
    );

    const hasDistinctImages = useMemo(() => {
        const firstStr = JSON.stringify(track.keyframes[0]?.image);
        return track.keyframes.some((kf) => JSON.stringify(kf.image) !== firstStr);
    }, [track.keyframes]);

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

    const animatedImageStyle = useAnimatedStyle(() => {
        const idx = activeKeyframeIndex.value;
        const targetScale = scaleOutputRange[idx];
        const targetFocusX = focusXOutputRange[idx];
        const targetFocusY = focusYOutputRange[idx];

        const maxOffsetX = stageWidth * (targetScale - 1) * 0.5;
        const maxOffsetY = stageHeight * (targetScale - 1) * 0.5;
        const targetTranslateX = -targetFocusX * 2 * maxOffsetX;
        const targetTranslateY = -targetFocusY * 2 * maxOffsetY;

        const timingConfig = {
            duration: 750,
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

    const validImage = hasValidImage(track.image);
    const firstKeyframe = track.keyframes[0];

    return (
        <Animated.View style={[styles.fullImageTrackContainer, containerSlideStyle]}>
            <Animated.View style={[styles.fullBleedLayer, animatedImageStyle]}>
                {validImage ? (
                    hasDistinctImages ? (
                        track.keyframes.map((kf, idx) =>
                            hasValidImage(kf.image) ? (
                                <TrackKeyframeImage
                                    key={`${track.id}-kf-${idx}`}
                                    image={kf.image!}
                                    index={idx}
                                    activeIndex={activeKeyframeIndex}
                                    contentFit="cover"
                                    style={styles.fullBleedImage}
                                />
                            ) : null
                        )
                    ) : (
                        <Image
                            source={track.image as any}
                            style={styles.fullBleedImage}
                            contentFit="cover"
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
                <View style={styles.fullImageVignette}/>
            </Animated.View>
        </Animated.View>
    );
}

function SplitTrackLayer({
                             track,
                             pageHeight,
                             stageWidth,
                             isDesktop,
                             scrollY,
                         }: {
    track: {
        id: string;
        sequenceId?: string;
        imagePosition: "left" | "right";
        imageFit: "contain" | "cover";
        imageAspectRatio?: number;
        keyframes: Array<{
            pageIndex: number;
            stepId: string;
            image?: ImageSourcePropType | { uri: string };
            imageCaption?: string;
            title?: string;
            scale: number;
            focusX: number;
            focusY: number;
        }>;
    };
    pageHeight: number;
    stageWidth: number;
    isDesktop: boolean;
    scrollY: SharedValue<number>;
}) {
    const firstPage = track.keyframes[0].pageIndex;
    const lastPage = track.keyframes[track.keyframes.length - 1].pageIndex;
    const firstCenter = firstPage * pageHeight;
    const lastCenter = lastPage * pageHeight;

    const frameWidth = isDesktop
        ? Math.min(stageWidth, Layout.maxContentWidth) * 0.52 - Spacing.lg * 2
        : stageWidth - Spacing.md * 2;
    const frameHeight = isDesktop
        ? Math.min(pageHeight * 0.72, 680)
        : pageHeight * 0.40;

    const scrollInputRange = useMemo(
        () => track.keyframes.map((kf) => kf.pageIndex * pageHeight),
        [track.keyframes, pageHeight]
    );
    const scaleOutputRange = useMemo(
        () => track.keyframes.map((kf) => kf.scale),
        [track.keyframes]
    );
    const focusXOutputRange = useMemo(
        () => track.keyframes.map((kf) => kf.focusX),
        [track.keyframes]
    );
    const focusYOutputRange = useMemo(
        () => track.keyframes.map((kf) => kf.focusY),
        [track.keyframes]
    );

    const hasDistinctImages = useMemo(() => {
        const firstStr = JSON.stringify(track.keyframes[0]?.image);
        return track.keyframes.some((kf) => JSON.stringify(kf.image) !== firstStr);
    }, [track.keyframes]);

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

    const animatedImageStyle = useAnimatedStyle(() => {
        const idx = activeKeyframeIndex.value;
        const targetScale = scaleOutputRange[idx];
        const targetFocusX = focusXOutputRange[idx];
        const targetFocusY = focusYOutputRange[idx];

        const maxOffsetX = frameWidth * (targetScale - 1) * 0.5;
        const maxOffsetY = frameHeight * (targetScale - 1) * 0.5;
        const targetTranslateX = -targetFocusX * 2 * maxOffsetX;
        const targetTranslateY = -targetFocusY * 2 * maxOffsetY;

        const timingConfig = {
            duration: 650,
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
            <View
                style={[
                    styles.splitImageFrame,
                    track.imageAspectRatio
                        ? {aspectRatio: track.imageAspectRatio, flex: undefined}
                        : {flex: 1},
                ]}
            >
                <Animated.View style={[styles.fullBleedLayer, animatedImageStyle]}>
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
                                    />
                                ) : null
                            )
                        ) : (
                            <Image
                                source={firstKf.image as any}
                                style={styles.splitImage}
                                contentFit={track.imageFit}
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
    );

    return (
        <Animated.View
            style={[
                styles.splitTrackBackdrop,
                !isDesktop && {paddingVertical: Spacing.md},
                containerSlideStyle,
            ]}
        >
            {!isDesktop ? (
                <View style={styles.splitColMobile}>
                    {imagePane}
                    <View style={{flex: 1}}/>
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

function SplitStorySlide({
                             step,
                             sequenceMeta,
                             pageHeight,
                             isDesktop,
                             onOpenGlossary,
                             onLeaveGlossary,
                         }: {
    step: StoryStep;
    sequenceMeta?: { trackId: string; stepIndexInTrack: number; totalInTrack: number };
    pageHeight: number;
    isDesktop: boolean;
    onOpenGlossary: (entry: GlossaryEntry, anchor?: { x: number; y: number }) => void;
    onLeaveGlossary: () => void;
}) {
    const imageOnLeft = step.imagePosition === "left";
    const isSequence = (sequenceMeta?.totalInTrack ?? 1) > 1;
    const isFirstInTrack = (sequenceMeta?.stepIndexInTrack ?? 0) === 0;
    const isLastInTrack =
        sequenceMeta
            ? sequenceMeta.stepIndexInTrack === sequenceMeta.totalInTrack - 1
            : true;

    const textBody = (
        <View style={styles.splitTextInner}>
            {(step.year || step.isBrazil || isSequence) && (
                <View style={styles.metaBadgeRow}>
                    {step.year && <Text style={styles.stepYearText}>{step.year}</Text>}
                    {step.isBrazil && (
                        <View style={styles.brazilBadge}>
                            <MapPin size={11} color={Colors.accentBrazil}/>
                            <Text style={styles.brazilBadgeText}>MARCO BRASIL</Text>
                        </View>
                    )}
                </View>
            )}

            {step.title && (
                <Text style={[styles.stepHeading, !isDesktop && {fontSize: 22, lineHeight: 28}]}>
                    {step.title}
                </Text>
            )}

            <RichGlossaryText
                text={step.text}
                style={[styles.editorialBodyText, !isDesktop && {fontSize: 15, lineHeight: 23}]}
                isDesktop={isDesktop}
                onSelectGlossary={onOpenGlossary}
                onLeaveGlossary={onLeaveGlossary}
            />
        </View>
    );

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

/**
 * LAYOUT 'text-only' — Parágrafo editorial centralizado
 */
function TextOnlyStorySlide({
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
                        step.isBrazil && styles.brazilHighlightBorder,
                    ]}
                >
                    {(step.year || step.isBrazil) && (
                        <View style={styles.metaBadgeRow}>
                            {step.year && <Text style={styles.stepYearText}>{step.year}</Text>}
                            {step.isBrazil && (
                                <View style={styles.brazilBadge}>
                                    <MapPin size={11} color={Colors.accentBrazil}/>
                                    <Text style={styles.brazilBadgeText}>MARCO BRASIL</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {step.title && (
                        <Text style={[styles.stepHeading, !isDesktop && {fontSize: 24, lineHeight: 30}]}>
                            {step.title}
                        </Text>
                    )}

                    <RichGlossaryText
                        text={step.text}
                        style={[
                            styles.editorialBodyText,
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

/**
 * LAYOUT 'full-image' — Texto sobre a imagem em zoom
 */
function FullImageOverlaySlide({
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
        <View style={[styles.fullImageSlideRoot, {height: pageHeight}]}>
            <View style={styles.fullImageTopCredit}>
                {(step.imageCaption || step.title) && (
                    <View style={styles.fullImageCreditRow}>
                        <Info size={13} color={Colors.textSecondary}/>
                        <Text style={styles.fullImageCreditText} numberOfLines={1}>
                            {step.imageCaption ?? step.title}
                        </Text>
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
                        !isDesktop && {maxHeight: pageHeight * 0.56},
                        step.isBrazil && styles.brazilHighlightBorder,
                    ]}
                >
                    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                        {(step.year || step.isBrazil) && (
                            <View style={styles.metaBadgeRow}>
                                {step.year && <Text style={styles.stepYearText}>{step.year}</Text>}
                                {step.isBrazil && (
                                    <View style={styles.brazilBadge}>
                                        <MapPin size={11} color={Colors.accentBrazil}/>
                                        <Text style={styles.brazilBadgeText}>MARCO BRASIL</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {step.title && (
                            <Text style={[styles.fullImageOverlayTitle, !isDesktop && {fontSize: 20, lineHeight: 26}]}>
                                {step.title}
                            </Text>
                        )}

                        <RichGlossaryText
                            text={step.text}
                            style={[styles.fullImageOverlayBodyText, !isDesktop && {fontSize: 15, lineHeight: 22}]}
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

/**
 * Rodapé de fechamento da era
 */
function SectionFooterSlide({
                                section,
                                pageHeight,
                                nextSectionId,
                                prevSectionId,
                                onBackHome,
                                onSelectSection,
                            }: {
    section: SectionData;
    pageHeight: number;
    nextSectionId: SectionData["sectionId"] | null;
    prevSectionId: SectionData["sectionId"] | null;
    onBackHome: () => void;
    onSelectSection?: (id: SectionData["sectionId"]) => void;
}) {
    return (
        <View style={[styles.footerSlide, {height: pageHeight}]}>
            <View style={styles.footerCard}>
                <Text style={styles.footerBadge}>FIM DA {section.code}</Text>
                <Text style={styles.footerTitle}>{section.title}</Text>
                <Text style={styles.footerSubtitle}>
                    Continue sua jornada cronológica ou escolha outra estação do acervo.
                </Text>

                <View style={styles.footerActionsRow}>
                    {prevSectionId && onSelectSection && (
                        <Pressable
                            onPress={() => onSelectSection(prevSectionId)}
                            style={({hovered, pressed}: any) => [
                                styles.footerSecondaryBtn,
                                hovered && {borderColor: Colors.accentPrimary},
                                pressed && {opacity: 0.8},
                            ]}
                        >
                            <ArrowLeft size={16} color={Colors.textPrimary}/>
                            <Text style={styles.footerSecondaryBtnText}>
                                Seção 0{prevSectionId}
                            </Text>
                        </Pressable>
                    )}

                    {nextSectionId && onSelectSection && (
                        <Pressable
                            onPress={() => onSelectSection(nextSectionId)}
                            style={({hovered, pressed}: any) => [
                                styles.footerPrimaryBtn,
                                hovered && {backgroundColor: Colors.accentPrimaryHover},
                                pressed && {opacity: 0.9},
                            ]}
                        >
                            <Text style={styles.footerPrimaryBtnText}>
                                Avançar para Seção 0{nextSectionId}
                            </Text>
                            <ArrowRight size={16} color={Colors.textInverse}/>
                        </Pressable>
                    )}
                </View>

                <Pressable
                    onPress={onBackHome}
                    style={({pressed}: any) => [
                        styles.footerHomeLink,
                        pressed && {opacity: 0.7},
                    ]}
                >
                    <Text style={styles.footerHomeLinkText}>
                        Voltar ao Mapa Geral de Seções
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.bgPrimary,
    },
    topHud: {
        width: "100%",
        zIndex: 20,
        backgroundColor: Colors.bgPrimary,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderSubtle,
    },
    topHudBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.md,
        height: 54,
    },
    stageViewport: {
        flex: 1,
        position: "relative",
        overflow: "hidden",
    },
    fullBleedLayer: {
        ...StyleSheet.absoluteFill,
    },
    fullImageTrackContainer: {
        ...StyleSheet.absoluteFill,
        backgroundColor: Colors.bgPrimary,
        overflow: "hidden",
        borderTopWidth: 1,
        borderTopColor: Colors.borderSubtle,
    },
    fullBleedImage: {
        width: "100%",
        height: "100%",
    },
    hudBackButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs + 2,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: Radii.sm,
        backgroundColor: Colors.bgSurface,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        ...Platform.select({web: {cursor: "pointer" as any}}),
    },
    hudBackButtonHover: {
        borderColor: Colors.accentPrimary,
    },
    hudBackText: {
        ...Typography.bodySmall,
        color: Colors.textPrimary,
    },
    hudTitleGroup: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.xs + 2,
        flex: 1,
        paddingHorizontal: Spacing.sm,
    },
    hudTitleGroupMobile: {
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 1,
        paddingRight: 0,
    },
    hudCodeText: {
        ...Typography.badge,
        color: Colors.accentPrimary,
    },
    hudSectionTitle: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        flexShrink: 1,
    },
    hudSectionTitleMobile: {
        color: Colors.textPrimary,
        fontFamily: Typography.bodySemiBold.fontFamily,
        fontSize: 13,
        lineHeight: 17,
    },
    hudRightBalanceSpacer: {
        width: 72,
    },
    progressTrack: {
        height: 2,
        width: "100%",
        backgroundColor: Colors.borderSubtle,
    },
    progressFill: {
        height: "100%",
        backgroundColor: Colors.accentPrimary,
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
    fullImageVignette: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(14, 12, 10, 0.32)",
    },

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
    coverKicker: {
        ...Typography.coordinate,
        color: Colors.accentPrimary,
        textAlign: "center",
        marginBottom: Spacing.xs,
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
    splitTrackBackdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: Colors.bgPrimary,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 48,
        overflow: "hidden",
    },
    splitSlideRoot: {
        width: "100%",
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 48,
        borderColor: Colors.borderSubtle,
    },
    sequenceStepBadge: {
        backgroundColor: Colors.bgElevated,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: Radii.sm,
        borderWidth: 1,
        borderColor: Colors.borderStrong,
    },
    sequenceStepBadgeText: {
        ...Typography.badge,
        color: Colors.accentPrimary,
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
        gap: Spacing.md,
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

    /* Text Only Slide */
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
    fullImageSlideRoot: {
        width: "100%",
        justifyContent: "space-between",
        paddingTop: 56,
        paddingBottom: 64,
    },
    fullImageTopCredit: {
        paddingHorizontal: Spacing.lg,
    },
    fullImageCreditRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        backgroundColor: "rgba(20, 17, 15, 0.78)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: Radii.sm,
    },
    fullImageCreditText: {
        ...Typography.bodySmall,
        fontSize: 12,
        color: Colors.textSecondary,
    },
    fullImageBottomOverlay: {
        width: "100%",
    },
    fullImageBottomOverlayDesktop: {
        paddingLeft: Spacing.xxxl,
        paddingRight: Spacing.xl,
    },
    fullImageBottomOverlayMobile: {
        paddingHorizontal: Spacing.md,
    },
    fullImageTextBackdrop: {
        maxWidth: 480,
        backgroundColor: "rgba(20, 17, 15, 0.86)",
        borderLeftWidth: 3,
        borderLeftColor: Colors.accentPrimary,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: Radii.md,
    },
    fullImageOverlayTitle: {
        ...Typography.h2,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    fullImageOverlayBodyText: {
        ...Typography.body,
        color: Colors.textPrimary,
    },

    metaBadgeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        marginBottom: Spacing.xs + 2,
    },
    stepYearText: {
        ...Typography.coordinate,
        color: Colors.accentPrimary,
    },
    brazilBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: Colors.accentBrazilMuted,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: Radii.sm,
        borderWidth: 1,
        borderColor: Colors.accentBrazil,
    },
    brazilBadgeText: {
        ...Typography.badge,
        color: Colors.accentBrazil,
    },
    brazilHighlightBorder: {
        borderLeftWidth: 3,
        borderLeftColor: Colors.accentBrazil,
        paddingLeft: Spacing.md,
    },
    stepHeading: {
        ...Typography.h1,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    editorialBodyText: {
        ...Typography.body,
        color: Colors.textPrimary,
        lineHeight: 26,
    },
    footerSlide: {
        width: "100%",
        backgroundColor: Colors.bgPrimary,
        alignItems: "center",
        justifyContent: "center",
        padding: Spacing.xl,
    },
    footerCard: {
        maxWidth: 520,
        width: "100%",
        backgroundColor: Colors.bgSurface,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        borderRadius: Radii.lg,
        padding: Spacing.xl,
        alignItems: "center",
    },
    footerBadge: {
        ...Typography.badge,
        color: Colors.accentPrimary,
        marginBottom: Spacing.xs,
    },
    footerTitle: {
        ...Typography.h2,
        color: Colors.textPrimary,
        textAlign: "center",
        marginBottom: Spacing.xs,
    },
    footerSubtitle: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        textAlign: "center",
        marginBottom: Spacing.lg,
    },
    footerActionsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: Spacing.md,
        width: "100%",
    },
    footerPrimaryBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs + 2,
        backgroundColor: Colors.accentPrimary,
        paddingVertical: 12,
        paddingHorizontal: Spacing.lg,
        borderRadius: Radii.md,
        ...Platform.select({web: {cursor: "pointer" as any}}),
    },
    footerPrimaryBtnText: {
        ...Typography.bodySemiBold,
        fontSize: 14,
        color: Colors.textInverse,
    },
    footerSecondaryBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
        backgroundColor: Colors.bgPrimary,
        borderWidth: 1,
        borderColor: Colors.borderStrong,
        paddingVertical: 12,
        paddingHorizontal: Spacing.md,
        borderRadius: Radii.md,
        ...Platform.select({web: {cursor: "pointer" as any}}),
    },
    footerSecondaryBtnText: {
        ...Typography.bodySmall,
        color: Colors.textPrimary,
    },
    footerHomeLink: {
        marginTop: Spacing.lg,
        paddingVertical: 4,
        ...Platform.select({web: {cursor: "pointer" as any}}),
    },
    footerHomeLinkText: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        textDecorationLine: "underline",
    },
});