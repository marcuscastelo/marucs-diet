import {
  setTemplateSearch,
  templateSearch,
} from '~/modules/search/application/search'

export function TemplateSearchBar(props: { isDesktop: boolean }) {
  return (
    <div class="relative">
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          aria-hidden="true"
          class="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        autofocus={props.isDesktop}
        value={templateSearch()}
        onInput={(e) => {
          setTemplateSearch(e.target.value)
        }}
        type="search"
        id="default-search"
        class="block w-full border-gray-600 bg-gray-700 px-4 pl-10 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 hover:border-white transition-transform h-12 py-3 rounded-b-lg"
        placeholder="Buscar alimentos"
        required
      />
    </div>
  )
}
