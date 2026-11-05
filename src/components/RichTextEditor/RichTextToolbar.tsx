import type { ReactNode } from 'react'
import type { Editor } from '@tiptap/react'
import { useTranslation } from '../../i18n/useTranslation'

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
            className={`rich-text-toolbar__button${active ? ' is-active' : ''}`}
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
    const { t } = useTranslation()
    const isDisabled = disabled || !editor.isEditable

    const setLink = () => {
        const currentHref = editor.getAttributes('link').href as
            | string
            | undefined

        const url = window.prompt(
            t('feedback.richText.enterUrl'),
            currentHref ?? 'https://',
        )

        if (url === null) return

        const trimmedUrl = url.trim()

        if (!trimmedUrl) {
            editor.chain().focus().unsetLink().run()
            return
        }

        editor.chain().focus().setLink({ href: trimmedUrl }).run()
    }

    return (
        <div
            className="rich-text-toolbar"
            role="toolbar"
            aria-label={t('feedback.richText.toolbarLabel')}
        >
            <div className="rich-text-toolbar__group">
                <ToolbarButton
                    label={t('feedback.richText.heading2')}
                    active={editor.isActive('heading', { level: 2 })}
                    disabled={isDisabled}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                >
                    H2
                </ToolbarButton>

                <ToolbarButton
                    label={t('feedback.richText.heading3')}
                    active={editor.isActive('heading', { level: 3 })}
                    disabled={isDisabled}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                >
                    H3
                </ToolbarButton>
            </div>

            <div className="rich-text-toolbar__group">
                <ToolbarButton
                    label={t('feedback.richText.bold')}
                    active={editor.isActive('bold')}
                    disabled={isDisabled}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <strong>B</strong>
                </ToolbarButton>

                <ToolbarButton
                    label={t('feedback.richText.italic')}
                    active={editor.isActive('italic')}
                    disabled={isDisabled}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <em>I</em>
                </ToolbarButton>

                <ToolbarButton
                    label={t('feedback.richText.underline')}
                    active={editor.isActive('underline')}
                    disabled={isDisabled}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <u>U</u>
                </ToolbarButton>
            </div>

            <div className="rich-text-toolbar__group">
                <ToolbarButton
                    label={t('feedback.richText.bulletList')}
                    active={editor.isActive('bulletList')}
                    disabled={isDisabled}
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                >
                    {t('feedback.richText.bulletList')}
                </ToolbarButton>

                <ToolbarButton
                    label={t('feedback.richText.orderedList')}
                    active={editor.isActive('orderedList')}
                    disabled={isDisabled}
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                >
                    {t('feedback.richText.orderedList')}
                </ToolbarButton>
            </div>

            <div className="rich-text-toolbar__group">
                <ToolbarButton
                    label={t('feedback.richText.link')}
                    active={editor.isActive('link')}
                    disabled={isDisabled}
                    onClick={setLink}
                >
                    {t('feedback.richText.link')}
                </ToolbarButton>
            </div>

            <div className="rich-text-toolbar__group">
                <ToolbarButton
                    label={t('feedback.richText.undo')}
                    disabled={isDisabled || !editor.can().undo()}
                    onClick={() => editor.chain().focus().undo().run()}
                >
                    ↶
                </ToolbarButton>

                <ToolbarButton
                    label={t('feedback.richText.redo')}
                    disabled={isDisabled || !editor.can().redo()}
                    onClick={() => editor.chain().focus().redo().run()}
                >
                    ↷
                </ToolbarButton>
            </div>

            <div className="rich-text-toolbar__group rich-text-toolbar__group--right">
                <ToolbarButton
                    label={
                        showHtml
                            ? t('feedback.richText.visualEditor')
                            : t('feedback.richText.html')
                    }
                    active={showHtml}
                    disabled={disabled}
                    onClick={onToggleHtml}
                >
                    {showHtml
                        ? t('feedback.richText.visual')
                        : t('feedback.richText.html')}
                </ToolbarButton>
            </div>
        </div>
    )
}