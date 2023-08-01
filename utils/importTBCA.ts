import { Food } from '@/model/foodModel'
import TBCAJson from './tbca.json'
import { upsertFood, deleteAll } from '@/controllers/food'
// Reason for using require instead of import: no @types/async/parallelLimit
// eslint-disable-next-line @typescript-eslint/no-var-requires
const parallelLimit = require('async/parallelLimit')

// TODO: Remove all code related to TBCA, as well as the TBCA.json file
const TBCA = TBCAJson as unknown as { [key: string]: Food }

export async function deleteAndReimportFoods(
  progressCallback?: (total: number) => void,
) {
  const total = Object.values(TBCA).length

  console.log('Deleting all foods...')
  await deleteAll()

  console.log('Finished deleting foods.')
  console.log('Waiting 3 seconds...')

  // sleep for 1 second to allow the server to catch up
  await new Promise((r) => setTimeout(r, 3000))

  console.log('Finished waiting.')

  console.log('Creating foods...')

  await parallelLimit(
    Object.values(TBCA).map((food) => async () => {
      console.log(`Creating ${food.name}...`)
      try {
        await upsertFood(food)
        if (progressCallback) progressCallback(total)
      } catch (e) {
        console.error(e)
      }
      console.log(`Finished ${food.name}.`)
    }),
    10,
  )
}
