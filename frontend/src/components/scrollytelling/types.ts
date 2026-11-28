import {ImageSourcePropType} from "react-native";
import {SectionData} from "@/data/museum-section";

/**
 * Propriedades principais do palco de scrollytelling.
 */
export interface ScrollytellingStageProps {
    /** Dados completos da seção histórica ativa (capa, passos narrativos e fontes). */
    section: SectionData;
    /** Callback acionado para retornar à tela inicial da linha do tempo. */
    onBackHome: () => void;
    /** Callback opcional para navegar diretamente para outra seção (anterior ou próxima). */
    onSelectSection?: (sectionId: SectionData["sectionId"]) => void;
}

/**
 * Representa um estado de câmera (keyframe) dentro de uma trilha de imagem em tela cheia (`full-image`).
 * Cada keyframe corresponde a uma página vertical do scroll.
 */
export interface FullImageKeyframe {
    /** Índice absoluto da página no ScrollView (considerando as páginas de capa). */
    pageIndex: number;
    /** Imagem opcional específica deste passo (permite crossfade entre imagens na mesma sequência). */
    image?: ImageSourcePropType | { uri: string };
    /** Fator de zoom da câmera (1 = sem zoom). */
    scale: number;
    /** Foco horizontal normalizado (-0.5 = borda esquerda, 0 = centro, 0.5 = borda direita). */
    focusX: number;
    /** Foco vertical normalizado (-0.5 = topo, 0 = centro, 0.5 = base). */
    focusY: number;
    /** Indica se o passo definiu uma escala explícita para mobile. */
    hasExplicitMobileScale: boolean;
}

/**
 * Agrupamento de passos consecutivos `full-image` que compartilham a mesma imagem ou `sequenceId`.
 * Enquanto o usuário rola entre os keyframes da trilha, a camada de imagem permanece fixa na tela
 * interpolando suavemente o zoom e o deslocamento (pan) da câmera.
 */
export interface FullImageTrack {
    /** Identificador único da trilha (geralmente o ID do primeiro passo da sequência). */
    id: string;
    /** Identificador opcional de sequência compartilhado entre passos consecutivos. */
    sequenceId?: string;
    /** Imagem base da trilha. */
    image?: ImageSourcePropType | { uri: string };
    /** Título de referência usado como fallback visual caso a imagem ainda não esteja disponível. */
    title?: string;
    /** Lista ordenada de poses de câmera associadas a cada página da sequência. */
    keyframes: FullImageKeyframe[];
}

/**
 * Representa um estado de câmera (keyframe) dentro de uma trilha de layout dividido (`split`).
 */
export interface SplitKeyframe {
    /** Índice absoluto da página no ScrollView. */
    pageIndex: number;
    /** ID do StoryStep correspondente a este keyframe. */
    stepId: string;
    /** Imagem exibida neste passo (permite trocar ou manter a imagem ao longo da sequência). */
    image?: ImageSourcePropType | { uri: string };
    /** Legenda editorial exibida abaixo da moldura da imagem. */
    imageCaption?: string;
    /** Título do passo narrativo. */
    title?: string;
    /** Fator de zoom aplicado dentro da moldura da imagem. */
    scale: number;
    /** Foco horizontal normalizado (-0.5 a 0.5). */
    focusX: number;
    /** Foco vertical normalizado (-0.5 a 0.5). */
    focusY: number;
}

/**
 * Agrupamento de passos consecutivos `split` que mantêm a imagem fixa em um dos lados (desktop)
 * ou no topo da tela (mobile) enquanto o texto rola e a câmera aplica zoom/pan na figura.
 */
export interface SplitTrack {
    /** Identificador único da trilha. */
    id: string;
    /** Identificador opcional de sequência para agrupar passos com imagens distintas na mesma moldura. */
    sequenceId?: string;
    /** Lado em que o painel de imagem é posicionado no desktop (`left` ou `right`). */
    imagePosition: "left" | "right";
    /** Modo de ajuste da imagem dentro da moldura (`contain` preserva a imagem inteira; `cover` preenche). */
    imageFit: "contain" | "cover";
    /** Proporção fixa opcional (`largura / altura`); se omitida, a proporção natural da imagem é medida no carregamento. */
    imageAspectRatio?: number;
    /** Lista ordenada de keyframes pertencentes a esta sequência dividida. */
    keyframes: SplitKeyframe[];
}

/**
 * Metadados associados a cada passo `split` para saber sua posição relativa dentro de uma sequência.
 * Usado para desenhar bordas divisórias apenas no início e no fim da sequência.
 */
export interface SplitStepMeta {
    /** ID da trilha à qual o passo pertence. */
    trackId: string;
    /** Índice do passo dentro da trilha (0 para o primeiro). */
    stepIndexInTrack: number;
    /** Quantidade total de passos agrupados na mesma trilha. */
    totalInTrack: number;
}
