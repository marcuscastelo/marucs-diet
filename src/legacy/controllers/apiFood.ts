// import { type ApiFood } from '@/legacy/model/apiFoodModel'
// import { type Food, foodSchema } from '@/modules/diet/food/domain/food'
// import { INTERNAL_API } from '@/legacy/utils/api'
// import { type DbReady } from '@/legacy/utils/newDbRecord'
// import { insertFood } from '@/legacy/controllers/food'
// import { markSearchAsCached } from '@/legacy/controllers/searchCache'

// // TODO: retriggered: pensar num lugar melhor pra isso
// export function convertApi2Food (food: ApiFood): DbReady<Food> {
//   return {
//     name: food.nome,
//     source: {
//       type: 'api',
//       id: food.id.toString()
//     },
//     ean: food.ean,
//     macros: {
//       carbs: food.carboidratos * 100,
//       protein: food.proteinas * 100,
//       fat: food.gordura * 100
//     }
//   }
// }

// export async function importFoodFromApiByEan (ean: string): Promise<Food> {
//   const apiFood = (await INTERNAL_API.get(`barcode/${ean}`)).data as ApiFood
//   const food = convertApi2Food(apiFood)
//   const insertedFood = await insertFood(food)
//   return foodSchema.parse(insertedFood)
// }

// export async function importFoodsFromApiByName (name: string): Promise<Food[]> {
//   console.debug(`[ApiFood] Importing foods with name "${name}"`)
//   const apiFoods = (await INTERNAL_API.get('food', { params: { q: name } }))
//     .data.alimentos as ApiFood[]

//   console.debug(`[ApiFood] Found ${apiFoods.length} foods`)
//   const foodsToInsert = apiFoods.map(convertApi2Food)

//   const insertPromises = foodsToInsert.map(insertFood)

//   const insertionResults = await Promise.allSettled(insertPromises)
//   console.debug(
//     `[ApiFood] Inserted ${insertionResults.length} foods. ${
//       insertionResults.filter((result) => result.status === 'fulfilled').length
//     } succeeded, ${
//       insertionResults.filter((result) => result.status === 'rejected').length
//     } failed`
//   )

//   if (insertionResults.some((result) => result.status === 'rejected')) {
//     console.error(`Failed to insert some foods: ${insertionResults}`)
//     throw new Error('Failed to insert some foods. See console for details.')
//   } else {
//     console.debug('[ApiFood] No failed insertions, marking search as cached')
//     await markSearchAsCached(name)
//   }

//   const insertedFoods: Food[] = insertionResults.map((result) =>
//     result.status === 'fulfilled' ? result.value : (null as unknown as Food)
//   )
//   console.debug(
//     `[ApiFood] Returning ${insertedFoods.length}/${apiFoods.length} foods`
//   )

//   return insertedFoods.map((food) => foodSchema.parse(food))
// }
