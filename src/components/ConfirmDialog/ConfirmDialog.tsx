import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './ConfirmDialog.css'

type ConfirmDialogProps = {
    open: boolean
    title: string
    message: string
    confirmLabel: string
    cancelLabel: string
    onConfirm: () => void
    onCancel: () => void
    destructive?: boolean
}

function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    destructive = false,
}: ConfirmDialogProps) {
    const cancelButtonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (!open) {
            return
        }

        cancelButtonRef.current?.focus()

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCancel()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [open, onCancel])

    if (!open) {
        return null
    }

    return createPortal(
        <div
            className="confirm-dialog__backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onCancel()
                }
            }}
        >
            <div
                className="confirm-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-message"
            >
                <h2 id="confirm-dialog-title">{title}</h2>

                <p id="confirm-dialog-message">{message}</p>

                <div className="confirm-dialog__actions">
                    <button
                        ref={cancelButtonRef}
                        type="button"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        className={
                            destructive
                                ? 'confirm-dialog__confirm--destructive'
                                : undefined
                        }
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    )
}

export default ConfirmDialog