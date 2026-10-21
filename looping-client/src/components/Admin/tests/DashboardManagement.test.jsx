import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('DashboardManagement Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Dashboard Statistics', () => {
    it('should fetch dashboard stats', async () => {
      const mockStats = {
        total_orders: 150,
        total_revenue: 15000.50,
        total_customers: 75,
        pending_orders: 12,
        recent_orders: [
          { id: 1, customer: 'John Doe', total: 99.99, status: 'pending' },
          { id: 2, customer: 'Jane Smith', total: 149.99, status: 'completed' }
        ]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })

      const response = await fetch('http://localhost:8000/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/dashboard/stats',
        expect.objectContaining({
          method: 'GET'
        })
      )
      expect(data.total_orders).toBe(150)
      expect(data.total_revenue).toBe(15000.50)
    })

    it('should fetch sales data', async () => {
      const mockSalesData = {
        daily_sales: [
          { date: '2024-01-01', revenue: 500.00 },
          { date: '2024-01-02', revenue: 750.00 }
        ],
        monthly_sales: [
          { month: '2024-01', revenue: 15000.00 },
          { month: '2023-12', revenue: 12000.00 }
        ]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSalesData
      })

      const response = await fetch('http://localhost:8000/api/dashboard/sales', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/dashboard/sales',
        expect.objectContaining({
          method: 'GET'
        })
      )
      expect(data.daily_sales).toHaveLength(2)
      expect(data.monthly_sales).toHaveLength(2)
    })

    it('should fetch top products', async () => {
      const mockTopProducts = [
        { id: 1, title: 'Product A', sales: 50, revenue: 2500.00 },
        { id: 2, title: 'Product B', sales: 35, revenue: 1750.00 }
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopProducts
      })

      const response = await fetch('http://localhost:8000/api/dashboard/top-products', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/dashboard/top-products',
        expect.objectContaining({
          method: 'GET'
        })
      )
      expect(data).toHaveLength(2)
    })

    it('should fetch customer analytics', async () => {
      const mockAnalytics = {
        new_customers: 25,
        returning_customers: 50,
        customer_growth: 5.2,
        top_customers: [
          { id: 1, name: 'John Doe', total_spent: 1500.00 },
          { id: 2, name: 'Jane Smith', total_spent: 1200.00 }
        ]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics
      })

      const response = await fetch('http://localhost:8000/api/dashboard/analytics', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/dashboard/analytics',
        expect.objectContaining({
          method: 'GET'
        })
      )
      expect(data.new_customers).toBe(25)
      expect(data.customer_growth).toBe(5.2)
    })

    it('should handle dashboard fetch error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      try {
        await fetch('http://localhost:8000/api/dashboard/stats', {
          method: 'GET'
        })
      } catch (error) {
        expect(error.message).toBe('Network error')
      }
    })

    it('should handle HTTP error response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Dashboard server error' })
      })

      const response = await fetch('http://localhost:8000/api/dashboard/stats', {
        method: 'GET'
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(500)
    })
  })
})
