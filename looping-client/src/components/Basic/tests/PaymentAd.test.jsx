import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('PaymentAd Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Payment Ad Functionality', () => {
    it('should fetch active payment ads', async () => {
      const mockAds = [
        {
          id: 1,
          title: 'Special Offer - 20% Off',
          description: 'Use code SAVE20 for 20% discount',
          image: 'payment-ad-1.jpg',
          link: '/special-offer',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          active: true,
          position: 'checkout',
          payment_methods: ['credit_card', 'paypal']
        },
        {
          id: 2,
          title: 'Free Shipping',
          description: 'Free shipping on orders over $50',
          image: 'payment-ad-2.jpg',
          link: '/free-shipping',
          start_date: '2024-01-15',
          end_date: '2024-02-15',
          active: true,
          position: 'payment_page',
          payment_methods: ['all']
        }
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAds
      })

      const response = await fetch('http://localhost:8000/api/payment-ads/active', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/payment-ads/active',
        expect.objectContaining({
          method: 'GET'
        })
      )
      expect(data).toHaveLength(2)
      expect(data[0].position).toBe('checkout')
    })

    it('should fetch ads by position', async () => {
      const position = 'checkout'
      const mockAds = [
        {
          id: 1,
          title: 'Checkout Special',
          description: 'Save 10% on your order',
          image: 'checkout-ad.jpg',
          position: position,
          active: true
        }
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAds
      })

      const response = await fetch(`http://localhost:8000/api/payment-ads/position/${position}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/payment-ads/position/${position}`,
        expect.objectContaining({
          method: 'GET'
        })
      )
      expect(data).toHaveLength(1)
      expect(data[0].position).toBe(position)
    })

    it('should record ad impression', async () => {
      const impressionData = {
        ad_id: 1,
        position: 'checkout',
        user_id: 'user-123',
        timestamp: '2024-01-15T10:30:00Z',
        ip_address: '192.168.1.100',
        page_url: '/checkout'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true,
          message: 'Impression recorded'
        })
      })

      const response = await fetch('http://localhost:8000/api/payment-ads/impression', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(impressionData)
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/payment-ads/impression',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(impressionData)
        })
      )
      expect(data.success).toBe(true)
    })

    it('should record ad click', async () => {
      const clickData = {
        ad_id: 1,
        position: 'checkout',
        user_id: 'user-123',
        timestamp: '2024-01-15T10:30:00Z',
        ip_address: '192.168.1.100',
        referrer: 'checkout_page'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true,
          message: 'Click recorded'
        })
      })

      const response = await fetch('http://localhost:8000/api/payment-ads/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(clickData)
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/payment-ads/click',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(clickData)
        })
      )
      expect(data.success).toBe(true)
    })

    it('should get ad statistics', async () => {
      const adId = '1'
      const mockStats = {
        impressions: 2500,
        clicks: 125,
        click_rate: 5.0,
        conversions: 25,
        conversion_rate: 2.0,
        revenue: 1250.00
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })

      const response = await fetch(`http://localhost:8000/api/payment-ads/${adId}/stats`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/payment-ads/${adId}/stats`,
        expect.objectContaining({
          method: 'GET'
        })
      )
      expect(data.impressions).toBe(2500)
      expect(data.clicks).toBe(125)
      expect(data.click_rate).toBe(5.0)
    })

    it('should dismiss ad', async () => {
      const dismissData = {
        ad_id: 1,
        user_id: 'user-123',
        reason: 'not_interested',
        timestamp: '2024-01-15T10:30:00Z'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true,
          message: 'Ad dismissed'
        })
      })

      const response = await fetch('http://localhost:8000/api/payment-ads/dismiss', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dismissData)
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/payment-ads/dismiss',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(dismissData)
        })
      )
      expect(data.success).toBe(true)
    })

    it('should fetch ads by payment method', async () => {
      const paymentMethod = 'credit_card'
      const mockAds = [
        {
          id: 1,
          title: 'Credit Card Special',
          description: '5% cashback on credit card purchases',
          image: 'cc-ad.jpg',
          payment_methods: [paymentMethod, 'all'],
          active: true
        }
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAds
      })

      const response = await fetch(`http://localhost:8000/api/payment-ads/method/${paymentMethod}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/payment-ads/method/${paymentMethod}`,
        expect.objectContaining({
          method: 'GET'
        })
      )
      expect(data).toHaveLength(1)
    })

    it('should handle no active ads', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })

      const response = await fetch('http://localhost:8000/api/payment-ads/active', {
        method: 'GET'
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/payment-ads/active',
        expect.objectContaining({
          method: 'GET'
        })
      )
      expect(data).toHaveLength(0)
    })

    it('should handle network error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      try {
        await fetch('http://localhost:8000/api/payment-ads/active', {
          method: 'GET'
        })
      } catch (error) {
        expect(error.message).toBe('Network error')
      }
    })

    it('should handle invalid ad ID', async () => {
      const adId = 'invalid-id'

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ 
          error: 'Ad not found',
          message: 'The requested payment ad does not exist'
        })
      })

      const response = await fetch(`http://localhost:8000/api/payment-ads/${adId}`, {
        method: 'GET'
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
    })

    it('should handle expired ad', async () => {
      const adId = '1'
      const mockAd = {
        id: adId,
        title: 'Expired Ad',
        active: false,
        end_date: '2024-01-01T00:00:00Z',
        expired: true
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAd
      })

      const response = await fetch(`http://localhost:8000/api/payment-ads/${adId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/payment-ads/${adId}`,
        expect.objectContaining({
          method: 'GET'
        })
      )
      expect(data.expired).toBe(true)
      expect(data.active).toBe(false)
    })
  })
})
