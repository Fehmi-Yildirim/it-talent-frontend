import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import { createPortal } from 'react-dom'
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

interface MenuPosition {
    top: number
    left: number
}

function ActionMenu({
    actions,
    ariaLabel,
}: ActionMenuProps) {
    const [open, setOpen] = useState(false)
    const [position, setPosition] = useState<MenuPosition>({
        top: 0,
        left: 0,
    })

    const triggerRef = useRef<HTMLButtonElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

    const updatePosition = () => {
        const trigger = triggerRef.current
        const menu = menuRef.current

        if (!trigger || !menu) {
            return
        }

        const triggerRect = trigger.getBoundingClientRect()
        const menuRect = menu.getBoundingClientRect()
        const viewportPadding = 8
        const spacing = 8

        const maxLeft = window.innerWidth - menuRect.width - viewportPadding

        const left = Math.max(
            viewportPadding,
            Math.min(
                triggerRect.right - menuRect.width,
                maxLeft,
            ),
        )

        const spaceBelow =
            window.innerHeight - triggerRect.bottom

        const shouldOpenAbove =
            spaceBelow < menuRect.height + spacing &&
            triggerRect.top > menuRect.height + spacing

        const top = shouldOpenAbove
            ? triggerRect.top - menuRect.height - spacing
            : triggerRect.bottom + spacing

        setPosition({
            top: Math.max(
                viewportPadding,
                Math.min(
                    top,
                    window.innerHeight - menuRect.height - viewportPadding,
                ),
            ),
            left,
        })
    }

    useLayoutEffect(() => {
        if (!open) {
            return
        }

        updatePosition()
    }, [open])

    useEffect(() => {
        if (!open) {
            return
        }

        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node

            if (
                triggerRef.current?.contains(target) ||
                menuRef.current?.contains(target)
            ) {
                return
            }

            setOpen(false)
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
                (item) => item === document.activeElement,
            )

            let nextIndex = currentIndex

            if (event.key === 'ArrowDown') {
                nextIndex =
                    currentIndex < 0
                        ? 0
                        : (currentIndex + 1) % enabledItems.length
            }

            if (event.key === 'ArrowUp') {
                nextIndex =
                    currentIndex < 0
                        ? enabledItems.length - 1
                        : (currentIndex - 1 + enabledItems.length) %
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

        const handleViewportChange = () => {
            updatePosition()
        }

        document.addEventListener('mousedown', handleOutsideClick)
        document.addEventListener('keydown', handleKeyDown)
        window.addEventListener('resize', handleViewportChange)
        window.addEventListener('scroll', handleViewportChange, true)

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick)
            document.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('resize', handleViewportChange)
            window.removeEventListener('scroll', handleViewportChange, true)
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

    const handleActionClick = (action: ActionMenuItem) => {
        if (action.disabled) {
            return
        }

        action.onClick()
        setOpen(false)
        triggerRef.current?.focus()
    }

    return (
        <div className="action-menu">
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

            {open &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="action-menu__dropdown"
                        role="menu"
                        style={{
                            top: position.top,
                            left: position.left,
                        }}
                    >
                        {actions.map((action, index) => (
                            <button
                                key={`${action.label}-${index}`}
                                ref={(element) => {
                                    itemRefs.current[index] = element
                                }}
                                type="button"
                                className={`action-menu__item${action.destructive
                                    ? ' action-menu__item--destructive'
                                    : ''
                                    }`}
                                role="menuitem"
                                disabled={action.disabled}
                                onClick={() => handleActionClick(action)}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>,
                    document.body,
                )}
        </div>
    )
}

export default ActionMenu
