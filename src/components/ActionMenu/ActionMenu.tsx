import {
    useEffect,
    useRef,
    useState,
} from 'react'
import './ActionMenu.css'

export interface ActionMenuItem {
    label: string
    onClick: () => void
    destructive?: boolean
    disabled?: boolean
}

interface ActionMenuProps {
    actions: ActionMenuItem[]
    ariaLabel: string
}

function ActionMenu({
    actions,
    ariaLabel,
}: ActionMenuProps) {
    const [open, setOpen] = useState(false)

    const menuRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

    useEffect(() => {
        if (!open) {
            return
        }

        const handleOutsideClick = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target as Node,
                )
            ) {
                setOpen(false)
                triggerRef.current?.focus()
            }
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault()
                setOpen(false)
                triggerRef.current?.focus()
                return
            }

            if (
                event.key !== 'ArrowDown' &&
                event.key !== 'ArrowUp' &&
                event.key !== 'Home' &&
                event.key !== 'End'
            ) {
                return
            }

            const enabledItems = itemRefs.current.filter(
                (item) => item && !item.disabled,
            )

            if (enabledItems.length === 0) {
                return
            }

            event.preventDefault()

            const currentIndex = enabledItems.findIndex(
                (item) =>
                    item === document.activeElement,
            )

            let nextIndex = currentIndex

            if (event.key === 'ArrowDown') {
                nextIndex =
                    currentIndex < 0
                        ? 0
                        : (currentIndex + 1) %
                        enabledItems.length
            }

            if (event.key === 'ArrowUp') {
                nextIndex =
                    currentIndex < 0
                        ? enabledItems.length - 1
                        : (currentIndex - 1 +
                            enabledItems.length) %
                        enabledItems.length
            }

            if (event.key === 'Home') {
                nextIndex = 0
            }

            if (event.key === 'End') {
                nextIndex = enabledItems.length - 1
            }

            enabledItems[nextIndex]?.focus()
        }

        document.addEventListener(
            'mousedown',
            handleOutsideClick,
        )
        document.addEventListener(
            'keydown',
            handleKeyDown,
        )

        return () => {
            document.removeEventListener(
                'mousedown',
                handleOutsideClick,
            )
            document.removeEventListener(
                'keydown',
                handleKeyDown,
            )
        }
    }, [open])

    useEffect(() => {
        if (!open) {
            return
        }

        const firstEnabledItem = itemRefs.current.find(
            (item) => item && !item.disabled,
        )

        firstEnabledItem?.focus()
    }, [open])

    const handleTriggerClick = () => {
        setOpen((current) => !current)
    }

    const handleActionClick = (
        action: ActionMenuItem,
    ) => {
        if (action.disabled) {
            return
        }

        action.onClick()
        setOpen(false)
        triggerRef.current?.focus()
    }

    return (
        <div
            className="action-menu"
            ref={menuRef}
        >
            <button
                ref={triggerRef}
                type="button"
                className="action-menu__trigger"
                aria-label={ariaLabel}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={handleTriggerClick}
            >
                ⋮
            </button>

            {open && (
                <div
                    className="action-menu__dropdown"
                    role="menu"
                >
                    {actions.map((action, index) => (
                        <button
                            key={`${action.label}-${index}`}
                            ref={(element) => {
                                itemRefs.current[index] =
                                    element
                            }}
                            type="button"
                            className={`action-menu__item${action.destructive
                                    ? ' action-menu__item--destructive'
                                    : ''
                                }`}
                            role="menuitem"
                            disabled={action.disabled}
                            onClick={() =>
                                handleActionClick(action)
                            }
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ActionMenu
