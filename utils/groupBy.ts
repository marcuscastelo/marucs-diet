// TODO: Make generic groupBy function to replace in MeasureChart and WeightChart
// import { Measure } from '@/model/measureModel'

// export type CollapseFn<
//   TData extends object,
//   TKey extends keyof TData,
//   TGroup extends TData[TKey],
// > = (group: TGroup, groupData: Omit<TData, TGroup>[]) => TData

// export function makeGroups<
//   TData extends object,
//   TKey extends keyof TData,
//   TGroup extends TData[TKey],
// >(data: TData[], key: TKey): Map<TGroup, Omit<TData, TGroup>[]> {
//   const map = new Map<TGroup, TData[]>()
//   for (const item of data) {
//     const group = item[key]
//     if (map.has(group)) {
//       map.get(group)?.push(item)
//     } else {
//       map.set(group, [item])
//     }
//   }
//   return map
// }

// export function collapseGroups<
//   TData extends object,
//   TKey extends keyof TData,
//   TGroup extends TData[TKey],
// >(
//   groups: Map<TGroup, Omit<TData, TGroup>[]>,
//   collapseFn: CollapseFn<TData, TKey, TGroup>,
// ): TData[] {
//   const result: TData[] = []
//   for (const [group, groupData] of groups.entries()) {
//     result.push(collapseFn(group, groupData))
//   }
//   return result
// }

// export function groupBy<
//   TData extends object,
//   TKey extends keyof TData,
//   TGroup extends TData[TKey],
// >(
//   data: TData[],
//   key: TKey,
//   collapseFn: CollapseFn<TData, TKey, TGroup>,
// ): TData[] {
//   return collapseGroups(makeGroups(data, key), collapseFn)
// }

// const testGroups = makeGroups(
//   [
//     { id: 1, name: 'John', age: 20 },
//     { id: 2, name: 'John', age: 30 },
//     { id: 3, name: 'John', age: 40 },
//     { id: 4, name: 'Jane', age: 20 },
//     { id: 5, name: 'Jane', age: 30 },
//     { id: 6, name: 'Jane', age: 40 },
//   ],
//   'name',
// )

// const testCollapsed = collapseGroups(testGroups, (group, groupData) => {
//   return {
//     name: group,
//     age: groupData[0].age,
//     name: groupData[0].name,
//   }
// })
