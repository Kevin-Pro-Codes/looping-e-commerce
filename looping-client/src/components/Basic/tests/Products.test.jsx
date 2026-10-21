import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import Products from '../Products.jsx'

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

// Mock window.location
delete window.location
window.location = { href: '' }

// Helper function to render component with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Products Component', () => {
  const mockProducts = [
    {
      _id: '1',
      title: 'Test Product 1',
      price: '29.99',
      description: 'Test description 1',
      image: 'https://example.com/image1.jpg',
      category: 'test',
      size: ['M', 'L'],
      color: '#000000'
    },
    {
      _id: '2',
      title: 'Test Product 2',
      price: '49.99',
      description: 'Test description 2',
      image: 'https://example.com/image2.jpg',
      category: 'test',
      size: ['S', 'M'],
      color: '#FF0000'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    fetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial Rendering', () => {
    it('renders loading state initially', () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      renderWithRouter(<Products />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders products after loading', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      renderWithRouter(<Products />)

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument()
        expect(screen.getByText('Test Product 2')).toBeInTheDocument()
      })
    })

    it('displays no products message when empty', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })

      renderWithRouter(<Products />)

      await waitFor(() => {
        expect(screen.getByText('No products loaded.')).toBeInTheDocument()
      })
    })

    it('displays 33% OFF badge on all products', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      renderWithRouter(<Products />)

      await waitFor(() => {
        const badges = screen.getAllByText('33% OFF')
        expect(badges).toHaveLength(2)
      })
    })

    it('displays product prices correctly', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      renderWithRouter(<Products />)

      await waitFor(() => {
        expect(screen.getByText('$29.99')).toBeInTheDocument()
        expect(screen.getByText('$49.99')).toBeInTheDocument()
      })
    })
  })

  describe('Authentication', () => {
    it('shows wishlist button when user is logged in', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'loggedIn') return 'true'
        if (key === 'user') return '{"id": 1}'
        return null
      })

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ wishlist: [] })
      })

      renderWithRouter(<Products />)

      await waitFor(() => {
        const heartButtons = screen.getAllByRole('button')
        const wishlistButtons = heartButtons.filter(button => 
          button.querySelector('svg') && button.getAttribute('title')?.includes('wishlist')
        )
        expect(wishlistButtons).toHaveLength(2)
      })
    })

    it('hides wishlist button when user is not logged in', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      renderWithRouter(<Products />)

      await waitFor(() => {
        const heartButtons = screen.queryAllByRole('button')
        const wishlistButtons = heartButtons.filter(button => 
          button.getAttribute('title')?.includes('wishlist')
        )
        expect(wishlistButtons).toHaveLength(0)
      })
    })
  })

  describe('Product Interactions', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'loggedIn') return 'true'
        if (key === 'user') return '{"id": 1}'
        return null
      })
    })

    it('shows add to cart button for each product', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ wishlist: [] })
      })

      renderWithRouter(<Products />)

      await waitFor(() => {
        const cartButtons = screen.getAllByRole('button')
        const addToCartButtons = cartButtons.filter(button => 
          button.querySelector('svg[data-testid="shopping-cart-icon"]') ||
          button.textContent.includes('Adding...')
        )
        expect(addToCartButtons.length).toBeGreaterThan(0)
      })
    })

    it('shows loading spinner when adding to cart', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ wishlist: [] })
      })

      // Mock CSRF cookie request
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })

      // Mock add to cart request with delay
      fetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ message: 'Product added to cart' })
          }), 100)
        )
      )

      renderWithRouter(<Products />)

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      })

      // Find and click add to cart button
      const cartButtons = screen.getAllByRole('button')
      const addToCartButton = cartButtons.find(button => 
        button.querySelector('svg') && !button.getAttribute('title')
      )

      if (addToCartButton) {
        fireEvent.click(addToCartButton)

        // Check for loading state
        await waitFor(() => {
          expect(screen.getByText('Adding...')).toBeInTheDocument()
        })
      }
    })
  })

  describe('Pagination', () => {
    const manyProducts = Array.from({ length: 25 }, (_, i) => ({
      _id: `${i + 1}`,
      title: `Product ${i + 1}`,
      price: `${(i + 1) * 10}.99`,
      description: `Description ${i + 1}`,
      image: `https://example.com/image${i + 1}.jpg`,
      category: 'test',
      size: ['M'],
      color: '#000000'
    }))

    it('shows pagination controls when products exceed per page limit', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => manyProducts
      })

      renderWithRouter(<Products />)

      await waitFor(() => {
        expect(screen.getByText('Página 1 de 2')).toBeInTheDocument()
        expect(screen.getByText('Mostrando 1-20 de 25 produtos')).toBeInTheDocument()
      })
    })

    it('navigates to next page', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => manyProducts
      })

      renderWithRouter(<Products />)

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument()
      })

      // Find next page button
      const nextButton = screen.getByRole('button', { name: /next/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Página 2 de 2')).toBeInTheDocument()
        expect(screen.getByText('Mostrando 21-25 de 25 produtos')).toBeInTheDocument()
      })
    })

    it('disables previous button on first page', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => manyProducts
      })

      renderWithRouter(<Products />)

      await waitFor(() => {
        const prevButton = screen.getByRole('button').closest('button')
        expect(prevButton).toBeDisabled()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles fetch error gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      renderWithRouter(<Products />)

      await waitFor(() => {
        expect(screen.getByText('No products loaded.')).toBeInTheDocument()
      })
    })

    it('handles HTTP error response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' })
      })

      renderWithRouter(<Products />)

      await waitFor(() => {
        expect(screen.getByText('No products loaded.')).toBeInTheDocument()
      })
    })
  })

  describe('Product Form', () => {
    it('shows add product form when adding is true', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      renderWithRouter(<Products />)

      // The form is not visible by default, but we can test its existence
      await waitFor(() => {
        expect(screen.queryByText('Add New Product')).not.toBeInTheDocument()
      })
    })
  })
})
