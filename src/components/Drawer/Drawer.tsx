import {
    useEffect,
    useId,
    useRef,
} from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './Drawer.css'

interface DrawerProps {
    open: boolean
    onClose: () => void
    title: string
    children: ReactNode
    closeLabel: string
}

function Drawer({
    open,
    onClose,
    title,
    children,
    closeLabel,
}: DrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null)
    const previousActiveElement =
        useRef<HTMLElement | null>(null)

    const titleId = useId()

    useEffect(() => {
        if (!open) {
            return
        }

        previousActiveElement.current =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null

        const previousOverflow =
            document.body.style.overflow

        document.body.style.overflow = 'hidden'

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault()
                onClose()
            }
        }

        document.addEventListener(
            'keydown',
            handleKeyDown,
        )

        requestAnimationFrame(() => {
            drawerRef.current?.focus()
        })

        return () => {
            document.body.style.overflow =
                previousOverflow

            document.removeEventListener(
                'keydown',
                handleKeyDown,
            )

            previousActiveElement.current?.focus()
            previousActiveElement.current = null
        }
    }, [open, onClose])

    if (!open) {
        return null
    }

    return createPortal(
        <div
            className="drawer__backdrop"
            onMouseDown={onClose}
        >
            <div
                ref={drawerRef}
                className="drawer"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                <header className="drawer__header">
                    <h2
                        id={titleId}
                        className="drawer__title"
                    >
                        {title}
                    </h2>

                    <button
                        type="button"
                        className="drawer__close"
                        aria-label={closeLabel}
                        onClick={onClose}
                    >
                        ×
                    </button>
                </header>

                <div className="drawer__content">
                    {children}
                </div>
            </div>
        </div>,
        document.body,
    )
}

export default Drawer
