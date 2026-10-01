import { beforeEach, describe, expect, it, vi } from 'vitest'

const post = vi.hoisted(() => vi.fn())

vi.mock('../../../src/services/api/apiClient', () => ({
    apiClient: { post },
}))

import { createApplication } from '../../../src/features/applications/applications.api'

describe('createApplication', () => {
    beforeEach(() => post.mockReset())

    it('sends cover letter and CV as multipart fields with consent enabled', async () => {
        post.mockResolvedValue({ id: 'application-1' })
        const cv = new File(['resume'], 'resume.pdf', { type: 'application/pdf' })

        await createApplication('job-1', {
            coverLetter: 'Hello',
            cv,
            cvRetentionConsent: true,
        })

        const body = post.mock.calls[0][1] as FormData
        expect(post).toHaveBeenCalledWith('/jobs/job-1/applications', body)
        expect(body).toBeInstanceOf(FormData)
        expect(body.get('coverLetter')).toBe('Hello')
        expect(body.get('cv')).toBe(cv)
        expect(body.get('cvRetentionConsent')).toBe('true')
    })

    it('sends false consent and does not include a CV when none is selected', async () => {
        post.mockResolvedValue({ id: 'application-2' })

        await createApplication('job-2', { coverLetter: 'Hello' })

        const body = post.mock.calls[0][1] as FormData
        expect(body.get('coverLetter')).toBe('Hello')
        expect(body.get('cv')).toBeNull()
        expect(body.get('cvRetentionConsent')).toBe('false')
    })
})
