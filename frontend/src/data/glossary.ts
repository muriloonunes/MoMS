import {ImageSourcePropType} from "react-native";

export interface GlossaryEntry {
    id: string;
    term: string;
    category: 'conceito' | 'pessoa' | 'organizacao' | 'tecnica';
    summary: string;
    image?: ImageSourcePropType | { uri: string };
    extraInfo?: string;
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
        summary: 'Técnica que estuda a frequência com que letras ou grupos de letras aparecem em um texto cifrado para descobrir o padrão de substituição.',
    },
    'maquina-rotores': {
        id: 'maquina-rotores',
        term: 'Máquina de Rotores',
        category: 'tecnica',
        summary: 'Dispositivo criptográfico composto por discos giratórios com fiações elétricas internas que alteram o alfabeto de substituição a cada tecla pressionada.',
    },
    'alan-turing': {
        id: 'alan-turing',
        term: 'Alan Turing',
        category: 'pessoa',
        summary: 'Matemático e cientista da computação britânico que liderou a criação da Bombe em Bletchley Park para decifrar mensagens da Máquina Enigma.',
    },
    'aliados': {
        id: 'aliados',
        term: 'Aliados',
        category: 'organizacao',
        extraInfo: 'Segunda Guerra Mundial (1939 – 1945)',
        summary: 'Coalizão militar formada por Reino Unido, União Soviética, Estados Unidos, França, Brasil (FEB) e outras nações contra as Potências do Eixo.',
    },
    'teoria-grupos': {
        id: 'teoria-grupos',
        term: 'Teoria dos Grupos',
        category: 'conceito',
        extraInfo: 'Álgebra Abstrata',
        summary: 'Ramo da matemática que estuda estruturas algébricas chamadas grupos, fundamentais para analisar simetrias e permutações — como as trocas de letras realizadas pelos rotores da Máquina Enigma.',
    },
    'bomba-criptologica': {
        id: 'bomba-criptologica',
        term: 'Bomba Criptológica',
        category: 'tecnica',
        extraInfo: 'Bomba (Polônia, 1938)',
        summary: 'Máquina eletromecânica projetada por Marian Rejewski no Biuro Szyfrów polonês. Acoplava seis conjuntos equivalentes à Enigma para encontrar automaticamente a configuração diária dos rotores em cerca de duas horas.',
    },
    'bombe': {
        id: 'bombe',
        term: 'Bombe',
        category: 'tecnica',
        extraInfo: 'Bletchley Park (Reino Unido, 1940)',
        summary: 'Dispositivo eletromecânico desenvolvido por Alan Turing e Gordon Welchman. Inspirada na Bomba polonesa, usava trechos de texto previsíveis (cribs) e dedução lógica elétrica para descartar configurações contraditórias da Enigma.',
    },
    'radiogoniometria': {
        id: 'radiogoniometria',
        term: 'Radiogoniometria',
        category: 'tecnica',
        extraInfo: 'Rastreamento de Rádio',
        summary: 'Técnica de localização que utiliza antenas direcionais para determinar a direção de origem de um sinal de rádio. Cruzando medições de dois ou mais pontos (triangulação), era possível descobrir o esconderijo exato de transmissores clandestinos.',
    },
    'valvulas-eletronicas': {
        id: 'valvulas-eletronicas',
        term: 'Válvulas Eletrônicas',
        category: 'tecnica',
        extraInfo: 'Eletrônica a Vácuo',
        summary: 'Componentes parecidos com lâmpadas de vidro que controlam o fluxo de corrente elétrica no vácuo sem precisar de peças móveis. Permitiram ao Colossus processar sinais milhares de vezes mais rápido que as máquinas mecânicas.',
    },
    'reles-mecanicos': {
        id: 'reles-mecanicos',
        term: 'Relés Mecânicos',
        category: 'tecnica',
        extraInfo: 'Comutação Eletromecânica',
        summary: 'Interruptores físicos acionados por eletroímãs para abrir ou fechar circuitos. Como dependiam do movimento mecânico de peças metálicas, seu tempo de resposta limitava a velocidade dos primeiros equipamentos de cálculo.',
    },
    'codigo-binario': {
        id: 'codigo-binario',
        term: 'Código Binário',
        category: 'conceito',
        extraInfo: 'Representação Digital',
        summary: 'Sistema que representa letras e informações usando apenas dois estados (como 0 e 1, ou a presença e ausência de furos em uma fita de papel e pulsos elétricos). Na época da Segunda Guerra, os teleimpressores usavam o código Baudot de 5 bits.',
    },
    'maquina-lorenz': {
        id: 'maquina-lorenz',
        term: 'Máquina Lorenz',
        category: 'tecnica',
        extraInfo: 'Lorenz SZ 40 / SZ 42',
        summary: 'Equipamento alemão de criptografia acoplado a teleimpressores para comunicações de alto escalão entre Berlim e generais em campo. Possuía 12 rotores que combinavam o texto original com uma sequência pseudoaleatória de bits.',
    },
    'claude-shannon': {
        id: 'claude-shannon',
        term: 'Claude Shannon',
        category: 'pessoa',
        extraInfo: '1916 – 2001 • Matemático e Engenheiro',
        summary: 'Conhecido como o "Pai da Teoria da Informação". Seus estudos mostraram como aplicar a lógica booleana a circuitos elétricos e estabeleceram as bases matemáticas da criptografia moderna e das telecomunicações digitais.',
    },
    'friedrich-kasiski': {
        id: 'friedrich-kasiski',
        term: 'Friedrich Kasiski',
        category: 'pessoa',
        extraInfo: '1805 – 1881 • Criptoanalista Prussiano',
        summary: 'Oficial de infantaria e criptoanalista que publicou, em 1863, o primeiro método sistemático para quebrar cifras polialfabéticas como a de Vigenère (o Exame de Kasiski), medindo o espaçamento entre trechos repetidos no texto cifrado.',
    },
    'arthur-scherbius': {
        id: 'arthur-scherbius',
        term: 'Arthur Scherbius',
        category: 'pessoa',
        extraInfo: '1878 – 1929 • Engenheiro Eletricista',
        summary: 'Inventor alemão que patenteou a Máquina Enigma em 1918. Inicialmente, ele a projetou para proteger segredos comerciais e bancários, antes de o equipamento ser adotado e adaptado pelas forças armadas da Alemanha.',
    },
    'max-newman': {
        id: 'max-newman',
        term: 'Max Newman',
        category: 'pessoa',
        extraInfo: '1897 – 1984 • Matemático Britânico',
        summary: 'Matemático e criptoanalista que liderou a seção "Newmanry" em Bletchley Park, dedicada a automatizar a quebra da cifra de Lorenz. Após a guerra, fundou o laboratório que construiu o Manchester Baby, primeiro computador com programa armazenado.',
    },
    'tommy-flowers': {
        id: 'tommy-flowers',
        term: 'Tommy Flowers',
        category: 'pessoa',
        extraInfo: '1905 – 1998 • Engenheiro Britânico',
        summary: 'Engenheiro da central telefônica britânica (GPO) que projetou e construiu o computador Colossus. Mesmo diante do ceticismo de seus superiores, provou que milhares de válvulas eletrônicas podiam operar juntas de forma confiável e em altíssima velocidade.',
    },
    'albert-engels': {
        id: 'albert-engels',
        term: 'Albert Engels',
        category: 'pessoa',
        extraInfo: 'Codinome "Alfredo" • Operação Bolívar',
        summary: 'Empresário alemão radicado no Brasil que chefiou a principal célula de espionagem nazista no Rio de Janeiro (grupo CEL). Operava transmissores clandestinos enviando informações estratégicas sobre o Atlântico Sul diretamente para a Alemanha.',
    },
}