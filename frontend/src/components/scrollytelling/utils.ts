import {ImageSourcePropType} from "react-native";
import {SectionSource, StoryStep} from "@/data/museum-section";
import {FullImageTrack, SplitStepMeta, SplitTrack} from "./types";

/**
 * Normaliza a configuração de câmera de um passo narrativo de acordo com o dispositivo (desktop vs mobile).
 *
 * - Um passo pode não ter câmera definida (retorna pose neutra: scale 1, foco 0,0).
 * - Pode definir poses separadas `{ desktop, mobile }`, onde o mobile herda os valores do desktop
 *   caso algum eixo não seja sobrescrito.
 * - Ou pode definir uma pose única `{ scale, focusX, focusY }` compartilhada entre ambos.
 */
export function resolveCameraPose(
    camera: StoryStep["camera"],
    isDesktop: boolean
): { scale: number; focusX: number; focusY: number; hasExplicitMobileScale: boolean } {
    if (!camera) {
        return {scale: 1, focusX: 0, focusY: 0, hasExplicitMobileScale: false};
    }

    if ("desktop" in camera) {
        const base = camera.desktop;
        if (isDesktop || !camera.mobile) {
            return {
                scale: base.scale ?? 1,
                focusX: base.focusX ?? 0,
                focusY: base.focusY ?? 0,
                hasExplicitMobileScale: false,
            };
        }
        return {
            scale: camera.mobile.scale ?? base.scale ?? 1,
            focusX: camera.mobile.focusX ?? base.focusX ?? 0,
            focusY: camera.mobile.focusY ?? base.focusY ?? 0,
            hasExplicitMobileScale: camera.mobile.scale !== undefined,
        };
    }

    return {
        scale: camera.scale ?? 1,
        focusX: camera.focusX ?? 0,
        focusY: camera.focusY ?? 0,
        hasExplicitMobileScale: false,
    };
}

/**
 * Verifica se a fonte de imagem fornecida é válida para renderização pelo `expo-image`.
 * Aceita tanto assets locais empacotados via `require()` (number) quanto objetos `{ uri: string }` não vazios.
 */
export function hasValidImage(image?: ImageSourcePropType | { uri: string }): boolean {
    if (!image) return false;
    if (typeof image === "number") return true;
    if (typeof image === "object" && "uri" in image) {
        return typeof image.uri === "string" && image.uri.trim().length > 0;
    }
    return false;
}

/**
 * Normaliza uma fonte bibliográfica da seção (`SectionSource`), que pode ser cadastrada como
 * uma string simples de URL ou um objeto `{ url, label }`.
 * Extrai automaticamente o domínio limpo (sem `www.`) para exibição caso nenhum `label` tenha sido informado.
 */
export function normalizeSource(source: SectionSource): { label: string; url: string; domain: string } {
    const rawUrl = typeof source === "string" ? source : source.url;
    let domain: string;
    try {
        const parsed = new URL(rawUrl);
        domain = parsed.hostname.replace(/^www\./, "");
    } catch {
        domain = rawUrl;
    }

    const customLabel = typeof source === "object" && source.label ? source.label.trim() : "";
    return {
        label: customLabel || domain,
        url: rawUrl,
        domain,
    };
}

/**
 * Agrupa passos consecutivos com `layout: "full-image"` em trilhas contínuas (`FullImageTrack[]`).
 *
 * - Percorre todos os passos da seção calculando o índice de página real (`coverPagesCount + index`).
 * - Se o passo atual e o anterior forem ambos `full-image` e compartilharem o mesmo `sequenceId`
 *   (ou exatamente a mesma imagem), o passo atual é anexado como um novo keyframe na trilha anterior.
 * - Isso permite que a imagem de fundo permaneça estacionária na viewport enquanto a câmera
 *   executa movimentos de zoom/pan ou crossfade entre os passos agrupados.
 */
export function buildFullImageTracks(
    steps: StoryStep[],
    coverPagesCount: number,
    isDesktop: boolean
): FullImageTrack[] {
    const tracks: FullImageTrack[] = [];

    steps.forEach((step, index) => {
        if (step.layout !== "full-image") return;
        const pageIndex = coverPagesCount + index;
        const prevStep = index > 0 ? steps[index - 1] : undefined;

        // Junta na mesma trilha se o passo anterior também for full-image e tiver o mesmo sequenceId ou mesma imagem
        const sameTrackAsPrev =
            prevStep?.layout === "full-image" &&
            ((step.sequenceId && prevStep.sequenceId === step.sequenceId) ||
                JSON.stringify(prevStep.image) === JSON.stringify(step.image));

        const resolved = resolveCameraPose(step.camera, isDesktop);
        const pose = {
            pageIndex,
            image: step.image,
            scale: resolved.scale,
            focusX: resolved.focusX,
            focusY: resolved.focusY,
            hasExplicitMobileScale: resolved.hasExplicitMobileScale,
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
}

/**
 * Agrupa passos consecutivos com `layout: "split"` em trilhas (`SplitTrack[]`) e gera um mapa de metadados
 * (`splitStepMeta`) indexado pelo ID de cada passo.
 *
 * - Dois passos `split` consecutivos são unidos na mesma trilha quando compartilham a mesma posição
 *   de imagem (`left` ou `right`) e possuem o mesmo `sequenceId` ou a mesma imagem.
 * - Ao final, constrói `metaMap` informando a posição de cada passo dentro da trilha (`stepIndexInTrack`
 *   e `totalInTrack`), permitindo que o slide de texto desenhe bordas divisórias apenas no primeiro
 *   e no último passo de uma sequência contínua.
 */
export function buildSplitTracks(
    steps: StoryStep[],
    coverPagesCount: number,
    isDesktop: boolean
): { splitTracks: SplitTrack[]; splitStepMeta: Record<string, SplitStepMeta> } {
    const tracks: SplitTrack[] = [];
    const metaMap: Record<string, SplitStepMeta> = {};

    steps.forEach((step, index) => {
        if (step.layout !== "split") return;
        const pageIndex = coverPagesCount + index;
        const prevStep = index > 0 ? steps[index - 1] : undefined;
        const pos = step.imagePosition ?? "right";
        const prevPos = prevStep?.imagePosition ?? "right";

        // Só agrupa se ambos forem split, estiverem do mesmo lado e compartilharem sequenceId ou imagem
        const sameTrackAsPrev =
            prevStep?.layout === "split" &&
            pos === prevPos &&
            ((step.sequenceId && prevStep.sequenceId === step.sequenceId) ||
                JSON.stringify(prevStep.image) === JSON.stringify(step.image));

        const resolved = resolveCameraPose(step.camera, isDesktop);
        const keyframe = {
            pageIndex,
            stepId: step.id,
            image: step.image,
            imageCaption: step.imageCaption,
            title: step.title,
            scale: resolved.scale,
            focusX: resolved.focusX,
            focusY: resolved.focusY,
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

    // Registra a posição relativa de cada passo dentro de sua trilha
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
}
