import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, Path, Pattern, Rect } from 'react-native-svg';
import {Colors} from "@/constants/theme";

export function TopographicBackground() {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
                <Defs>
                    <Pattern id="geoGrid" width="80" height="80" patternUnits="userSpaceOnUse">
                        <Path
                            d="M 80 0 L 0 0 0 80"
                            fill="none"
                            stroke={Colors.accentMap}
                            strokeWidth="0.6"
                            strokeOpacity="0.22"
                        />
                    </Pattern>
                </Defs>

                <Rect width="100%" height="100%" fill="url(#geoGrid)" />

                <Path
                    d="M -100 180 C 180 120, 320 340, 620 260 C 920 180, 1100 40, 1550 140"
                    fill="none"
                    stroke={Colors.accentMap}
                    strokeWidth="1.2"
                    strokeOpacity="0.35"
                />
                <Path
                    d="M -100 220 C 190 160, 340 380, 640 300 C 940 220, 1120 80, 1550 180"
                    fill="none"
                    stroke={Colors.accentMap}
                    strokeWidth="0.9"
                    strokeOpacity="0.24"
                />
                <Path
                    d="M -80 540 C 240 460, 480 680, 820 560 C 1100 460, 1300 620, 1600 500"
                    fill="none"
                    stroke={Colors.borderSubtle}
                    strokeWidth="1"
                    strokeOpacity="0.5"
                />

                <Circle
                    cx="18%"
                    cy="24%"
                    r="90"
                    fill="none"
                    stroke={Colors.accentBrazil}
                    strokeWidth="0.7"
                    strokeDasharray="4 6"
                    strokeOpacity="0.18"
                />
                <Line
                    x1="18%"
                    y1="14%"
                    x2="18%"
                    y2="34%"
                    stroke={Colors.accentBrazil}
                    strokeWidth="0.6"
                    strokeOpacity="0.15"
                />
            </Svg>
        </View>
    );
}