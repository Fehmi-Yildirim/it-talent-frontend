import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import type { JSONContent } from '@tiptap/core'
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

const emptyContent: JSONContent = {
    type: 'doc',
    content: [{ type: 'paragraph' }],
}

export default function CmsRichTextEditor({
    value,
    onChange,
    disabled = false,
}: CmsRichTextEditorProps) {
    const { t } = useTranslation()

    const editor = useEditor(
        {
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
            content: value ?? emptyContent,
            editable: !disabled,
            onUpdate: ({ editor: currentEditor }) => {
                onChange(currentEditor.getJSON())
            },
        },
        [t],
    )

    useEffect(() => {
        if (!editor) return
        editor.setEditable(!disabled)
    }, [editor, disabled])

    useEffect(() => {
        if (!editor) return

        const nextContent = value ?? emptyContent
        const currentContent = JSON.stringify(editor.getJSON())

        if (currentContent !== JSON.stringify(nextContent)) {
            editor.commands.setContent(nextContent, {
                emitUpdate: false,
            })
        }
    }, [editor, value])

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
        <div className="cms-editor">
            <div className="cms-editor__toolbar">
                <button
                    type="button"
                    disabled={disabled}
                    aria-pressed={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    {t('adminContent.editor.bold')}
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    aria-pressed={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    {t('adminContent.editor.italic')}
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    aria-pressed={editor.isActive('underline')}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    {t('adminContent.editor.underline')}
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    aria-pressed={editor.isActive('strike')}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    {t('adminContent.editor.strike')}
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    aria-pressed={editor.isActive('code')}
                    onClick={() => editor.chain().focus().toggleCode().run()}
                >
                    {t('adminContent.editor.code')}
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    aria-pressed={editor.isActive('heading', { level: 2 })}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                >
                    {t('adminContent.editor.heading2')}
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    aria-pressed={editor.isActive('heading', { level: 3 })}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                >
                    {t('adminContent.editor.heading3')}
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    aria-pressed={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    {t('adminContent.editor.bulletList')}
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    aria-pressed={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    {t('adminContent.editor.orderedList')}
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    aria-pressed={editor.isActive('blockquote')}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                    {t('adminContent.editor.blockquote')}
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={addLink}
                >
                    {t('adminContent.editor.link')}
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().setHorizontalRule().run()
                    }
                >
                    {t('adminContent.editor.horizontalRule')}
                </button>
            </div>

            <EditorContent editor={editor} />
        </div>
    )
}
