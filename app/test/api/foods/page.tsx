import { TemplateSearch } from '@/app/templateSearch/TemplateSearch'
import UserSelector from '@/components/UserSelector'

export default async function Page() {
  return (
    <>
      <UserSelector />
      <TemplateSearch targetName="test" />
    </>
  )
}
