import DietPage from '@/app/DietPage'
import { ProfilePage } from '@/app/ProfilePage'
import { Route, Routes } from '@solidjs/router'

export default function App () {
  return (
    <Routes>
      <Route path="/" component={DietPage} />
      <Route path="/profile" component={ProfilePage} />
    </Routes>
  )
}
