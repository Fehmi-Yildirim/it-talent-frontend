import { beforeEach, describe, expect, it, vi } from 'vitest'

const post = vi.hoisted(() => vi.fn())

vi.mock('../../../src/services/api/apiClient', () => ({
    apiClient: { post },
}))

import { createApplication } from '../../../src/features/applications/applications.api'

describe('createApplication', () => {
    beforeEach(() => post.mockReset())

    it('sends the cover letter as JSON', async () => {
        post.mockResolvedValue({ id: 'application-1' })

        await createApplication('job-1', {
            coverLetter: 'Hello',
        })

        expect(post).toHaveBeenCalledWith('/jobs/job-1/applications', {
            coverLetter: 'Hello',
        })
    })

    it('sends an empty cover letter when provided', async () => {
        post.mockResolvedValue({ id: 'application-2' })

        await createApplication('job-2', {
            coverLetter: '',
        })

        expect(post).toHaveBeenCalledWith('/jobs/job-2/applications', {
            coverLetter: '',
        })
    })
})
