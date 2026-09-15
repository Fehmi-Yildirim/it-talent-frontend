import type { ReactNode } from 'react'
import type { Editor } from '@tiptap/react'

interface RichTextToolbarProps {
    editor: Editor
    disabled?: boolean
    showHtml: boolean
    onToggleHtml: () => void
}

interface ToolbarButtonProps {
    label: string
    active?: boolean
    disabled?: boolean
    onClick: () => void
    children: ReactNode
}

function ToolbarButton({
    label,
    active = false,
    disabled = false,
    onClick,
    children,
}: ToolbarButtonProps) {
    return (
        <button
            type="button"
            className={`rich-text-toolbar__button${active ? ' is-active' : ''
                }`}
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
        >
            {children}
        </button>
    )
}

export function RichTextToolbar({
    editor,
    disabled = false,
    showHtml,
    onToggleHtml,
}: RichTextToolbarProps) {
    const isDisabled = disabled || !editor.isEditable

    const setLink = () => {
        const currentHref = editor.getAttributes('link').href as
            | string
            | undefined

        const url = window.prompt(
            'Enter URL',
            currentHref ?? 'https://',
        )

        if (url === null) {
            return
        }

        const trimmedUrl = url.trim()

        if (!trimmedUrl) {
            editor.chain().focus().unsetLink().run()
            return
        }

        editor
            .chain()
            .focus()
            .setLink({ href: trimmedUrl })
            .run()
    }

    return (
        <div
            className="rich-text-toolbar"
            role="toolbar"
            aria-label="Text formatting"
        >
            <div className="rich-text-toolbar__group">
                <ToolbarButton
                    label="Heading 2"
                    active={editor.isActive('heading', { level: 2 })}
                    disabled={isDisabled}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run()
                    }
                >
                    H2
                </ToolbarButton>

                <ToolbarButton
                    label="Heading 3"
                    active={editor.isActive('heading', { level: 3 })}
                    disabled={isDisabled}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 3 })
                            .run()
                    }
                >
                    H3
                </ToolbarButton>
            </div>

            <div className="rich-text-toolbar__group">
                <ToolbarButton
                    label="Bold"
                    active={editor.isActive('bold')}
                    disabled={isDisabled}
                    onClick={() =>
                        editor.chain().focus().toggleBold().run()
                    }
                >
                    <strong>B</strong>
                </ToolbarButton>

                <ToolbarButton
                    label="Italic"
                    active={editor.isActive('italic')}
                    disabled={isDisabled}
                    onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                    }
                >
                    <em>I</em>
                </ToolbarButton>

                <ToolbarButton
                    label="Underline"
                    active={editor.isActive('underline')}
                    disabled={isDisabled}
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                >
                    <u>U</u>
                </ToolbarButton>
            </div>

            <div className="rich-text-toolbar__group">
                <ToolbarButton
                    label="Bullet list"
                    active={editor.isActive('bulletList')}
                    disabled={isDisabled}
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                >
                    • List
                </ToolbarButton>

                <ToolbarButton
                    label="Ordered list"
                    active={editor.isActive('orderedList')}
                    disabled={isDisabled}
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                >
                    1. List
                </ToolbarButton>
            </div>

            <div className="rich-text-toolbar__group">
                <ToolbarButton
                    label="Link"
                    active={editor.isActive('link')}
                    disabled={isDisabled}
                    onClick={setLink}
                >
                    Link
                </ToolbarButton>
            </div>

            <div className="rich-text-toolbar__group">
                <ToolbarButton
                    label="Undo"
                    disabled={isDisabled || !editor.can().undo()}
                    onClick={() =>
                        editor.chain().focus().undo().run()
                    }
                >
                    ↶
                </ToolbarButton>

                <ToolbarButton
                    label="Redo"
                    disabled={isDisabled || !editor.can().redo()}
                    onClick={() =>
                        editor.chain().focus().redo().run()
                    }
                >
                    ↷
                </ToolbarButton>
            </div>

            <div className="rich-text-toolbar__group rich-text-toolbar__group--right">
                <ToolbarButton
                    label={showHtml ? 'Visual editor' : 'HTML'}
                    active={showHtml}
                    disabled={disabled}
                    onClick={onToggleHtml}
                >
                    {showHtml ? 'Visual' : 'HTML'}
                </ToolbarButton>
            </div>
        </div>
    )
}