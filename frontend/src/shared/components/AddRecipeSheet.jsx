import { Link2, PencilLine, Sparkles, X } from 'lucide-react'
import { Drawer } from 'vaul'
import { useNavigate } from 'react-router-dom'

export default function AddRecipeSheet({ open, onOpenChange }) {
  const navigate = useNavigate()

  const go = (path) => {
    onOpenChange(false)
    setTimeout(() => navigate(path), 90)
  }

  return (
    <Drawer.Root onOpenChange={onOpenChange} open={open}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[70] mx-auto mt-24 flex w-full max-w-[440px] flex-col rounded-t-[28px] bg-cream outline-none">
          <Drawer.Title className="sr-only">Add a new recipe</Drawer.Title>
          <Drawer.Description className="sr-only">
            Choose how you want to add a recipe.
          </Drawer.Description>
          <div className="px-6 pb-8 pt-3">
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-black/10" />

            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl text-espresso">Add a recipe</h2>
              <button
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-linen bg-white text-espresso"
                onClick={() => onOpenChange(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <button
              className="mb-3 w-full rounded-[1.5rem] border border-linen bg-white p-5 text-left active:scale-[0.99] transition-transform"
              data-testid="action-manual"
              onClick={() => go('/recipe/new')}
              type="button"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paprika/10 text-paprika">
                  <PencilLine size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg text-espresso">Start from scratch</h3>
                  <p className="mt-1 text-sm text-taupe">Type your own recipe manually.</p>
                </div>
              </div>
            </button>

            <button
              className="w-full rounded-[1.5rem] border border-paprika/20 bg-gradient-to-br from-paprika/5 to-olive/5 p-5 text-left active:scale-[0.99] transition-transform"
              data-testid="action-import"
              onClick={() => go('/recipe/import')}
              type="button"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paprika/10 text-paprika">
                  <Sparkles size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg text-espresso">Import from a link</h3>
                    <span className="rounded-full bg-paprika/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-paprika">
                      AI
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-taupe">YouTube or Facebook video URL.</p>
                </div>
              </div>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
