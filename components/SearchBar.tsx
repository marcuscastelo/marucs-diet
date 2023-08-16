export default function SearchBar({
  isDesktop,
  search,
  setSearch,
}: {
  isDesktop: boolean
  search: string
  setSearch: (search: string) => void
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          aria-hidden="true"
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <input
        autoFocus={isDesktop}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        type="search"
        id="default-search"
        className="block w-full border-gray-600 bg-gray-700 p-4 pl-10 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
        placeholder="Buscar alimentos"
        required
      />
    </div>
  )
}
