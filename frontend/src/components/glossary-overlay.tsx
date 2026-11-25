import {GlossaryEntry} from "@/data/glossary";
import {BookOpen, X} from "lucide-react-native";
import {Modal, Platform, Pressable, StyleSheet, Text, View} from "react-native";
import {Colors, Radii, Shadows, Spacing, Typography} from "@/constants/theme";

export interface ActiveGlossaryState {
    entry: GlossaryEntry;
    anchor?: { x: number; y: number };
}

const CATEGORY_LABELS: Record<GlossaryEntry["category"], string> = {
    conceito: "CONCEITO",
    pessoa: "PERSONALIDADE",
    organizacao: "ORGANIZAÇÃO",
    tecnica: "TÉCNICA",
};

export function GlossaryOverlay({
                                    activeState,
                                    isDesktop,
                                    viewportWidth,
                                    viewportHeight,
                                    onHoverEnter,
                                    onHoverLeave,
                                    onClose,
                                }: {
    activeState: ActiveGlossaryState | null;
    isDesktop: boolean;
    viewportWidth: number;
    viewportHeight: number;
    onHoverEnter: () => void;
    onHoverLeave: () => void;
    onClose: () => void;
}) {
    if (!activeState) return null;
    const {entry, anchor} = activeState;
    const categoryLabel = CATEGORY_LABELS[entry.category] ?? "GLOSSÁRIO";

    if (isDesktop && anchor) {
        const cardWidth = 340;
        const clampedLeft = Math.max(
            16,
            Math.min(anchor.x - cardWidth / 2, viewportWidth - cardWidth - 24)
        );
        const showAbove = anchor.y > viewportHeight * 0.62;
        const topPosition = showAbove
            ? Math.max(70, anchor.y - 190)
            : Math.min(viewportHeight - 200, anchor.y + 18);

        const webMouseProps =
            Platform.OS === "web"
                ? {onMouseEnter: onHoverEnter, onMouseLeave: onHoverLeave}
                : {};

        return (
            <View
                style={[
                    styles.desktopPopoverCard,
                    {width: cardWidth, left: clampedLeft, top: topPosition},
                ]}
                {...(webMouseProps as any)}
            >
                <View style={styles.glossaryCardHeader}>
                    <View style={styles.glossaryCategoryRow}>
                        <BookOpen size={13} color={Colors.accentPrimary}/>
                        <Text style={styles.glossaryCategoryText}>{categoryLabel}</Text>
                    </View>

                    <Pressable onPress={onClose} hitSlop={8} style={styles.glossaryCloseBtn}>
                        <X size={14} color={Colors.textSecondary}/>
                    </Pressable>
                </View>

                <Text style={styles.glossaryTermTitle}>{entry.term}</Text>
                {entry.extraInfo && (
                    <Text style={styles.glossaryExtraInfoText}>{entry.extraInfo}</Text>
                )}
                <Text style={styles.glossaryDescriptionText}>{entry.summary}</Text>
            </View>
        );
    }

    return (
        <Modal
            visible={!!activeState}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                style={[styles.modalBackdrop, !isDesktop && styles.modalBackdropMobile]}
                onPress={onClose}
            >
                <Pressable
                    style={[styles.glossaryCard, !isDesktop && styles.glossaryCardMobile]}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={styles.glossaryCardHeader}>
                        <View style={styles.glossaryCategoryRow}>
                            <BookOpen size={13} color={Colors.accentPrimary}/>
                            <Text style={styles.glossaryCategoryText}>{categoryLabel}</Text>
                        </View>

                        <Pressable onPress={onClose} hitSlop={10} style={styles.glossaryCloseBtn}>
                            <X size={16} color={Colors.textSecondary}/>
                        </Pressable>
                    </View>

                    <Text style={styles.glossaryTermTitle}>{entry.term}</Text>
                    {entry.extraInfo && (
                        <Text style={styles.glossaryExtraInfoText}>{entry.extraInfo}</Text>
                    )}
                    <Text style={styles.glossaryDescriptionText}>{entry.summary}</Text>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    desktopPopoverCard: {
        position: "absolute",
        zIndex: 100,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1,
        borderColor: Colors.borderStrong,
        borderRadius: Radii.md,
        padding: Spacing.md,
        ...Shadows.modal,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: Colors.bgOverlay,
        alignItems: "center",
        justifyContent: "center",
        padding: Spacing.lg,
    },
    modalBackdropMobile: {
        justifyContent: "flex-end",
        padding: 0,
    },
    glossaryCard: {
        maxWidth: 420,
        width: "100%",
        backgroundColor: Colors.bgElevated,
        borderWidth: 1,
        borderColor: Colors.borderStrong,
        borderRadius: Radii.lg,
        padding: Spacing.lg,
        ...Shadows.modal,
    },
    glossaryCardMobile: {
        maxWidth: "100%",
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingBottom: Spacing.xxl,
    },
    glossaryCardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: Spacing.xs,
    },
    glossaryCategoryRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    glossaryCategoryText: {
        ...Typography.badge,
        color: Colors.accentPrimary,
    },
    glossaryCloseBtn: {
        padding: 4,
        ...Platform.select({web: {cursor: "pointer" as any}}),
    },
    glossaryTermTitle: {
        ...Typography.h3,
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    glossaryExtraInfoText: {
        ...Typography.coordinate,
        fontSize: 11,
        color: Colors.accentPrimary,
        marginBottom: Spacing.xs + 2,
    },
    glossaryDescriptionText: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
})