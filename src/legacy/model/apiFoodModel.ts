import { z } from 'zod'

export const apiFoodSchema = z.object({
  id: z.number({ required_error: 'ID is required' }),
  nome: z.string({ required_error: 'Name is required' }),
  tipo: z.string({ required_error: 'Type is required' }),
  favorito: z.boolean({ required_error: 'Favorite is required' }),
  ean: z.string({ required_error: 'EAN is required' }),
  idCliente: z.number({ required_error: 'Client ID is required' }),
  calorias: z.number({ required_error: 'Calories is required' }),
  proteinas: z.number({ required_error: 'Proteins is required' }),
  carboidratos: z.number({ required_error: 'Carbs is required' }),
  gordura: z.number({ required_error: 'Fat is required' }),
  gorduraTrans: z.number({ required_error: 'Fat (Trans) is required' }),
  gorduraSaturada: z.number({ required_error: 'Fat (Saturated) is required' }),
  fibra: z.number({ required_error: 'Fiber is required' }),
  acucar: z.number({ required_error: 'Sugar is required' }),
  sodio: z.number({ required_error: 'Sodium is required' }),
  calcio: z.number({ required_error: 'Calcium is required' }),
  ferro: z.number({ required_error: 'Iron is required' }),
  pesoTotalReceita: z.number({ required_error: 'Total weight is required' }),
  pesoAposPreparo: z.number({
    required_error: 'Weight after preparation is required',
  }),
  aprovado: z.boolean({ required_error: 'Approved is required' }),
  padrao: z.boolean({ required_error: 'Standard is required' }),
  possuiFotoTabelaNutricional: z.boolean({
    required_error: 'Has nutritional table photo is required',
  }),
  fotoTabelaNutricional: z.string({
    required_error: 'Nutritional table photo is required',
  }),
  multiplicador: z.number({ required_error: 'Multiplier is required' }),
  preco: z.object(
    {
      precoMedio: z.object(
        {
          preco: z.number({ required_error: 'Average price is required' }),
          quantidade: z.number({ required_error: 'Quantity is required' }),
        },
        { required_error: 'Average price is required' },
      ),
      precoUsuario: z.object(
        {
          preco: z.number({ required_error: 'User price is required' }),
          gramas: z.number({ required_error: 'Grams is required' }),
          precoGrama: z.number({
            required_error: 'Price per gram is required',
          }),
        },
        { required_error: 'User price is required' },
      ),
      precoListagem: z.object(
        {
          preco: z.number({ required_error: 'Listing price is required' }),
          tipo: z.string({ required_error: 'Type is required' }),
        },
        { required_error: 'Listing price is required' },
      ),
    },
    { required_error: 'Price is required' },
  ),
  porcaoPersonalizada: z.object(
    {
      nome: z.string({ required_error: 'Custom portion name is required' }),
      multiplicador: z.number({
        required_error: 'Custom portion multiplier is required',
      }),
    },
    { required_error: 'Custom portion is required' },
  ),
  porcoes: z.array(
    z.object(
      {
        id: z.number({ required_error: 'Portion ID is required' }),
        nome: z.string({ required_error: 'Portion name is required' }),
        unidade: z.string({ required_error: 'Portion unit is required' }),
        multiplicador: z.number({
          required_error: 'Portion multiplier is required',
        }),
        padrao: z.boolean({ required_error: 'Portion standard is required' }),
      },
      { required_error: 'Portion is required' },
    ),
    { required_error: 'Portions is required' },
  ),
  alimentos: z.array(z.any(), { required_error: 'Foods is required' }),
})

export type ApiFood = Readonly<z.infer<typeof apiFoodSchema>>
