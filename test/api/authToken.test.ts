import { beforeEach, describe, expect, it } from 'vitest'
import { authToken } from '../../src/services/api/authToken'

describe('authToken', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when no token exists', () => {
    expect(authToken.get()).toBeNull()
  })

  it('stores an access token', () => {
    authToken.set('test-token')

    expect(localStorage.getItem('it-talent-access-token')).toBe('test-token')
  })

  it('returns the stored access token', () => {
    authToken.set('test-token')

    expect(authToken.get()).toBe('test-token')
  })

  it('replaces an existing access token', () => {
    authToken.set('old-token')
    authToken.set('new-token')

    expect(authToken.get()).toBe('new-token')
  })

  it('clears the access token', () => {
    authToken.set('test-token')

    authToken.clear()

    expect(authToken.get()).toBeNull()
  })
})
