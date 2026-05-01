import { BookOpen, Bookmark, Compass, ShoppingBag, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const tabs = [
  { href: '/', label: 'Recipes', Icon: BookOpen, match: (path) => path === '/' || path.startsWith('/recipe/') },
  { href: '/collections', label: 'Collections', Icon: Bookmark, match: (path) => path.startsWith('/collections') },
  { href: '/grocery', label: 'Grocery', Icon: ShoppingBag, match: (path) => path.startsWith('/grocery') },
  { href: '/discover', label: 'Discover', Icon: Compass, match: (path) => path.startsWith('/discover') },
  { href: '/profile', label: 'Profile', Icon: User, match: (path) => path.startsWith('/profile') }
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="absolute bottom-0 left-0 right-0 z-50 border-t border-black/5 bg-white/95 backdrop-blur-md"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      <ul className="mx-auto flex max-w-[440px] items-center justify-between px-6 pt-3">
        {tabs.map(({ href, label, Icon, match }) => {
          const isActive = match(pathname)

          return (
            <li className="min-w-0 flex-1" key={href}>
              <Link
                className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
                  isActive ? 'text-paprika' : 'text-espresso/60 hover:text-espresso'
                }`}
                to={href}
              >
                <div className={`relative transition-transform ${isActive ? 'scale-110' : ''}`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-paprika" />
                  )}
                </div>
                <span className="mt-1 text-[10px] font-semibold">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
