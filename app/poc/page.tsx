import UserSelector from '../../components/UserSelector'
import FoodSearch from '../foodSearch/FoodSearch'

export default async function Page() {
  await new Promise((resolve) => setTimeout(resolve, 3000))

  return (
    <div>
      <UserSelector />
      <FoodSearch
        targetName="foods"
        onNewItemGroup={async () => undefined}
        onFinish={() => undefined}
      />
      <h1>Page</h1>
      <p>This page was rendered on the server.</p>
    </div>
  )
}
