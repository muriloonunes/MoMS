import {ImageSourcePropType} from "react-native";

export interface SectionData {
    sectionId: '1' | '2' | '3' | '4' | '5';
    code: string;
    period: string;
    title: string;
    introText: string;
    extraText?: string;
    coverImage?: ImageSourcePropType | { uri: string };
    steps: StoryStep[];
}

export interface CameraPose {
    scale: number;   // 1 = imagem inteira, 2 = zoom 2x, etc.
    focusX: number;  // -0.5 (esquerda) até 0.5 (direita), 0 = centro
    focusY: number;  // -0.5 (topo) até 0.5 (base), 0 = centro
}

export type StepLayout = 'full-image' | 'split' | 'text-only'

export interface StoryStep {
    id: string;
    layout: StepLayout,
    sequenceId?: string;        // Agrupa passos consecutivos na mesma sequência visual (mesmo trocando de imagem)
    year?: string;              // Ex: "1918" ou "1943 • Bletchley Park"
    title?: string;             // Título do trecho
    text: string;
    image?: ImageSourcePropType | { uri: string };
    imageCaption?: string;
    camera?: CameraPose;
    imagePosition?: 'left' | 'right';
    imageFit?: 'contain' | 'cover';
    imageAspectRatio?: number;
    isBrazil: boolean;
}

export const SECOES: Record<string, SectionData> = {
    '1': {
        sectionId: '1',
        code: 'SEÇÃO 01',
        period: 'Antes de 1950',
        title: 'Primórdios da Computação',
        introText: 'A história da segurança começa muito antes do surgimento do computador. Na época, a maior questão era o desenvolvimento da criptografia, para que o que fosse segredo fosse ouvido apenas pelas pessoas certas.',
        extraText: 'A criptografia é usada para proteger mensagens desde a antiguidade. Nessa época, ela andava de mãos dadas com as atividades militares e a necessidade de escondê-las para que não fossem lidas pelo time errado.',
        coverImage: {uri: 'https://cryptoid.com.br/wp-content/uploads/2023/02/iStock-915391614.jpg'},
        steps: [
            {
                id: '1',
                layout: 'full-image',
                title: 'Cifra de César',
                image: require('@/assets/images/cifra_cesar.svg'),
                text: 'Por volta de 100 a.C, o imperador romano Júlio César era conhecido por usar uma [[cifra-substituicao|cifra de substituição]] para transmitir mensagens ao generais do seu exército na frente de guerra.',
                isBrazil: false
            },
            {
                id: '1.1',
                layout: 'full-image',
                image: require('@/assets/images/cifra_cesar.svg'),
                camera: {scale: 1.3, focusX: -0.5, focusY: 0},
                text: 'Na cifra usada por César, cada caractere era deslocado em três casas, portanto, "A" se tornava "D", "B" se tornava "E", e assim por diante',
                isBrazil: false
            },
            {
                id: '2',
                layout: 'split',
                sequenceId: 'vigenere-tutorial',
                year: 'SÉCULO XVI',
                title: 'Cifra de Vigenère',
                image: {uri: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Vigen%C3%A8re_square_shading.svg'},
                camera: {scale: 1.0, focusX: 0, focusY: 0},
                text: 'A cifra de Vigenère é um método de criptografar o texto usando uma senha para deslocar cada letra da mensagem original para frente no alfabeto, de acordo com a letra correspondente da senha.',
                isBrazil: false
            },
            {
                id: '2.1',
                layout: "split",
                sequenceId: 'vigenere-tutorial',
                title: 'Como Cifrar: Passo 1',
                image: {uri: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Vigen%C3%A8re_square_shading.svg'},
                camera: {scale: 1.0, focusX: 0, focusY: 0},
                text: 'Exemplo: queremos criptografar a frase "ir para sul" usando a palavra-chave "meia".',
                isBrazil: false,
            },
            {
                id: '2.2',
                layout: "split",
                sequenceId: 'vigenere-tutorial',
                title: 'Como Cifrar: Passo 2',
                image: {uri: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Vigen%C3%A8re_square_shading.svg'},
                camera: {scale: 1.15, focusX: -0.25, focusY: -0.25},
                text: 'Primeiro, repetimos as letras da senha até cobrir todas as 9 letras da mensagem:\n\nMensagem: I R  P A R A  S U L\nSenha:    M E  I A M E  I A M',
                isBrazil: false,
            },
            {
                id: '2.3',
                layout: "split",
                sequenceId: 'vigenere-tutorial',
                title: 'Como Cifrar: Passo 3',
                image: {uri: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Vigen%C3%A8re_square_shading.svg'},
                camera: {scale: 1.75, focusX: -0.18, focusY: -0.05},
                text: 'Para a 1ª letra ("I") com a 1ª letra da senha ("M"), cruzamos a coluna "I" com a linha "M" na grade (ou somamos suas posições considerando A = 0: 8 + 12 = 20). O encontro das duas resulta na letra "U".',
                isBrazil: false,
            },
            {
                id: '2.4',
                layout: "split",
                sequenceId: 'vigenere-tutorial',
                title: 'Como Cifrar: Passo 4',
                image: {uri: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Vigen%C3%A8re_square_shading.svg'},
                camera: {scale: 1.75, focusX: 0.16, focusY: -0.32},
                text: 'Na 2ª letra ("R") com a senha ("E"), cruzamos a coluna "R" com a linha "E" (17 + 4 = 21), obtendo a letra "V" — e repetimos o cruzamento para cada par seguinte.',
                isBrazil: false,
            },
            {
                id: '2.5',
                layout: "split",
                sequenceId: 'vigenere-tutorial',
                title: 'Como Cifrar: Resultado',
                image: {uri: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Vigen%C3%A8re_square_shading.svg'},
                camera: {scale: 1.0, focusX: 0, focusY: 0},
                text: 'Ao final de todas as letras, a mensagem original "ir para sul" se transforma no texto cifrado "uv xade aux".',
                isBrazil: false,
            },
            {
                id: '2.6',
                layout: "split",
                image: {uri: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Vigen%C3%A8re_square_shading.svg'},
                camera: {scale: 1.0, focusX: 0.1, focusY: 0.1},
                text: 'Por mais de três séculos, essa cifra era conhecida como "le chiffre indéchiffrable" (a cifra indecifrável), pois enganava a [[analise-frequencia|análise da frequência]]. Uma mesma letra pode virar letras diferentes no texto final, o que embaralha os padrões e faz o resultado parecer aleatório.',
                isBrazil: false,
            },
            {
                id: '2.7',
                layout: 'split',
                imagePosition: 'right',
                image: {uri: 'https://s2.glbimg.com/xLbZ_qMpUDRA35L6cxYbcnjqMOc=/e.glbimg.com/og/ed/f/original/2018/10/18/charles_babbage_1860.jpg'},
                imageCaption: 'Charles Babbage',
                imageFit: "contain",
                text: 'Apesar disso, ela foi quebrada no século XIX por Charles Babbage e por Friedrich Kasiski, ao perceberem que, quando uma mesma palavra era cifrada pelo mesmo trecho da senha, letras repetidas eram geradas no texto final. Ao medir a distância entre essas repetições, dá pra descobrir o tamanho da senha, separar as letras que usaram o mesmo deslocamento e aplicar a análise de frequência.',
                isBrazil: false,
            },
            {
                id: '3',
                layout: 'text-only',
                imagePosition: 'left',
                title: 'Máquina Enigma',
                text: 'Na Primeira e na Segunda Guerra Mundial, as mensagens eram transmitidas via rádio e podiam ser interceptadas por qualquer um. Como o canal de comunicação era aberto, a segurança passou a depender totalmente da chave usada para criptografar o texto.',
                isBrazil: false,
            },
            {
                id: '3.1',
                layout: 'full-image',
                image: {uri: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Enigma_Machine_at_NSA.jpg?utm_source=pt.wikipedia.org&utm_campaign=imageinfo&utm_content=original'},
                camera: {scale: 1.8, focusX: 0, focusY: -0.2},
                text: 'No final da Primeira Guerra, o engenheiro alemão Arthur Scherbius inventou a Máquina Enigma, cujo uso se consolidou na Segunda Guerra. A Enigma era uma [[maquina-rotores|máquina de rotores]], semelhante a uma máquina de escrever, em que os rotores giravam em ritmos diferentes a cada tecla pressionada, trocando as letras e gerando o texto cifrado. Nesse sistema, a chave era a combinação diária da ordem, da posição inicial dos rotores e das conexões de cabos da máquina.',
                isBrazil: false,
            },
            {
                id: '3.2',
                layout: "full-image",
                image: {uri: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Enigma_Machine_at_NSA.jpg?utm_source=pt.wikipedia.org&utm_campaign=imageinfo&utm_content=original'},
                camera: {scale: 2.1, focusX: 0.1, focusY: 0.2},
                text: 'No início, acreditava-se que era impossível descriptografar uma mensagem criada pela Enigma.',
                isBrazil: false,
            },
            {
                id: '3.3',
                layout: 'text-only',
                text: 'Porém, entre 1932 e 1933, os poloneses conseguiram descobrir o funcionamento interno da máquina e construir réplicas para quebrar as mensagens. Posteriormente, durante a Segunda Guerra Mundial, quando os alemães tornaram o sistema mais complexo, [[alan-turing|Alan Turing]] aprimorou esse trabalho e desenvolveu uma máquina capaz de testar milhares de combinações, permitindo decifrar as mensagens alemãs em grande escala e rapidamente, favorecendo os [[aliados|Aliados]].',
                isBrazil: false,
            }
        ]
    },
    '2': {
        sectionId: '2',
        code: 'SEÇÃO 02',
        period: '1950 – 1970',
        title: 'Fundação da Computação Moderna',
        introText: '',
        steps: []
    },
    '3': {
        sectionId: '3',
        code: 'SEÇÃO 03',
        period: '1970 – 1990',
        title: 'Expansão da Computação',
        introText: '',
        steps: []
    },
    '4': {
        sectionId: '4',
        code: 'SEÇÃO 04',
        period: '1990 – 2010',
        title: 'Internet e Conectividade',
        introText: '',
        steps: []
    },
    '5': {
        sectionId: '5',
        code: 'SEÇÃO 05',
        period: '2010 – Presente',
        title: 'Era Digital e Inteligência Artificial',
        introText: '',
        steps: []
    }
}