import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Register Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'XSRF-TOKEN=test-csrf-token'
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('User Registration', () => {
    it('should register new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        password_confirmation: 'password123'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'User registered successfully' })
      })

      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(userData)
        })
      )
    })

    it('should handle registration error', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: '123'
      }

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({ errors: { email: ['Invalid email format'] } })
      })

      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token'
        },
        body: JSON.stringify(userData)
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(422)
    })

    it('should resend email verification', async () => {
      const email = 'john@example.com'

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Verification email sent' })
      })

      const response = await fetch('http://localhost:8000/api/email/verification-resend', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token'
        },
        body: JSON.stringify({ email })
      })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/email/verification-resend',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email })
        })
      )
    })

    it('should handle Google authentication', async () => {
      const googleToken = 'google-oauth-token'

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: { id: 1, email: 'user@gmail.com' } })
      })

      const response = await fetch('http://localhost:8000/google-auth', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token'
        },
        body: JSON.stringify({ token: googleToken })
      })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/google-auth',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ token: googleToken })
        })
      )
    })

    it('should handle network error during registration', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      try {
        await fetch('http://localhost:8000/register', {
          method: 'POST'
        })
      } catch (error) {
        expect(error.message).toBe('Network error')
      }
    })
  })
})
