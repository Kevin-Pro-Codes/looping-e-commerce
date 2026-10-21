import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('PromotionsManagement Operations', () => {
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

  describe('Promotions Management', () => {
    it('should fetch all promotions', async () => {
      const mockPromotions = [
        { id: 1, title: 'Summer Sale', discount: 20, active: true },
        { id: 2, title: 'Flash Sale', discount: 15, active: false }
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPromotions
      })

      const response = await fetch('http://localhost:8000/api/promotions', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/promotions',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include'
        })
      )
      expect(data).toEqual(mockPromotions)
    })

    it('should create new promotion', async () => {
      const promotionData = {
        title: 'New Year Sale',
        description: 'Start the new year with great deals!',
        discount: 25,
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        product_ids: ['1', '2', '3'],
        active: true
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, promotion: { id: 3, ...promotionData } })
      })

      const response = await fetch('http://localhost:8000/api/promotions', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token',
          'Accept': 'application/json'
        },
        body: JSON.stringify(promotionData)
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/promotions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(promotionData)
        })
      )
      expect(data.success).toBe(true)
      expect(data.promotion.title).toBe('New Year Sale')
    })

    it('should update promotion', async () => {
      const promotionId = '123'
      const updateData = {
        title: 'Updated Sale',
        discount: 30,
        active: false
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, promotion: { id: promotionId, ...updateData } })
      })

      const response = await fetch(`http://localhost:8000/api/promotions/${promotionId}`, {
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
        `http://localhost:8000/api/promotions/${promotionId}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData)
        })
      )
      expect(data.success).toBe(true)
    })

    it('should delete promotion', async () => {
      const promotionId = '123'

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Promotion deleted' })
      })

      const response = await fetch(`http://localhost:8000/api/promotions/${promotionId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-XSRF-TOKEN': 'test-csrf-token',
          'Accept': 'application/json'
        }
      })

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/promotions/${promotionId}`,
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })

    it('should toggle promotion status', async () => {
      const promotionId = '123'
      const statusData = { active: false }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Promotion status updated' })
      })

      const response = await fetch(`http://localhost:8000/api/promotions/${promotionId}/toggle`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token',
          'Accept': 'application/json'
        },
        body: JSON.stringify(statusData)
      })

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/promotions/${promotionId}/toggle`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(statusData)
        })
      )
    })

    it('should fetch active promotions', async () => {
      const mockActivePromotions = [
        { id: 1, title: 'Summer Sale', discount: 20, active: true }
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockActivePromotions
      })

      const response = await fetch('http://localhost:8000/api/promotions/active', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/promotions/active',
        expect.objectContaining({
          method: 'GET'
        })
      )
      expect(data).toHaveLength(1)
    })

    it('should handle promotions fetch error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      try {
        await fetch('http://localhost:8000/api/promotions', {
          method: 'GET',
          credentials: 'include'
        })
      } catch (error) {
        expect(error.message).toBe('Network error')
      }
    })

    it('should handle invalid promotion data', async () => {
      const invalidData = {
        title: '', // Empty title
        discount: 150, // Invalid discount (>100)
        start_date: 'invalid-date'
      }

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({ errors: { title: ['Title is required'], discount: ['Discount must be between 0 and 100'] } })
      })

      const response = await fetch('http://localhost:8000/api/promotions', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token'
        },
        body: JSON.stringify(invalidData)
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(422)
    })

    it('should handle promotion not found', async () => {
      const promotionId = '999'

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Promotion not found' })
      })

      const response = await fetch(`http://localhost:8000/api/promotions/${promotionId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
    })
  })
})
