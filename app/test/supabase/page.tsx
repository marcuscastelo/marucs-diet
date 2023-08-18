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
        errored: false,
        data: users,
      })
    })

    listFoods({ limit: 10 }).then((foods) => {
      setFoods({
        loading: false,
        errored: false,
        data: foods,
      })
    })
  }, [])

  if (users.loading || foods.loading) {
    return <div>Loading...</div>
  }

  if (users.errored || foods.errored) {
    return <div>Errored</div>
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
// OL4rsk9Ztwf6RnlB

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiaGh4Z2VhZmx6bXpwbWF0bmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA2MDMwMDEsImV4cCI6MjAwNjE3OTAwMX0.wRQ_utWfnmSEVhtEysiobLmntfM3GLLcToc2rD1MMPc
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiaGh4Z2VhZmx6bXpwbWF0bmlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MDYwMzAwMSwiZXhwIjoyMDA2MTc5MDAxfQ.DxI2ekjAMZNlCJilpo4D3o8OMyTOY6iXd0NJWT_C4vY
