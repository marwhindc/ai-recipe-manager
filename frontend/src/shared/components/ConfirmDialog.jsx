import Button from './Button'
import Modal from './Modal'

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  onConfirm,
  onCancel,
  loading = false
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-brand-cocoa/90">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}