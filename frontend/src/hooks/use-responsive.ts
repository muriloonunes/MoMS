import {useWindowDimensions} from "react-native";
import {Layout} from "@/constants/theme";

export function useResponsive() {
    const { width, height } = useWindowDimensions();
    const { mobile, desktop, wide } = Layout.breakpoints;

    return {
        width,
        height,
        isMobile: width < mobile,
        isTablet: width >= mobile && width < desktop,
        isDesktop: width >= desktop,
        isWide: width >= wide,
    };
}