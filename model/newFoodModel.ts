export type NewFoodData = {
    id: number;
    nome: string;
    tipo: string;
    favorito: boolean;
    ean: string;
    idCliente: number;
    calorias: number;
    proteinas: number;
    carboidratos: number;
    gordura: number;
    gorduraTrans: number;
    gorduraSaturada: number;
    fibra: number;
    acucar: number;
    sodio: number;
    calcio: number;
    ferro: number;
    pesoTotalReceita: number;
    pesoAposPreparo: number;
    aprovado: boolean;
    padrao: boolean;
    possuiFotoTabelaNutricional: boolean;
    fotoTabelaNutricional: string;
    multiplicador: number;
    preco: {
        precoMedio: {
            preco: number;
            quantidade: number;
        };
        precoUsuario: {
            preco: number;
            gramas: number;
            precoGrama: number;
        };
        precoListagem: {
            preco: number;
            tipo: string;
        };
    };
    porcaoPersonalizada: {
        nome: string;
        multiplicador: number;
    };
    porcoes: {
        id: number;
        nome: string;
        unidade: string;
        multiplicador: number;
        padrao: boolean;
    }[];
    alimentos: any[]; //TODO: create model for this when example is available
};