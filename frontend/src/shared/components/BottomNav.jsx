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
    <nav className="z-50 border-t border-black/5 bg-white/95 backdrop-blur-md">
      <ul className="mx-auto flex max-w-[440px] items-center justify-between px-4 pt-4 pb-3">
        {tabs.map(({ href, label, Icon, match }) => {
          const isActive = match(pathname)

          return (
            <li className="min-w-0 flex-1" key={href}>
              <Link
                className={`flex flex-col items-center gap-1.5 transition-colors duration-200 ${
                  isActive ? 'text-paprika' : 'text-espresso/50 hover:text-espresso'
                }`}
                to={href}
              >
                <div
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                    isActive ? 'bg-paprika/10 scale-105' : ''
                  }`}
                >
                  <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-semibold tracking-wide ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
