import React from "react";
import {Platform, Pressable, StyleSheet, Text, View} from "react-native";
import Animated from "react-native-reanimated";
import {ArrowLeft} from "lucide-react-native";
import {Colors, Radii, Spacing, Typography} from "@/constants/theme";
import {SectionData} from "@/data/museum-section";

/**
 * Barra superior fixa (HUD) exibida durante toda a leitura da seção.
 *
 * Contém:
 * - Botão de retorno à tela inicial;
 * - Código e título da seção ativa (centralizado no desktop, empilhado à esquerda no mobile);
 * - Barra de progresso horizontal de 2px na base que reflete o percentual rolado na seção.
 */
export function TopHud({
                           section,
                           isDesktop,
                           onBackHome,
                           progressBarStyle,
                       }: {
    section: SectionData;
    isDesktop: boolean;
    onBackHome: () => void;
    progressBarStyle: any;
}) {
    return (
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
    );
}

const styles = StyleSheet.create({
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
});
