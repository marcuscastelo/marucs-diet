import Image from 'next/image'

export default function UserIcon() {
  return (
    <Image
      className="h-10 w-10 rounded-full"
      src="/user.png"
      sizes="100vw"
      alt=""
      width={0}
      height={0}
    />
  )
}
