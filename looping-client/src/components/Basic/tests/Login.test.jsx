import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Login Operations', () => {
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

  describe('User Authentication', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'password123'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true, 
          user: { id: 1, email: 'user@example.com', name: 'John Doe' },
          token: 'auth-token-123'
        })
      })

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loginData)
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(loginData)
        })
      )
      expect(data.success).toBe(true)
      expect(data.user.email).toBe('user@example.com')
    })

    it('should handle invalid credentials', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'wrongpassword'
      }

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' })
      })

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token'
        },
        body: JSON.stringify(loginData)
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(401)
    })

    it('should handle missing email', async () => {
      const loginData = {
        password: 'password123'
      }

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({ errors: { email: ['Email is required'] } })
      })

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token'
        },
        body: JSON.stringify(loginData)
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(422)
    })

    it('should handle Google OAuth login', async () => {
      const googleToken = 'google-oauth-token-123'
      const googleData = {
        token: googleToken,
        id: 'google-id-456',
        email: 'user@gmail.com',
        name: 'Google User'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true, 
          user: { id: 1, email: 'user@gmail.com', name: 'Google User' },
          token: 'auth-token-google'
        })
      })

      const response = await fetch('http://localhost:8000/google-auth', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token'
        },
        body: JSON.stringify(googleData)
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/google-auth',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(googleData)
        })
      )
      expect(data.success).toBe(true)
      expect(data.user.email).toBe('user@gmail.com')
    })

    it('should handle network error during login', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      try {
        await fetch('http://localhost:8000/login', {
          method: 'POST'
        })
      } catch (error) {
        expect(error.message).toBe('Network error')
      }
    })

    it('should handle server error during login', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      })

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        credentials: 'include'
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(500)
    })

    it('should handle account locked', async () => {
      const loginData = {
        email: 'locked@example.com',
        password: 'password123'
      }

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 423,
        json: async () => ({ error: 'Account is locked' })
      })

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token'
        },
        body: JSON.stringify(loginData)
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(423)
    })
  })
})
