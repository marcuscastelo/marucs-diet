import { listFoods } from '@/controllers/food'
import { listUsers } from '@/controllers/users'

export default async function Cart() {
  const users = await listUsers()
  const foods = await listFoods()

  return (
    <div>
      <h1 className="mb-3 pt-5 text-3xl font-bold">Users</h1>
      {users?.map((user) => (
        <div key={user.id}>
          <h3>{user.name}</h3>
        </div>
      )) ?? 'No users'}

      <h1 className="mb-3 pt-5 text-3xl font-bold">Foods</h1>
      {foods?.map((food) => (
        <div key={food.id}>
          <h3>{food.name}</h3>
        </div>
      )) ?? 'No foods'}
    </div>
  )
}

// TODO: (Urgent) Remove secrets from repo
// ***REMOVED***

// ***REMOVED***
// ***REMOVED***
