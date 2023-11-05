import { type ApiFood } from '~/modules/diet/food/infrastructure/api/domain/apiFoodModel'

export type ApiFoodRepository = {
  fetchApiFoods: () => Promise<readonly ApiFood[]>
  fetchApiFoodsByName: (
    name: Required<ApiFood>['nome'],
  ) => Promise<readonly ApiFood[]>
  fetchApiFoodByEan: (ean: Required<ApiFood>['ean']) => Promise<ApiFood>
}
