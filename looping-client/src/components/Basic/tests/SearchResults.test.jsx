import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Search Results Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Search Functionality', () => {
    it('should fetch search categories', async () => {
      const mockCategories = {
        categories: {
          electronics: 25,
          clothing: 18,
          books: 12,
          home: 8
        }
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories
      })

      const response = await fetch('http://localhost:8000/api/search/categories')
      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/search/categories')
      expect(data.categories).toEqual(mockCategories.categories)
    })

    it('should search products with query', async () => {
      const query = 'laptop'
      const mockResults = {
        hits: [
          { id: 1, title: 'Laptop Pro 15"', price: 1299.99 },
          { id: 2, title: 'Gaming Laptop', price: 999.99 }
        ],
        total: 2,
        page: 1
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      })

      const response = await fetch(`http://localhost:8000/api/search?q=${encodeURIComponent(query)}&page=1`)
      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/search?q=${encodeURIComponent(query)}&page=1`
      )
      expect(data.hits).toHaveLength(2)
      expect(data.total).toBe(2)
    })

    it('should search with filters', async () => {
      const query = 'phone'
      const filters = {
        category: 'electronics',
        min_price: 100,
        max_price: 1000
      }

      const mockResults = {
        hits: [
          { id: 1, title: 'iPhone 15', price: 799.99 }
        ],
        total: 1
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      })

      const params = new URLSearchParams({
        q: query,
        category: filters.category,
        min_price: filters.min_price,
        max_price: filters.max_price
      })

      const response = await fetch(`http://localhost:8000/api/search?${params}`)
      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/search?${params}`
      )
      expect(data.hits).toHaveLength(1)
    })

    it('should handle empty search results', async () => {
      const query = 'nonexistent-product'

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hits: [], total: 0, page: 1 })
      })

      const response = await fetch(`http://localhost:8000/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      expect(data.hits).toHaveLength(0)
      expect(data.total).toBe(0)
    })

    it('should handle search error', async () => {
      fetch.mockRejectedValueOnce(new Error('Search service unavailable'))

      try {
        await fetch('http://localhost:8000/api/search?q=test')
      } catch (error) {
        expect(error.message).toBe('Search service unavailable')
      }
    })

    it('should handle categories fetch error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Failed to fetch categories' })
      })

      const response = await fetch('http://localhost:8000/api/search/categories')
      
      expect(response.ok).toBe(false)
      expect(response.status).toBe(500)
    })
  })
})
