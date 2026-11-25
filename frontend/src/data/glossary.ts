import {ImageSourcePropType} from "react-native";

export interface GlossaryEntry {
    id: string;
    term: string;                           // Ex: "Criptografia" ou "Alan Turing"
    category: 'conceito' | 'pessoa' | 'organizacao' | 'tecnica';
    summary: string;                        // Ex: "Do grego kryptós (escondido) e gráphein (escrita)..."
    image?: ImageSourcePropType | { uri: string };
    extraInfo?: string;                     // Ex: "1912 – 1954 • Matemático e Criptoanalista"
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
    'cifra-substituicao': {
        id: 'cifra-substituicao',
        term: 'Cifra de Substituição',
        category: 'conceito',
        extraInfo: 'Criptografia Clássica',
        summary: 'Uma cifra é qualquer algoritmo usado para criptografia ou descriptografia. Uma cifra de substituição substitui cada caractere da mensagem a ser criptografada por outro para formar o texto cifrado.',
    },
    'analise-frequencia': {
        id: 'analise-frequencia',
        term: 'Análise de Frequência',
        category: 'tecnica',
        extraInfo: 'Criptoanálise Estatística',
        summary: 'Técnica que estuda a frequência com que letras ou grupos de letras aparecem em um texto cifrado para descobrir o padrão de substituição.',
    },
    'maquina-rotores': {
        id: 'maquina-rotores',
        term: 'Máquina de Rotores',
        category: 'tecnica',
        extraInfo: 'Dispositivo Eletromecânico',
        summary: 'Dispositivo criptográfico composto por discos giratórios com fiações elétricas internas que alteram o alfabeto de substituição a cada tecla pressionada.',
    },
    'alan-turing': {
        id: 'alan-turing',
        term: 'Alan Turing',
        category: 'pessoa',
        extraInfo: '1912 – 1954 • Matemático e Criptoanalista',
        summary: 'Matemático e cientista da computação britânico que liderou a criação da Bombe em Bletchley Park para decifrar mensagens da Máquina Enigma.',
    },
    'aliados': {
        id: 'aliados',
        term: 'Aliados',
        category: 'organizacao',
        extraInfo: 'Segunda Guerra Mundial (1939 – 1945)',
        summary: 'Coalizão militar formada por Reino Unido, União Soviética, Estados Unidos, França, Brasil (FEB) e outras nações contra as Potências do Eixo.',
    },
}