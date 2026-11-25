import React, {useMemo, useRef, useState} from "react";
import {ImageSourcePropType, Platform, Pressable, ScrollView, StyleSheet, Text, View,} from "react-native";
import {Image} from "expo-image";
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    SharedValue,
    useAnimatedRef,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import {ArrowLeft, ArrowRight, ChevronDown, ChevronUp, ImageIcon, Info, MapPin,} from "lucide-react-native";
import {Colors, Layout, Radii, Shadows, Spacing, Typography} from "@/constants/theme";
import {useResponsive} from "@/hooks/use-responsive";
import {SectionData, StoryStep} from "@/data/museum-section";
import {GLOSSARY, GlossaryEntry} from "@/data/glossary";
import {GlossaryOverlay, ActiveGlossaryState} from "@/components/glossary-overlay";

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
            runOnJS(updatePageIndex)(event.contentOffset.y);
        },
    });

    const scrollToPage = (targetIndex: number) => {
        const clamped = Math.max(0, Math.min(totalPages - 1, targetIndex));
        setCurrentPageIndex(clamped);
        scrollRef.current?.scrollTo({
            y: clamped * stageHeight,
            animated: true,
        });
    };

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
                        <Text style={styles.hudBackText}>Início</Text>
                    </Pressable>

                    <View style={styles.hudTitleGroup}>
                        <Text style={styles.hudCodeText}>{section.code}</Text>
                        <Text style={styles.hudDot}>•</Text>
                        <Text style={styles.hudSectionTitle} numberOfLines={1}>
                            {section.title}
                        </Text>
                    </View>

                    <View style={styles.hudStepBadge}>
                    </View>
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

                    {section.steps.map((step, index) => {
                        if (step.layout !== "full-image") return null;
                        const pageIndex = coverPagesCount + index;
                        const prevStep = index > 0 ? section.steps[index - 1] : undefined;
                        return (
                            <FullImageBackdropLayer
                                key={step.id}
                                step={step}
                                prevStep={prevStep}
                                pageIndex={pageIndex}
                                pageHeight={stageHeight}
                                stageWidth={width}
                                stageHeight={stageHeight}
                                scrollY={scrollY}
                            />
                        );
                    })}
                </View>

                <Animated.ScrollView
                    ref={scrollRef}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={isDesktop}
                    snapToInterval={!isDesktop ? stageHeight : undefined}
                    snapToAlignment="start"
                    decelerationRate={!isDesktop ? "fast" : "normal"}
                >
                    <View style={{height: stageHeight * coverPagesCount}} pointerEvents="none"/>

                    {section.steps.map((step) => {
                        if (step.layout === "split") {
                            return (
                                <SplitStorySlide
                                    key={step.id}
                                    step={step}
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

        const opacity = interpolate(
            scrollY.value,
            [coverEndScroll + pageHeight * 0.6, coverEndScroll + pageHeight],
            [1, 0],
            Extrapolation.CLAMP
        );

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
                        <Text style={styles.coverKicker}>
                            {section.code} • {section.period}
                        </Text>
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

function FullImageBackdropLayer({
                                    step,
                                    prevStep,
                                    pageIndex,
                                    pageHeight,
                                    stageWidth,
                                    stageHeight,
                                    scrollY,
                                }: {
    step: StoryStep;
    prevStep?: StoryStep;
    pageIndex: number;
    pageHeight: number;
    stageWidth: number;
    stageHeight: number;
    scrollY: SharedValue<number>;
}) {
    const centerScroll = pageIndex * pageHeight;
    const prevScroll = (pageIndex - 1) * pageHeight;
    const nextScroll = (pageIndex + 1) * pageHeight;

    const targetScale = step.camera?.scale ?? 1;
    const targetFocusX = step.camera?.focusX ?? 0;
    const targetFocusY = step.camera?.focusY ?? 0;

    const isSameImageAsPrev =
        prevStep?.layout === "full-image" &&
        JSON.stringify(prevStep.image) === JSON.stringify(step.image);

    const startScale = isSameImageAsPrev ? (prevStep?.camera?.scale ?? 1) : 1.0;
    const startFocusX = isSameImageAsPrev ? (prevStep?.camera?.focusX ?? 0) : 0;
    const startFocusY = isSameImageAsPrev ? (prevStep?.camera?.focusY ?? 0) : 0;

    const animatedImageStyle = useAnimatedStyle(() => {
        const opacity = isSameImageAsPrev
            ? interpolate(
                scrollY.value,
                [prevScroll + pageHeight * 0.45, prevScroll + pageHeight * 0.55, nextScroll - pageHeight * 0.25, nextScroll + pageHeight * 0.25],
                [0, 1, 1, 0],
                Extrapolation.CLAMP
            )
            : interpolate(
                scrollY.value,
                [prevScroll + pageHeight * 0.2, centerScroll - pageHeight * 0.15, centerScroll, nextScroll - pageHeight * 0.2, nextScroll + pageHeight * 0.25],
                [0, 1, 1, 1, 0],
                Extrapolation.CLAMP
            );

        const scale = interpolate(
            scrollY.value,
            [prevScroll, centerScroll],
            [startScale, targetScale],
            Extrapolation.CLAMP
        );

        const focusX = interpolate(
            scrollY.value,
            [prevScroll, centerScroll],
            [startFocusX, targetFocusX],
            Extrapolation.CLAMP
        );

        const focusY = interpolate(
            scrollY.value,
            [prevScroll, centerScroll],
            [startFocusY, targetFocusY],
            Extrapolation.CLAMP
        );

        const maxOffsetX = stageWidth * (scale - 1) * 0.5;
        const maxOffsetY = stageHeight * (scale - 1) * 0.5;
        const translateX = -focusX * 2 * maxOffsetX;
        const translateY = -focusY * 2 * maxOffsetY;

        return {
            opacity,
            transform: [{translateX}, {translateY}, {scale}],
        };
    });

    const validImage = hasValidImage(step.image);

    return (
        <Animated.View style={[styles.fullBleedLayer, animatedImageStyle]}>
            {validImage ? (
                <Image
                    source={step.image as any}
                    style={styles.fullBleedImage}
                    contentFit="cover"
                />
            ) : (
                <View style={styles.backdropPlaceholder}>
                    <ImageIcon size={48} color={Colors.borderStrong}/>
                    <Text style={styles.placeholderTitle}>
                        {step.title ?? "Imagem Histórica em Curadoria"}
                    </Text>
                    <Text style={styles.placeholderCoords}>
                        CÂMERA: ZOOM {targetScale.toFixed(1)}x • X {targetFocusX} • Y {targetFocusY}
                    </Text>
                </View>
            )}
            <View style={styles.fullImageVignette}/>
        </Animated.View>
    );
}

function SplitStorySlide({
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
    const imageOnLeft = step.imagePosition === "left";
    const validImage = hasValidImage(step.image);

    const textBody = (
        <View style={styles.splitTextInner}>
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

    const imageBlock = (
        <View
            style={[
                styles.splitImagePane,
                isDesktop ? {minHeight: pageHeight * 0.72} : {height: pageHeight * 0.42},
            ]}
        >
            <View style={[styles.splitImageFrame, !isDesktop && {aspectRatio: undefined, flex: 1}]}>
                {validImage ? (
                    <Image
                        source={step.image as any}
                        style={styles.splitImage}
                        contentFit="cover"
                    />
                ) : (
                    <View style={styles.splitImagePlaceholder}>
                        <ImageIcon size={32} color={Colors.textMuted}/>
                        <Text style={styles.placeholderCaptionText}>
                            {step.imageCaption ?? step.title ?? "Registro Fotográfico"}
                        </Text>
                    </View>
                )}
            </View>
            {step.imageCaption && (
                <View style={styles.captionRow}>
                    <Info size={12} color={Colors.textMuted}/>
                    <Text style={styles.captionText} numberOfLines={1}>
                        {step.imageCaption}
                    </Text>
                </View>
            )}
        </View>
    );

    if (!isDesktop) {
        return (
            <View style={[styles.splitSlideRoot, {height: pageHeight, paddingVertical: Spacing.md}]}>
                <View style={styles.splitColMobile}>
                    {imageBlock}
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
        <View style={[styles.splitSlideRoot, {minHeight: pageHeight}]}>
            <View style={[styles.splitSlideContainer, styles.splitRowDesktop]}>
                {imageOnLeft ? (
                    <>
                        {imageBlock}
                        {textColumn}
                    </>
                ) : (
                    <>
                        {textColumn}
                        {imageBlock}
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

/**
 * Parser de Glossário
 */
function RichGlossaryText({
                              text,
                              style,
                              isDesktop,
                              onSelectGlossary,
                              onLeaveGlossary,
                          }: {
    text: string;
    style?: any;
    isDesktop: boolean;
    onSelectGlossary: (entry: GlossaryEntry, anchor?: { x: number; y: number }) => void;
    onLeaveGlossary: () => void;
}) {
    const segments = useMemo(() => {
        const result: Array<{
            type: "text" | "glossary";
            content: string;
            entry?: GlossaryEntry;
        }> = [];

        const pattern =
            /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]|\(([^)]+)\)\[Gloss[áa]rio(?::\s*([^\]]+))?\]/gi;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = pattern.exec(text)) !== null) {
            if (match.index > lastIndex) {
                result.push({
                    type: "text",
                    content: text.slice(lastIndex, match.index),
                });
            }

            if (match[1]) {
                const rawId = match[1].trim().toLowerCase();
                const label = (match[2] ?? match[1]).trim();
                const entry: GlossaryEntry = GLOSSARY[rawId] ?? {
                    id: rawId,
                    term: label,
                    category: "conceito",
                    summary: "Verbete em catalogação pela equipe de curadoria do MoMS.",
                };
                result.push({type: "glossary", content: label, entry});
            } else if (match[3]) {
                const label = match[3].trim();
                const inlineExplanation = match[4]?.trim();
                const normalizedKey = label
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, "-");

                const catalogEntry = GLOSSARY[normalizedKey];
                const entry: GlossaryEntry = catalogEntry
                    ? {...catalogEntry, summary: inlineExplanation ?? catalogEntry.summary}
                    : {
                        id: normalizedKey,
                        term: label.charAt(0).toUpperCase() + label.slice(1),
                        category: "conceito",
                        summary:
                            inlineExplanation ??
                            "Verbete em catalogação pela equipe de curadoria do MoMS.",
                    };

                result.push({type: "glossary", content: label, entry});
            }

            lastIndex = pattern.lastIndex;
        }

        if (lastIndex < text.length) {
            result.push({type: "text", content: text.slice(lastIndex)});
        }

        return result;
    }, [text]);

    const extractAnchorFromEvent = (e: any): { x: number; y: number } | undefined => {
        const native = e?.nativeEvent ?? e;
        const x = native?.clientX ?? native?.pageX;
        const y = native?.clientY ?? native?.pageY;
        if (typeof x === "number" && typeof y === "number") return {x, y};
        return undefined;
    };

    return (
        <Text style={style}>
            {segments.map((seg, idx) => {
                if (seg.type === "text" || !seg.entry) {
                    return <Text key={idx}>{seg.content}</Text>;
                }

                const entry = seg.entry;
                const webHoverProps =
                    Platform.OS === "web" && isDesktop
                        ? {
                            onMouseEnter: (e: any) =>
                                onSelectGlossary(entry, extractAnchorFromEvent(e)),
                            onMouseLeave: () => onLeaveGlossary(),
                        }
                        : {};

                return (
                    <Text
                        key={idx}
                        onPress={(e: any) =>
                            onSelectGlossary(entry, extractAnchorFromEvent(e))
                        }
                        style={styles.glossaryInlineTerm}
                        {...(webHoverProps as any)}
                    >
                        {seg.content}
                    </Text>
                );
            })}
        </Text>
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
        gap: Spacing.xs + 2,
        flexShrink: 1,
        paddingHorizontal: Spacing.sm,
    },
    hudCodeText: {
        ...Typography.badge,
        color: Colors.accentPrimary,
    },
    hudDot: {
        color: Colors.textMuted,
    },
    hudSectionTitle: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
    },
    hudStepBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: Radii.sm,
        backgroundColor: Colors.bgSurface,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
    },
    hudStepBadgeText: {
        ...Typography.coordinate,
        color: Colors.textSecondary,
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

    /* Split Slide */
    splitSlideRoot: {
        width: "100%",
        backgroundColor: Colors.bgPrimary,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 48,
        borderTopWidth: 1,
        borderBottomWidth: 1,
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
        flex: 0.52,
        justifyContent: "center",
        paddingHorizontal: Spacing.lg,
    },
    splitImageFrame: {
        width: "100%",
        aspectRatio: 4 / 3,
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
    glossaryInlineTerm: {
        color: Colors.accentPrimaryHover,
        fontFamily: Typography.bodySemiBold.fontFamily,
        textDecorationLine: "underline",
        textDecorationStyle: "dotted",
        textDecorationColor: Colors.accentPrimary,
        ...Platform.select({web: {cursor: "pointer" as any}}),
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