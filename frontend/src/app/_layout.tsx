import {Stack} from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import {useFonts} from "expo-font";
import {Inter_400Regular, Inter_500Medium, Inter_600SemiBold,} from '@expo-google-fonts/inter';
import {SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold,} from '@expo-google-fonts/space-grotesk';
import {
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import {useEffect} from "react";
import {StatusBar} from "expo-status-bar";
import {Colors} from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        SpaceGrotesk_600SemiBold,
        SpaceGrotesk_700Bold,
        JetBrainsMono_400Regular,
        JetBrainsMono_500Medium,
        JetBrainsMono_700Bold,
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <>
            <StatusBar style='light'/>
            <Stack screenOptions={{
                headerShown: false,
                contentStyle: {backgroundColor: Colors.bgPrimary},
            }}/>
        </>
    );
}
