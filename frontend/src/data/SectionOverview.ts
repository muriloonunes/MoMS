export interface SectionOverview {
    id: '1' | '2' | '3' | '4' | '5';
    code: string;
    period: string;
    title: string;
}

export const MUSEUM_SECTIONS: SectionOverview[] = [
    {
        id: '1',
        code: 'SEÇÃO 01',
        period: 'ANTES DE 1950',
        title: 'Primórdios da Computação',
    },
    {
        id: '2',
        code: 'SEÇÃO 02',
        period: '1950 – 1970',
        title: 'Fundação da Computação Moderna',
    },
    {
        id: '3',
        code: 'SEÇÃO 03',
        period: '1970 – 1990',
        title: 'Expansão da Computação',
    },
    {
        id: '4',
        code: 'SEÇÃO 04',
        period: '1990 – 2010',
        title: 'Internet e Conectividade',
    },
    {
        id: '5',
        code: 'SEÇÃO 05',
        period: '2010 – Presente',
        title: 'Era Digital e Inteligência Artificial',
    },
];