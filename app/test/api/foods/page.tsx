import FoodSearch from '@/app/foodSearch/FoodSearch'
import UserSelector from '@/components/UserSelector'

export default async function Page() {
  return (
    <>
      <UserSelector />
      <FoodSearch targetName="test" />
    </>
  )
}
