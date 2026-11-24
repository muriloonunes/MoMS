import {ScrollView, StyleSheet, View, ViewProps} from "react-native";
import React from "react";
import {Colors, Layout, Spacing} from "@/constants/theme";
import {useResponsive} from "@/hooks/use-responsive";
import {SafeAreaView} from "react-native-safe-area-context";

interface ScreenContainerProps extends ViewProps {
    children: React.ReactNode
    maxWidth?: number,
    scrollable?: boolean,
    fullBleed?: boolean
}

export function ScreenContainer({
                                    children,
                                    maxWidth = Layout.maxContentWidth,
                                    scrollable = true,
                                    fullBleed = false,
                                    style,
                                    ...rest
                                }: ScreenContainerProps) {
    const {isDesktop} = useResponsive()
    const padding = isDesktop ? Spacing.xl : Spacing.md

    const content = (
        <View
            style={[
                styles.container,
                !fullBleed && {
                    maxWidth,
                    paddingHorizontal: padding,
                },
                style,
            ]}
            {...rest}
        >
            {children}
        </View>
    );

    return (
        <SafeAreaView style={styles.root}>
            {scrollable ? (
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        !fullBleed && {
                            paddingTop: isDesktop ? Spacing.xl : Spacing.md,
                            paddingBottom: Spacing.xxxl,
                        }
                    ]}
                    showsVerticalScrollIndicator={isDesktop}
                >
                    {content}
                </ScrollView>
            ) : (
                <View style={styles.fixedContent}>
                    {content}
                </View>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.bgPrimary
    },
    scrollContent: {
        flexGrow: 1,
    },
    fixedContent: {
        flex: 1
    },
    container: {
        flex: 1,
        width: "100%",
        alignSelf: "center",
    }
})