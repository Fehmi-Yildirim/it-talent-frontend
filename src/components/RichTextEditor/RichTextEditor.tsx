import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'

import { RichTextToolbar } from './RichTextToolbar'
import './RichTextEditor.css'

export interface RichTextEditorProps {
    id?: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    minHeight?: number
    'aria-label'?: string
    'aria-labelledby'?: string
}

export function RichTextEditor({
    id,
    value,
    onChange,
    placeholder = 'Start typing...',
    disabled = false,
    minHeight = 180,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
}: RichTextEditorProps) {
    const [showHtml, setShowHtml] = useState(false)

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3],
                },
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
                placeholder,
            }),
        ],
        content: value,
        editable: !disabled,
        onUpdate: ({ editor: currentEditor }) => {
            onChange(currentEditor.getHTML())
        },
    })

    useEffect(() => {
        if (!editor) {
            return
        }

        editor.setEditable(!disabled)
    }, [editor, disabled])

    useEffect(() => {
        if (!editor || showHtml) {
            return
        }

        if (editor.getHTML() !== value) {
            editor.commands.setContent(value || '', {
                emitUpdate: false,
            })
        }
    }, [editor, value, showHtml])

    useEffect(() => {
        if (!editor) {
            return
        }

        const element = editor.view.dom

        if (id) {
            element.id = id
        } else {
            element.removeAttribute('id')
        }

        if (ariaLabel) {
            element.setAttribute('aria-label', ariaLabel)
        } else {
            element.removeAttribute('aria-label')
        }

        if (ariaLabelledBy) {
            element.setAttribute('aria-labelledby', ariaLabelledBy)
        } else {
            element.removeAttribute('aria-labelledby')
        }
    }, [editor, id, ariaLabel, ariaLabelledBy])

    if (!editor) {
        return (
            <div
                className="rich-text-editor"
                style={
                    {
                        '--rich-text-editor-min-height': `${minHeight}px`,
                    } as CSSProperties
                }
                aria-label="Rich text editor"
            />
        )
    }

    return (
        <div
            className={`rich-text-editor${disabled ? ' rich-text-editor--disabled' : ''
                }`}
            style={
                {
                    '--rich-text-editor-min-height': `${minHeight}px`,
                } as CSSProperties
            }
        >
            <RichTextToolbar
                editor={editor}
                disabled={disabled}
                showHtml={showHtml}
                onToggleHtml={() => setShowHtml((current) => !current)}
            />

            {showHtml ? (
                <textarea
                    id={id}
                    className="rich-text-editor__html"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    disabled={disabled}
                    aria-label="HTML source"
                    spellCheck={false}
                />
            ) : (
                <EditorContent editor={editor} />
            )}
        </div>
    )
}
