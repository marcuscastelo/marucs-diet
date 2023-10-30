// export type InForce<TObj, TKey extends keyof TObj> = {
//   [key in TKey]: Date
// }

// export function inForceGeneric<TObj extends object, TKey extends keyof TObj> (
//   array: ReadonlyArray<TObj & InForce<TObj, TKey>>,
//   key: TKey,
//   date: Date
// ) {
//   const firstItemAfterDate = array.findLast(
//     (item) => item[key].getTime() <= date.getTime()
//   )

//   if (!firstItemAfterDate) {
//     return null
//   }

//   return firstItemAfterDate
// }
