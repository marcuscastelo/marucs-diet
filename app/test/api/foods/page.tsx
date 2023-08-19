import FoodSearch from '@/app/newItem/FoodSearch'
import UserSelector from '@/components/UserSelector'

export default async function Page() {
  return (
    <>
      <UserSelector />
      <FoodSearch targetName="test" />
    </>
  )
}
