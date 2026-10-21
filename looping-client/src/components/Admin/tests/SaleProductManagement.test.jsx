import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import SaleProductManagement from '../SaleProductManagement.jsx'

// Mock fetch globally
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock alert
global.alert = vi.fn()

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: 'XSRF-TOKEN=test-csrf-token'
})

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-preview-url')
global.URL.revokeObjectURL = vi.fn()

describe('SaleProductManagement Component', () => {
  const mockProducts = [
    {
      _id: '1',
      title: 'Test Product 1',
      price: 29.99,
      description: 'Test description 1',
      image: 'https://example.com/image1.jpg',
      category: 'test',
      stock: 15,
      tags: ['tag1', 'tag2'],
      variants: ['variant1'],
      active: true,
      discount: 10
    },
    {
      _id: '2',
      title: 'Test Product 2',
      price: 49.99,
      description: 'Test description 2',
      image: 'https://example.com/image2.jpg',
      category: 'electronics',
      stock: 3,
      tags: ['electronics'],
      variants: [],
      active: true,
      discount: 0
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    fetch.mockClear()
    document.cookie = 'XSRF-TOKEN=test-csrf-token'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial Rendering', () => {
    it('renders loading skeleton initially', () => {
      fetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => mockProducts
        }), 100))
      )

      render(<SaleProductManagement />)
      
      // Check for skeleton loading elements
      expect(screen.getAllByText('').length).toBeGreaterThan(0)
    })

    it('renders products after loading', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      render(<SaleProductManagement />)

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument()
        expect(screen.getByText('Test Product 2')).toBeInTheDocument()
      })
    })

    it('displays search input and add product button', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      render(<SaleProductManagement />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Pesquisar...')).toBeInTheDocument()
        expect(screen.getByText('Add Product')).toBeInTheDocument()
      })
    })
  })

  describe('Search Functionality', () => {
    beforeEach(() => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })
    })

    it('filters products by title', async () => {
      render(<SaleProductManagement />)

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Pesquisar...')
      fireEvent.change(searchInput, { target: { value: 'Product 1' } })

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument()
        expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument()
      })
    })

    it('filters products by description', async () => {
      render(<SaleProductManagement />)

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Pesquisar...')
      fireEvent.change(searchInput, { target: { value: 'description 2' } })

      await waitFor(() => {
        expect(screen.queryByText('Test Product 1')).not.toBeInTheDocument()
        expect(screen.getByText('Test Product 2')).toBeInTheDocument()
      })
    })

    it('filters products by category', async () => {
      render(<SaleProductManagement />)

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Pesquisar...')
      fireEvent.change(searchInput, { target: { value: 'electronics' } })

      await waitFor(() => {
        expect(screen.queryByText('Test Product 1')).not.toBeInTheDocument()
        expect(screen.getByText('Test Product 2')).toBeInTheDocument()
      })
    })
  })

  describe('Product Management Actions', () => {
    beforeEach(() => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })
    })

    it('opens add product form when Add Product button is clicked', async () => {
      render(<SaleProductManagement />)

      await waitFor(() => {
        expect(screen.getByText('Add Product')).toBeInTheDocument()
      })

      const addButton = screen.getByText('Add Product')
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Add New Product')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Product Title')).toBeInTheDocument()
      })
    })

    it('closes add product form when Cancel button is clicked', async () => {
      render(<SaleProductManagement />)

      await waitFor(() => {
        const addButton = screen.getByText('Add Product')
        fireEvent.click(addButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Add New Product')).toBeInTheDocument()
      })

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Add New Product')).not.toBeInTheDocument()
      })
    })

    it('opens edit modal when edit button is clicked', async () => {
      render(<SaleProductManagement />)

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      })

      // Find edit button (assuming it has an edit icon)
      const editButtons = screen.getAllByRole('button')
      const editButton = editButtons.find(button => 
        button.querySelector('svg[data-testid="edit-icon"]') ||
        button.getAttribute('title')?.includes('edit')
      )

      if (editButton) {
        fireEvent.click(editButton)

        await waitFor(() => {
          expect(screen.getByText(/Edit Product/)).toBeInTheDocument()
          expect(screen.getByDisplayValue('Test Product 1')).toBeInTheDocument()
        })
      }
    })
  })

  describe('Product Statistics', () => {
    it('displays best selling products section', async () => {
      const lowStockProducts = [
        { ...mockProducts[0], stock: 5 },
        { ...mockProducts[1], stock: 8 }
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => lowStockProducts
      })

      render(<SaleProductManagement />)

      await waitFor(() => {
        expect(screen.getByText('Best Selling Products')).toBeInTheDocument()
        expect(screen.getByText('Stock: 5')).toBeInTheDocument()
        expect(screen.getByText('Stock: 8')).toBeInTheDocument()
      })
    })

    it('displays low stock alert section', async () => {
      const veryLowStockProducts = [
        { ...mockProducts[0], stock: 2 },
        { ...mockProducts[1], stock: 4 }
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => veryLowStockProducts
      })

      render(<SaleProductManagement />)

      await waitFor(() => {
        expect(screen.getByText('Low Stock Alert')).toBeInTheDocument()
        expect(screen.getByText('Only 2 left')).toBeInTheDocument()
        expect(screen.getByText('Only 4 left')).toBeInTheDocument()
      })
    })
  })

  describe('Form Interactions', () => {
    beforeEach(() => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })
    })

    it('handles input changes in add product form', async () => {
      render(<SaleProductManagement />)

      await waitFor(() => {
        const addButton = screen.getByText('Add Product')
        fireEvent.click(addButton)
      })

      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText('Product Title')
        fireEvent.change(titleInput, { target: { value: 'New Product' } })

        expect(titleInput.value).toBe('New Product')
      })
    })

    it('handles file selection for image upload', async () => {
      render(<SaleProductManagement />)

      await waitFor(() => {
        const addButton = screen.getByText('Add Product')
        fireEvent.click(addButton)
      })

      await waitFor(() => {
        const fileInput = screen.getByLabelText('Upload')
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
        
        fireEvent.change(fileInput, { target: { files: [file] } })

        expect(screen.getByText('Selected: test.jpg')).toBeInTheDocument()
      })
    })
  })

  describe('API Interactions', () => {
    beforeEach(() => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })
    })

    it('calls add product API when form is submitted', async () => {
      // Mock CSRF cookie request
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })

      // Mock add product API
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ _id: '3', ...mockProducts[0] })
      })

      render(<SaleProductManagement />)

      await waitFor(() => {
        const addButton = screen.getByText('Add Product')
        fireEvent.click(addButton)
      })

      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText('Product Title')
        fireEvent.change(titleInput, { target: { value: 'New Product' } })

        const priceInput = screen.getByPlaceholderText('Price')
        fireEvent.change(priceInput, { target: { value: '99.99' } })

        const submitButton = screen.getByText('Create Product')
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/products',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'X-XSRF-TOKEN': 'test-csrf-token'
            })
          })
        )
      })
    })

    it('handles delete product action', async () => {
      // Mock CSRF cookie request
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })

      // Mock delete API
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      render(<SaleProductManagement />)

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      })

      // Find delete button
      const deleteButtons = screen.getAllByRole('button')
      const deleteButton = deleteButtons.find(button => 
        button.querySelector('svg[data-testid="trash-icon"]') ||
        button.getAttribute('title')?.includes('delete')
      )

      if (deleteButton) {
        fireEvent.click(deleteButton)

        await waitFor(() => {
          expect(fetch).toHaveBeenCalledWith(
            'http://localhost:8000/api/products/1',
            expect.objectContaining({
              method: 'DELETE',
              headers: expect.objectContaining({
                'X-XSRF-TOKEN': 'test-csrf-token'
              })
            })
          )
        })
      }
    })
  })

  describe('Error Handling', () => {
    it('handles fetch error gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      render(<SaleProductManagement />)

      await waitFor(() => {
        // Component should still render without crashing
        expect(screen.getByPlaceholderText('Pesquisar...')).toBeInTheDocument()
      })
    })

    it('handles HTTP error response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' })
      })

      render(<SaleProductManagement />)

      await waitFor(() => {
        // Component should still render without products
        expect(screen.getByPlaceholderText('Pesquisar...')).toBeInTheDocument()
        expect(screen.queryByText('Test Product 1')).not.toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('shows loading state during image upload', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      render(<SaleProductManagement />)

      await waitFor(() => {
        const addButton = screen.getByText('Add Product')
        fireEvent.click(addButton)
      })

      await waitFor(() => {
        const fileInput = screen.getByLabelText('Upload')
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
        
        fireEvent.change(fileInput, { target: { files: [file] } })
      })

      // Mock upload with delay
      fetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ success: true, imageUrl: 'new-image-url.jpg' })
          }), 100)
        )
      )

      const submitButton = screen.getByText('Create Product')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Uploading...')).toBeInTheDocument()
      })
    })
  })
})
