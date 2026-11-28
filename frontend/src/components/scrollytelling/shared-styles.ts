import {StyleSheet} from "react-native";
import {Colors, Spacing, Typography} from "@/constants/theme";

/**
 * Estilos compartilhados entre as camadas de palco e os slides narrativos (`split`, `text-only` e `full-image`).
 * Centraliza o preenchimento absoluto das camadas fixas e a tipografia/destaque editorial dos passos.
 */
export const sharedSlideStyles = StyleSheet.create({
    fullBleedLayer: {
        ...StyleSheet.absoluteFill,
    },
    fullBleedImage: {
        width: "100%",
        height: "100%",
    },
    /** Linha de metadados superior do passo (ex.: ano histórico e ícone da bandeira do Brasil quando não há título). */
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
    brazilHighlightBorder: {
        borderLeftWidth: 3,
        borderLeftColor: Colors.accentBrazil,
        paddingLeft: Spacing.md,
    },
    headingWithFlagRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: Spacing.md,
    },
    stepHeadingInline: {
        ...Typography.h1,
        color: Colors.textPrimary,
        flexShrink: 1,
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
});
