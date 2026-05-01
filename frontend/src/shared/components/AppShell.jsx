import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import AddRecipeSheet from './AddRecipeSheet'
import BottomNav from './BottomNav'

const HIDE_CHROME_PATTERNS = [
  /^\/recipe\/[^/]+$/,
  /^\/recipe\/new$/,
  /^\/recipe\/import$/,
  /^\/recipe\/[^/]+\/edit$/
]

const FAB_PATTERNS = [/^\/$/]

export default function AppShell({ children }) {
  const { pathname } = useLocation()
  const [sheetOpen, setSheetOpen] = useState(false)

  const hideTabs = HIDE_CHROME_PATTERNS.some((pattern) => pattern.test(pathname))
  const showFab = FAB_PATTERNS.some((pattern) => pattern.test(pathname))

  return (
    <div className="app-backdrop">
      <div className="app-column flex flex-col">
        <main
          className={`no-scrollbar flex-1 overflow-x-hidden overflow-y-auto ${hideTabs ? 'pb-6' : ''}`}
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            paddingBottom: hideTabs ? undefined : 'calc(7rem + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {children}
        </main>

        {showFab && (
          <button
            aria-label="Add recipe"
            className="absolute right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-paprika text-white shadow-lg shadow-paprika/30 transition hover:scale-105 active:scale-95"
            onClick={() => setSheetOpen(true)}
            style={{ bottom: hideTabs ? 24 : 'calc(84px + env(safe-area-inset-bottom, 0px) + 24px)' }}
            type="button"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        )}

        {!hideTabs && (
          <>
            <BottomNav />
            {/* Safe area spacer — fills the gap below the nav on phones with home indicator / gesture bar */}
            <div className="bg-white/95" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
          </>
        )}

        <AddRecipeSheet onOpenChange={setSheetOpen} open={sheetOpen} />
      </div>
    </div>
  )
}