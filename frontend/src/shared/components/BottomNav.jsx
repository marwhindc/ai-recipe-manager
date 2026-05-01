import { Link, useLocation } from 'react-router-dom'

function BookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function ShoppingBagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function CompassIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

const tabs = [
  { label: 'Recipes', path: '/recipes', Icon: BookIcon },
  { label: 'Collections', path: '#', Icon: BookmarkIcon },
  { label: 'Grocery', path: '#', Icon: ShoppingBagIcon },
  { label: 'Discover', path: '#', Icon: CompassIcon },
  { label: 'Profile', path: '#', Icon: UserIcon }
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#ead2b5] bg-white/95 px-4 py-1 backdrop-blur md:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5 text-center">
        {tabs.map(({ label, path, Icon }) => {
          const isRecipes = label === 'Recipes'
          const active = isRecipes && pathname.startsWith('/recipes')
          const color = active ? 'text-brand-rust' : 'text-gray-400'

          const content = (
            <div className={`relative flex flex-col items-center gap-0.5 py-2 ${color}`}>
              {active && (
                <span className="absolute -top-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-brand-rust" />
              )}
              <Icon />
              <span className="text-[10px] font-medium">{label}</span>
            </div>
          )

          return (
            <li key={label}>
              {isRecipes ? (
                <Link className="block" to={path}>
                  {content}
                </Link>
              ) : (
                <button className="block w-full" type="button">
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}