import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Profile Operations', () => {
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

  describe('Profile Management', () => {
    it('should fetch user profile', async () => {
      const mockProfile = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-0123',
        address: {
          street: '123 Main St',
          city: 'City',
          state: 'State',
          zip: '12345',
          country: 'USA'
        },
        preferences: {
          newsletter: true,
          notifications: true,
          theme: 'light'
        },
        created_at: '2024-01-01',
        last_login: '2024-01-15'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile
      })

      const response = await fetch('http://localhost:8000/api/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/profile',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include'
        })
      )
      expect(data.name).toBe('John Doe')
      expect(data.email).toBe('john@example.com')
    })

    it('should update user profile', async () => {
      const updateData = {
        name: 'John Updated',
        phone: '555-9999',
        address: {
          street: '456 Oak Ave',
          city: 'New City',
          state: 'New State',
          zip: '67890',
          country: 'USA'
        }
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true,
          message: 'Profile updated successfully',
          profile: { id: 'user-123', ...updateData }
        })
      })

      const response = await fetch('http://localhost:8000/api/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/profile',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData)
        })
      )
      expect(data.success).toBe(true)
      expect(data.profile.name).toBe('John Updated')
    })

    it('should change password', async () => {
      const passwordData = {
        current_password: 'oldpassword123',
        new_password: 'newpassword123',
        new_password_confirmation: 'newpassword123'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true,
          message: 'Password changed successfully'
        })
      })

      const response = await fetch('http://localhost:8000/api/profile/change-password', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token',
          'Accept': 'application/json'
        },
        body: JSON.stringify(passwordData)
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/profile/change-password',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(passwordData)
        })
      )
      expect(data.success).toBe(true)
    })

    it('should upload profile picture', async () => {
      const formData = new FormData()
      formData.append('avatar', new File(['avatar-content'], 'avatar.jpg', { type: 'image/jpeg' }))

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true,
          avatar_url: 'http://localhost:8000/storage/avatars/user-123.jpg'
        })
      })

      const response = await fetch('http://localhost:8000/api/profile/avatar', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-XSRF-TOKEN': 'test-csrf-token',
          'Accept': 'application/json'
        },
        body: formData
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/profile/avatar',
        expect.objectContaining({
          method: 'POST',
          body: formData
        })
      )
      expect(data.success).toBe(true)
    })

    it('should update preferences', async () => {
      const preferencesData = {
        newsletter: false,
        notifications: true,
        theme: 'dark',
        language: 'en'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true,
          message: 'Preferences updated successfully'
        })
      })

      const response = await fetch('http://localhost:8000/api/profile/preferences', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token',
          'Accept': 'application/json'
        },
        body: JSON.stringify(preferencesData)
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/profile/preferences',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(preferencesData)
        })
      )
      expect(data.success).toBe(true)
    })

    it('should fetch order history', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          status: 'completed',
          total: 99.99,
          created_at: '2024-01-10',
          items: [
            { title: 'Product 1', quantity: 2, price: 29.99 }
          ]
        },
        {
          id: 'order-2',
          status: 'shipped',
          total: 149.99,
          created_at: '2024-01-05',
          items: [
            { title: 'Product 2', quantity: 1, price: 149.99 }
          ]
        }
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders
      })

      const response = await fetch('http://localhost:8000/api/profile/orders', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/profile/orders',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include'
        })
      )
      expect(data).toHaveLength(2)
    })

    it('should delete account', async () => {
      const deleteData = {
        password: 'password123',
        confirmation: 'DELETE MY ACCOUNT'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true,
          message: 'Account deleted successfully'
        })
      })

      const response = await fetch('http://localhost:8000/api/profile/delete', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token',
          'Accept': 'application/json'
        },
        body: JSON.stringify(deleteData)
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/profile/delete',
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify(deleteData)
        })
      )
      expect(data.success).toBe(true)
    })

    it('should handle invalid current password', async () => {
      const passwordData = {
        current_password: 'wrongpassword',
        new_password: 'newpassword123',
        new_password_confirmation: 'newpassword123'
      }

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ 
          error: 'Current password is incorrect'
        })
      })

      const response = await fetch('http://localhost:8000/api/profile/change-password', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token'
        },
        body: JSON.stringify(passwordData)
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
    })

    it('should handle profile not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ 
          error: 'Profile not found'
        })
      })

      const response = await fetch('http://localhost:8000/api/profile', {
        method: 'GET',
        credentials: 'include'
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
    })

    it('should handle network error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      try {
        await fetch('http://localhost:8000/api/profile', {
          method: 'GET',
          credentials: 'include'
        })
      } catch (error) {
        expect(error.message).toBe('Network error')
      }
    })
  })
})
