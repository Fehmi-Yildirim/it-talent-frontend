import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import type { JSONContent } from '@tiptap/core'
import type { ReactNode } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { useTranslation } from '../../../i18n/useTranslation'
import './CmsRichTextEditor.css'

interface CmsRichTextEditorProps {
    value: JSONContent | null
    onChange: (value: JSONContent) => void
    disabled?: boolean
}

interface ToolbarButtonProps {
    label: string
    active?: boolean
    disabled?: boolean
    onClick: () => void
    children: ReactNode
}

const emptyContent: JSONContent = {
    type: 'doc',
    content: [{ type: 'paragraph' }],
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

export default function CmsRichTextEditor({
    value,
    onChange,
    disabled = false,
}: CmsRichTextEditorProps) {
    const { t } = useTranslation()

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                codeBlock: false,
                link: false,
                underline: false,
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
            }),
            Placeholder.configure({
                placeholder: t('adminContent.editor.placeholder'),
            }),
        ],
        // The parent remounts this editor when the selected page or locale
        // changes, so initialize Tiptap with the loaded value directly.
        content: value ?? emptyContent,
        editable: !disabled,
        onUpdate: ({ editor: currentEditor }) => {
            onChange(currentEditor.getJSON())
        },
    })

    useEffect(() => {
        if (!editor) return
        editor.setEditable(!disabled)
    }, [editor, disabled])

    if (!editor) {
        return (
            <div className="cms-editor">
                {t('adminContent.editor.loading')}
            </div>
        )
    }

    const addLink = () => {
        const currentHref = editor.getAttributes('link').href as
            | string
            | undefined

        const href = window.prompt(
            t('adminContent.editor.linkPrompt'),
            currentHref ?? t('adminContent.editor.linkUrlPlaceholder'),
        )

        if (href === null) return

        if (href.trim()) {
            editor.chain().focus().setLink({ href: href.trim() }).run()
        } else {
            editor.chain().focus().unsetLink().run()
        }
    }

    return (
        <div className={`cms-editor${disabled ? ' cms-editor--disabled' : ''}`}>
            <div className="rich-text-toolbar" role="toolbar">
                <div className="rich-text-toolbar__group">
                    <ToolbarButton
                        label={t('adminContent.editor.heading2')}
                        active={editor.isActive('heading', { level: 2 })}
                        disabled={disabled}
                        onClick={() =>
                            editor.chain().focus().toggleHeading({ level: 2 }).run()
                        }
                    >
                        H2
                    </ToolbarButton>

                    <ToolbarButton
                        label={t('adminContent.editor.heading3')}
                        active={editor.isActive('heading', { level: 3 })}
                        disabled={disabled}
                        onClick={() =>
                            editor.chain().focus().toggleHeading({ level: 3 }).run()
                        }
                    >
                        H3
                    </ToolbarButton>
                </div>

                <div className="rich-text-toolbar__group">
                    <ToolbarButton
                        label={t('adminContent.editor.bold')}
                        active={editor.isActive('bold')}
                        disabled={disabled}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                        <strong>B</strong>
                    </ToolbarButton>

                    <ToolbarButton
                        label={t('adminContent.editor.italic')}
                        active={editor.isActive('italic')}
                        disabled={disabled}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    >
                        <em>I</em>
                    </ToolbarButton>

                    <ToolbarButton
                        label={t('adminContent.editor.underline')}
                        active={editor.isActive('underline')}
                        disabled={disabled}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                    >
                        <u>U</u>
                    </ToolbarButton>

                    <ToolbarButton
                        label={t('adminContent.editor.strike')}
                        active={editor.isActive('strike')}
                        disabled={disabled}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                    >
                        <s>S</s>
                    </ToolbarButton>

                    <ToolbarButton
                        label={t('adminContent.editor.code')}
                        active={editor.isActive('code')}
                        disabled={disabled}
                        onClick={() => editor.chain().focus().toggleCode().run()}
                    >
                        {'</>'}
                    </ToolbarButton>
                </div>

                <div className="rich-text-toolbar__group">
                    <ToolbarButton
                        label={t('adminContent.editor.bulletList')}
                        active={editor.isActive('bulletList')}
                        disabled={disabled}
                        onClick={() =>
                            editor.chain().focus().toggleBulletList().run()
                        }
                    >
                        {t('adminContent.editor.bulletList')}
                    </ToolbarButton>

                    <ToolbarButton
                        label={t('adminContent.editor.orderedList')}
                        active={editor.isActive('orderedList')}
                        disabled={disabled}
                        onClick={() =>
                            editor.chain().focus().toggleOrderedList().run()
                        }
                    >
                        {t('adminContent.editor.orderedList')}
                    </ToolbarButton>
                </div>

                <div className="rich-text-toolbar__group">
                    <ToolbarButton
                        label={t('adminContent.editor.blockquote')}
                        active={editor.isActive('blockquote')}
                        disabled={disabled}
                        onClick={() =>
                            editor.chain().focus().toggleBlockquote().run()
                        }
                    >
                        {t('adminContent.editor.blockquote')}
                    </ToolbarButton>

                    <ToolbarButton
                        label={t('adminContent.editor.link')}
                        active={editor.isActive('link')}
                        disabled={disabled}
                        onClick={addLink}
                    >
                        {t('adminContent.editor.link')}
                    </ToolbarButton>

                    <ToolbarButton
                        label={t('adminContent.editor.horizontalRule')}
                        disabled={disabled}
                        onClick={() =>
                            editor.chain().focus().setHorizontalRule().run()
                        }
                    >
                        ―
                    </ToolbarButton>
                </div>

                <div className="rich-text-toolbar__group rich-text-toolbar__group--right">
                    <ToolbarButton
                        label="Ongedaan maken"
                        disabled={disabled || !editor.can().undo()}
                        onClick={() => editor.chain().focus().undo().run()}
                    >
                        ↶
                    </ToolbarButton>

                    <ToolbarButton
                        label="Opnieuw uitvoeren"
                        disabled={disabled || !editor.can().redo()}
                        onClick={() => editor.chain().focus().redo().run()}
                    >
                        ↷
                    </ToolbarButton>
                </div>
            </div>

            <EditorContent editor={editor} />
        </div>
    )
}
