import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { RichTextEditor } from './RichTextEditor'

describe('RichTextEditor', () => {
    it('renders the toolbar and editor', () => {
        render(
            <RichTextEditor
                value="<p>Hello</p>"
                onChange={vi.fn()}
                placeholder="Write a description..."
            />,
        )

        expect(
            screen.getByRole('toolbar', {
                name: 'Text formatting',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: 'Heading 2' }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: 'Heading 3' }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: 'Bold' }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: 'Italic' }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: 'Underline' }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: 'Bullet list' }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: 'Ordered list' }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: 'Link' }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: 'Undo' }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: 'Redo' }),
        ).toBeInTheDocument()

        expect(
            document.querySelector('.tiptap'),
        ).toBeInTheDocument()
    })

    it('renders the initial HTML content', () => {
        render(
            <RichTextEditor
                value="<p>Hello <strong>world</strong></p>"
                onChange={vi.fn()}
            />,
        )

        const editor = document.querySelector('.tiptap')

        expect(editor).toBeInTheDocument()
        expect(editor).toHaveTextContent('Hello world')
        expect(editor?.querySelector('strong')).toHaveTextContent('world')
    })

    it('switches between visual and HTML mode', async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()

        render(
            <RichTextEditor
                value="<p>Hello</p>"
                onChange={onChange}
            />,
        )

        expect(
            document.querySelector('.tiptap'),
        ).toBeInTheDocument()

        await user.click(
            screen.getByRole('button', {
                name: 'HTML',
            }),
        )

        const htmlSource = screen.getByRole('textbox', {
            name: 'HTML source',
        })

        expect(htmlSource).toHaveValue('<p>Hello</p>')

        fireEvent.change(htmlSource, {
            target: {
                value: '<p>Updated description</p>',
            },
        })

        expect(onChange).toHaveBeenLastCalledWith(
            '<p>Updated description</p>',
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Visual editor',
            }),
        )

        expect(
            document.querySelector('.tiptap'),
        ).toBeInTheDocument()
    })

    it('calls onChange when HTML content is edited', () => {
        const onChange = vi.fn()

        render(
            <RichTextEditor
                value="<p>Hello</p>"
                onChange={onChange}
            />,
        )

        fireEvent.click(
            screen.getByRole('button', {
                name: 'HTML',
            }),
        )

        const htmlSource = screen.getByRole('textbox', {
            name: 'HTML source',
        })

        fireEvent.change(htmlSource, {
            target: {
                value: '<p>Hello world</p>',
            },
        })

        expect(onChange).toHaveBeenCalledWith(
            '<p>Hello world</p>',
        )
    })

    it('supports an accessible label', () => {
        render(
            <>
                <label id="description-label">
                    Description
                </label>

                <RichTextEditor
                    value="<p>Hello</p>"
                    onChange={vi.fn()}
                    id="description"
                    aria-labelledby="description-label"
                />
            </>,
        )

        const editor = document.querySelector('.tiptap')

        expect(editor).toHaveAttribute(
            'id',
            'description',
        )

        expect(editor).toHaveAttribute(
            'aria-labelledby',
            'description-label',
        )
    })

    it('disables editing and toolbar controls', () => {
        render(
            <RichTextEditor
                value="<p>Hello</p>"
                onChange={vi.fn()}
                disabled
            />,
        )

        expect(
            screen.getByRole('button', { name: 'Bold' }),
        ).toBeDisabled()

        expect(
            screen.getByRole('button', { name: 'Italic' }),
        ).toBeDisabled()

        expect(
            screen.getByRole('button', { name: 'Underline' }),
        ).toBeDisabled()

        expect(
            screen.getByRole('button', { name: 'Heading 2' }),
        ).toBeDisabled()

        expect(
            screen.getByRole('button', { name: 'Bullet list' }),
        ).toBeDisabled()

        expect(
            screen.getByRole('button', { name: 'Link' }),
        ).toBeDisabled()

        expect(
            document.querySelector('.tiptap'),
        ).toHaveAttribute(
            'contenteditable',
            'false',
        )
    })
})