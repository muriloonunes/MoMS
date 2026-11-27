import React from "react";
import {useLocalSearchParams, useRouter} from "expo-router";
import {ScreenContainer} from "@/components/screen-container";
import {ScrollytellingStage} from "@/components/scrollytelling-stage";
import {SECOES, SectionData} from "@/data/museum-section";
import {Platform} from "react-native";

export default function EraScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ eraId?: string; mode?: string }>();

    const currentId = (params.eraId && SECOES[params.eraId] ? params.eraId : "1") as SectionData["sectionId"];
    const section = SECOES[currentId];

    const handleBackHome = () => {
        if (Platform.OS === "web") {
            router.push("/");
            return;
        }

        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/");
        }
    };

    const handleSelectSection = (nextId: SectionData["sectionId"]) => {
        router.setParams({eraId: nextId});
    };

    return (
        <ScreenContainer fullBleed scrollable={false}>
            <ScrollytellingStage
                key={section.sectionId}
                section={section}
                onBackHome={handleBackHome}
                onSelectSection={handleSelectSection}
            />
        </ScreenContainer>
    );
}
