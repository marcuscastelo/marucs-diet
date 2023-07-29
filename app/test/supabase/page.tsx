import { listUsers } from "@/controllers/users";


export default async function Cart() {

  let users = await listUsers();

  return (
    <div>
      {users?.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
        </div>
      )) ?? 'No users'
      }
    </div>
  );
}

// ***REMOVED***


// ***REMOVED***
// ***REMOVED***