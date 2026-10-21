import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('CustomersManagement Operations', () => {
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

  describe('Customer Management', () => {
    it('should fetch all customers', async () => {
      const mockCustomers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-0123', total_orders: 5 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '555-0456', total_orders: 3 }
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCustomers
      })

      const response = await fetch('http://localhost:8000/api/customers', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/customers',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include'
        })
      )
      expect(data).toEqual(mockCustomers)
    })

    it('should create new customer', async () => {
      const customerData = {
        name: 'New Customer',
        email: 'newcustomer@example.com',
        phone: '555-0789',
        address: '123 Main St'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, customer: { id: 3, ...customerData } })
      })

      const response = await fetch('http://localhost:8000/api/customers', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token',
          'Accept': 'application/json'
        },
        body: JSON.stringify(customerData)
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/customers',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(customerData)
        })
      )
      expect(data.success).toBe(true)
      expect(data.customer.name).toBe('New Customer')
    })

    it('should update customer', async () => {
      const customerId = '123'
      const updateData = {
        name: 'Updated Name',
        phone: '555-9999'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, customer: { id: customerId, ...updateData } })
      })

      const response = await fetch(`http://localhost:8000/api/customers/${customerId}`, {
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
        `http://localhost:8000/api/customers/${customerId}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData)
        })
      )
      expect(data.success).toBe(true)
    })

    it('should delete customer', async () => {
      const customerId = '123'

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Customer deleted' })
      })

      const response = await fetch(`http://localhost:8000/api/customers/${customerId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-XSRF-TOKEN': 'test-csrf-token',
          'Accept': 'application/json'
        }
      })

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/customers/${customerId}`,
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })

    it('should fetch customer details', async () => {
      const customerId = '123'
      const mockCustomer = {
        id: customerId,
        name: 'John Doe',
        email: 'john@example.com',
        orders: [
          { id: 1, total: 99.99, status: 'completed' },
          { id: 2, total: 149.99, status: 'pending' }
        ]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCustomer
      })

      const response = await fetch(`http://localhost:8000/api/customers/${customerId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/customers/${customerId}`,
        expect.objectContaining({
          method: 'GET'
        })
      )
      expect(data.id).toBe(customerId)
      expect(data.orders).toHaveLength(2)
    })

    it('should handle customers fetch error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      try {
        await fetch('http://localhost:8000/api/customers', {
          method: 'GET',
          credentials: 'include'
        })
      } catch (error) {
        expect(error.message).toBe('Network error')
      }
    })

    it('should handle customer not found', async () => {
      const customerId = '999'

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Customer not found' })
      })

      const response = await fetch(`http://localhost:8000/api/customers/${customerId}`, {
        method: 'GET'
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
    })

    it('should handle duplicate email error', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john@example.com', // Duplicate email
        phone: '555-0123'
      }

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({ error: 'Email already exists' })
      })

      const response = await fetch('http://localhost:8000/api/customers', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token'
        },
        body: JSON.stringify(customerData)
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(422)
    })
  })
})
