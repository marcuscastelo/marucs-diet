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
// OL4rsk9Ztwf6RnlB

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiaGh4Z2VhZmx6bXpwbWF0bmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA2MDMwMDEsImV4cCI6MjAwNjE3OTAwMX0.wRQ_utWfnmSEVhtEysiobLmntfM3GLLcToc2rD1MMPc
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiaGh4Z2VhZmx6bXpwbWF0bmlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MDYwMzAwMSwiZXhwIjoyMDA2MTc5MDAxfQ.DxI2ekjAMZNlCJilpo4D3o8OMyTOY6iXd0NJWT_C4vY
