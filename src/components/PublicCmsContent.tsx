import { useEditor, EditorContent } from '@tiptap/react'
import type { JSONContent } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'

interface PublicCmsContentProps {
    content: Record<string, unknown>
}

export function PublicCmsContent({ content }: PublicCmsContentProps) {
    const editor = useEditor(
        {
            immediatelyRender: false,
            editable: false,
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
                    autolink: false,
                }),
            ],
            content: content as JSONContent,
        },
        [content],
    )

    if (!editor) {
        return null
    }

    return (
        <section
            className="public-cms-content"
            aria-label="Page content"
        >
            <EditorContent editor={editor} />
        </section>
    )
}
