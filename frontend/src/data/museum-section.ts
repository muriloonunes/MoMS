import {ImageSourcePropType} from "react-native";

export type SectionSource =
    | string
    | {
    label?: string;
    url: string;
};

export interface SectionData {
    sectionId: '1' | '2' | '3' | '4' | '5';
    code: string;
    period: string;
    title: string;
    introText: string;
    extraText?: string;
    coverImage?: ImageSourcePropType | { uri: string };
    steps: StoryStep[];
    sources?: SectionSource[];
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
    year?: string;
    title?: string;
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
                image: require('@/assets/images/cifra_cesar.svg'),
                text: 'Por volta de 100 a.C, o imperador romano Júlio César era conhecido por usar uma [[cifra-substituicao|cifra de substituição]] simples para transmitir mensagens ao generais do seu exército.',
                isBrazil: false
            },
            {
                id: '1.1',
                layout: 'full-image',
                image: require('@/assets/images/cifra_cesar.svg'),
                camera: {scale: 1.3, focusX: -0.5, focusY: 0},
                text: 'Na cifra usada por César, cada letra avançava três casas no alfabeto: "A" se tornava "D", "B" se tornava "E", e assim por diante.',
                isBrazil: false
            },
            {
                id: '1.2',
                layout: 'full-image',
                image: require('@/assets/images/cifra_cesar.svg'),
                text: 'A cifra de César possuía um ponto fraco: como as trocas eram sempre iguais ("A" sempre se tornava "D"), era só contar as letras mais repetidas do texto para descobrir o segredo. Isso era conhecido como [[analise-frequencia|análise de frequência]]',
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
                text: 'Para contornar a [[analise-frequencia|análise de frequência]], surgiu a cifra de Vigenère. Ao invés de usar um único deslocamento, ela usava uma senha para variar a troca de cada letra. Por causa disso, ela ficou conhecida por três séculos como "le chiffre indéchiffrable" (a cifra indecifrável). ',
                isBrazil: false
            },
            {
                id: '2.1',
                layout: "split",
                sequenceId: 'vigenere-tutorial',
                title: 'Como Cifrar: Passo 1',
                image: {uri: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Vigen%C3%A8re_square_shading.svg'},
                camera: {scale: 1.0, focusX: 0, focusY: 0},
                text: 'Imagine que queremos criptografar a frase "ir para sul" usando a palavra-chave "meia". Primeiro, repetimos as letras da senha até ter a mesma quantidade de caracteres da mensagem. Nesse caso, a senha precisa ter 9 letras:\n\nMensagem: IR PARA SUL\nSenha:    MEIAMEIAM',
                isBrazil: false,
            },
            {
                id: '2.2',
                layout: "split",
                sequenceId: 'vigenere-tutorial',
                title: 'Como Cifrar: Passo 2',
                image: {uri: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Vigen%C3%A8re_square_shading.svg'},
                camera: {scale: 1.15, focusX: -0.25, focusY: -0.25},
                text: 'Na grade, cruzamos a coluna da letra com a linha da letra da senha:\n\n- 1ª letra: coluna "I" + linha "M" = "U"\n- 2ª letra: coluna "R" + linha "E" = "V"',
                isBrazil: false,
            },
            {
                id: '2.3',
                layout: "split",
                sequenceId: 'vigenere-tutorial',
                title: 'Como Cifrar',
                image: {uri: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Vigen%C3%A8re_square_shading.svg'},
                camera: {scale: 1.75, focusX: -0.18, focusY: -0.05},
                text: 'Também é possível usarmos as posições das letras no alfabeto para chegar nesse resultado.\n\nConsiderando A = 0, a posição da letra "I" é 8 e a posição da letra "M" é 12. Somando essas posições, obtemos 20. A letra na vigésima posição é "U".',
                isBrazil: false,
            },
            {
                id: '2.4',
                layout: "split",
                sequenceId: 'vigenere-tutorial',
                title: 'Como Cifrar: Resultado',
                image: {uri: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Vigen%C3%A8re_square_shading.svg'},
                camera: {scale: 1.0, focusX: 0, focusY: 0},
                text: 'Ao final, "ir para sul" se transforma em "uv xade aux". Repare no segredo: as duas letras "A" da palavra "para" viraram letras diferentes ("A" e "E"), embaralhando os padrões, diferente da cifra de César.',
                isBrazil: false,
            },
            {
                id: '2.5',
                layout: 'split',
                imagePosition: 'left',
                image: {uri: 'https://s2.glbimg.com/xLbZ_qMpUDRA35L6cxYbcnjqMOc=/e.glbimg.com/og/ed/f/original/2018/10/18/charles_babbage_1860.jpg'},
                imageCaption: 'Charles Babbage',
                imageFit: "contain",
                text: 'Apesar disso, ela foi quebrada no século XIX por Charles Babbage e por [[friedrich-kasiski|Friedrich Kasiski]], ao notarem uma brecha: como a senha se repete, palavras iguais que caem sobre o mesmo trecho da senha geram sequências idênticas no texto cifrado. Medindo a distância entre essas repetições, dá pra descobrir o tamanho da senha, separar as letras que usaram o mesmo deslocamento e aplicar a análise de frequência.',
                isBrazil: false,
            },
            {
                id: '3',
                layout: 'text-only',
                imagePosition: 'left',
                title: 'A Guerra pelo Rádio',
                text: 'Na Primeira e na Segunda Guerra Mundial, as mensagens eram transmitidas via rádio e podiam ser interceptadas por qualquer um. Como o canal de comunicação era aberto, a segurança passou a depender totalmente da chave usada para criptografar o texto.',
                isBrazil: false,
            },
            {
                id: '3.1',
                layout: 'full-image',
                year: '1918',
                // image: {uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Enigma-Machine.jpg?utm_source=pt.wikipedia.org&utm_campaign=index&utm_content=original'},
                image: {uri: 'https://www.christies.com/-/jssmedia/images/features/articles/2024/12/guide-updates/collecting-guide-enigma-machines/enigma-machine-main.jpg?mw=2301&mh=1438&hash=74ef0fa22b03037c1dd064220fe5a81ed3355d57'},
                imageFit: 'contain',
                imageCaption: 'Máquina Enigma',
                camera: {scale: 1.0, focusX: 0, focusY: -0.2},
                text: 'No final da Primeira Guerra, o engenheiro alemão [[arthur-scherbius|Arthur Scherbius]] criou a Máquina Enigma, que mecanizou a criptografia. Parecida com uma máquina de escrever, a Enigma era uma [[maquina-rotores|máquina de rotores]], em que os discos internos giravam em ritmos diferentes cada vez que uma tecla era pressionada, trocando todo o circuito elétrico para devolver a letra cifrada.',
                isBrazil: false,
            },
            {
                id: '3.2',
                layout: "full-image",
                image: {uri: 'https://www.christies.com/-/jssmedia/images/features/articles/2024/12/guide-updates/collecting-guide-enigma-machines/enigma-machine-main.jpg?mw=2301&mh=1438&hash=74ef0fa22b03037c1dd064220fe5a81ed3355d57'},
                camera: {scale: 1.6, focusX: 0.1, focusY: -0.1},
                text: 'No início, acreditava-se que era impossível descriptografar uma mensagem criada pela Enigma, já que a chave mudava todos os dias: dependia da escolha e da posição inicial dos rotores e das conexões de cabos da máquina, o que gerava quatrilhões de combinações possíveis.',
                isBrazil: false,
            },
            {
                id: '3.3',
                layout: 'split',
                image: {uri: 'https://features.diplomatmagazine.com/i-am-the-one-who-broke-the-enigma/assets/PfZMDmc1Cc/18-2560x3305.jpg'},
                imagePosition: 'right',
                imageFit: 'contain',
                imageCaption: 'Marian Rejewski',
                year: '1932',
                text: 'Entretanto, no final de 1932, o matemático polonês Marian Rejewski, junto com Jerzy Różycki e Henryk Zygalski, conseguiu decifrar o funcionamento das primeiras versões da Enigma. Usando a [[teoria-grupos|teoria dos grupos]], eles criaram a [[bomba-criptologica|Bomba criptológica]], que explorava uma erro humano no procedimento alemão: os operadores repetiam a chave da mensagem duas vezes no início de cada mensagem. Todo esse conhecimento foi depois compartilhado com os franceses e os britânicos.',
                isBrazil: false,
            },
            {
                id: '3.4',
                layout: 'split',
                image: {uri: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Alan_Turing_%281951%29.jpg?utm_source=pt.wikipedia.org&utm_campaign=imageinfo&utm_content=original'},
                imagePosition: "left",
                imageCaption: 'Alan Turing',
                year: '1940',
                text: 'Com a base obtida por Rejewski, [[alan-turing|Alan Turing]] e sua equipe britânica projetaram a [[bombe|Bombe]], uma versão melhorada da [[bomba-criptologica|Bomba criptológica]]. Ela testava milhares de combinação de rotores por minuto e funcionava por eliminação lógica, descartando qualquer combinação impossível. Isso permitiu decifrar as mensagens em grande escala e rapidamente, favorecendo os [[aliados|Aliados]].',
                isBrazil: false,
            },
            {
                id: '4',
                layout: 'full-image',
                imagePosition: "right",
                image: require('@/assets/images/mapa-bolivar.jpg'),
                camera: {scale: 1.0, focusX: 0, focusY: 1},
                year: '1942 - 1944',
                title: 'Operação Bolívar',
                text: 'No território brasileiro, a inteligência alemã espalhou redes de espionagem clandestina pela América do Sul, na chamada Operação Bolívar. Do Brasil, o agente [[albert-engels|Albert Engels]] transmitia a Berlim mensagens cifradas revelando horários de navios, cargas para os [[aliados|Aliados]] e movimentações de tropas no Nordeste.',
                isBrazil: true,
            },
            {
                id: '4.1',
                layout: 'full-image',
                image: require('@/assets/images/mapa-bolivar.jpg'),
                camera: {scale: 1.5, focusX: 0.5, focusY: -0.5},
                year: '1944',
                text: 'Com apoio de [[radiogoniometria|radiogoniometria]] e serviços aliados, a polícia brasileira rastreou as ondas de rádio clandestinas e desfez os núcleos de espionagem. Na operação, transmissores, manuais de cifragens e tabelas de códigos numéricos foram apreendidos.',
                isBrazil: true,
            },
            {
                id: '5',
                layout: 'split',
                image: {uri: 'https://www.bletchleypark.org.uk/wp-content/uploads/2022/02/945x805_2_CU13-945x700.jpg'},
                imagePosition: "left",
                imageCaption: "Colossus No 7",
                year: '1945',
                title: 'Colossus',
                text: 'Enquanto a Enigma era usada nas linhas de frente da guerra, o alto comando usava a [[maquina-lorenz|máquina Lorenz]]. Ela era um sistema de 12 rotores em [[codigo-binario|código binário]] e muito mais complexa que a Enigma. Para vencê-la, o matemático [[max-newman|Max Newman]] e o engenheiro [[tommy-flowers|Tommy Flowers]] construíram o Colossus: usando [[valvulas-eletronicas|válvulas eletrônicas]] em vez de [[reles-mecanicos|relés mecânicos]], nascia o primeiro computador eletrônico digital programável da história.',
                isBrazil: false,
            },
            {
                id: '6',
                layout: 'text-only',
                year: '1949',
                title: 'A Criptografia Torna-se Ciência',
                text: 'Após a guerra, em 1949, [[claude-shannon|Claude Shannon]], inspirado pelas máquinas criadas para quebrar os códigos e por encontros com [[alan-turing|Alan Turing]], publicou o artigo "Communication Theory of Secrecy Systems", que fundou a criptografia moderna, e a transformou em um ramo da matemática.',
                isBrazil: false,
            },
        ],
        sources: [
            {
                label: 'Uma breve história da criptografia — Red Hat',
                url: 'https://www.redhat.com/pt-br/blog/brief-history-cryptography'
            },
            {
                label: 'Cifra de Vigenère — Wikipédia',
                url: 'https://pt.wikipedia.org/wiki/Cifra_de_Vigen%C3%A8re',
            },
            {
                label: 'Vigenère-Chiffre — Wikipédia',
                url: 'https://de.wikipedia.org/wiki/Vigen%C3%A8re-Chiffre'
            },
            {
                label: 'Enigma Machine — Wikipédia',
                url: 'https://en.wikipedia.org/wiki/Enigma_machine'
            },
            {
                label: 'Enigma Maschine — Wikipédia',
                url: 'https://de.wikipedia.org/wiki/Enigma_(Maschine)'
            },
            {
                label: 'Marian Rejewski — Wikipédia',
                url: 'https://en.wikipedia.org/wiki/Marian_Rejewski'
            },
            {
                label: 'Bomba (cryptography) — Wikipédia',
                url: 'https://en.wikipedia.org/wiki/Bomba_(cryptography)'
            },
            {
                label: 'Bombe — Wikipédia',
                url: 'https://en.wikipedia.org/wiki/Bombe'
            },
            {
                label: 'Tunny and Heath Robinson — The National Museum of Computing',
                url: 'https://www.tnmoc.org/tunny-heath-robinson'
            },
            {
                label: 'The untold story of Tommy and his team — Tommy Flowers Foundation',
                url: 'https://tommyflowers.org/the-untold-story-of-tommy-and-his-team/'
            },
            {
                label: 'The Alan Turing Internet Scrapbook',
                url: 'https://www.turing.org.uk/scrapbook/ukusa.html'
            },
            {
                label: 'Os espiões nazistas que agiam no Brasil durante a Segunda Guerra — Aventuras na História',
                url: 'https://aventurasnahistoria.com.br/noticias/desventuras/os-espioes-nazistas-que-agiam-no-brasil-durante-a-segunda-guerra.phtml'
            },
        ],
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