import { listFoods } from "@/controllers/food";
import { listUsers } from "@/controllers/users";


export default async function Cart() {

  let users = await listUsers();
  let foods = await listFoods();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-3 pt-5">Users</h1>
      {users?.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
        </div>
      )) ?? 'No users'
      }

      <h1 className="text-3xl font-bold mb-3 pt-5">Foods</h1>
      {foods?.map(food => (
        <div key={food.id}>
          <h3>{food.name}</h3>
        </div>
      )) ?? 'No foods'
      }
    </div>
  );
}

// ***REMOVED***


// ***REMOVED***
// ***REMOVED***