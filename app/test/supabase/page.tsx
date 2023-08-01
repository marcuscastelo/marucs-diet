'use client'

import { listFoods } from '@/controllers/food'
import { listUsers } from '@/controllers/users'
import { Food } from '@/model/foodModel'
import { User } from '@/model/userModel'
import { Loadable } from '@/utils/loadable'
import { useEffect, useState } from 'react'

export default function Cart() {
  const [users, setUsers] = useState<Loadable<User[]>>({
    loading: true,
  })

  const [foods, setFoods] = useState<Loadable<Food[]>>({
    loading: true,
  })

  useEffect(() => {
    listUsers().then((users) => {
      setUsers({
        loading: false,
        data: users,
      })
    })

    listFoods().then((foods) => {
      setFoods({
        loading: false,
        data: foods,
      })
    })
  }, [])

  if (users.loading || foods.loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1 className="mb-3 pt-5 text-3xl font-bold">Users</h1>
      {users.data.map((user) => (
        <div key={user.id}>
          <h3>{user.name}</h3>
        </div>
      )) ?? 'No users'}

      <h1 className="mb-3 pt-5 text-3xl font-bold">Foods</h1>
      {foods.data.map((food) => (
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
