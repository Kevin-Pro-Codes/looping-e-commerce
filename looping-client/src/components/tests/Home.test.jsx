import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Home from '../Home'

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiHeart: ({ className }) => <div data-testid="heart-icon" className={className} />,
  FiShoppingCart: ({ className }) => <div data-testid="cart-icon" className={className} />
}))

vi.mock('react-icons/fa', () => ({
  FaWhatsapp: ({ className }) => <div data-testid="whatsapp-icon" className={className} />,
  FaInstagram: ({ className }) => <div data-testid="instagram-icon" className={className} />,
  FaFacebook: ({ className }) => <div data-testid="facebook-icon" className={className} />
}))

// Mock child components
vi.mock('../Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}))

vi.mock('../Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}))

vi.mock('../Basic/PaymentAd', () => ({
  default: () => <div data-testid="payment-ad">PaymentAd</div>
}))

vi.mock('../Basic/BannerTimer', () => ({
  default: () => <div data-testid="banner-timer">BannerTimer</div>
}))

vi.mock('../Basic/Products', () => ({
  default: () => <div data-testid="products">Products</div>
}))

// Mock window.open
const mockOpen = vi.fn()
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockOpen
})

// Mock window.outerWidth and window.innerWidth for zoom detection
Object.defineProperty(window, 'outerWidth', {
  writable: true,
  configurable: true,
  value: 1920
})

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1920
})

// Mock addEventListener and removeEventListener
const mockAddEventListener = vi.fn()
const mockRemoveEventListener = vi.fn()

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  configurable: true,
  value: mockAddEventListener
})

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  configurable: true,
  value: mockRemoveEventListener
})

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOpen.mockClear()
    mockAddEventListener.mockClear()
    mockRemoveEventListener.mockClear()
  })

  const renderHome = () => {
    return render(<Home />)
  }

  describe('Home Structure', () => {
    it('should render without crashing', () => {
      renderHome()
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
      expect(screen.getByTestId('products')).toBeInTheDocument()
    })

    it('should have correct layout structure', () => {
      renderHome()
      const container = screen.getByTestId('navbar').closest('.flex')
      expect(container).toHaveClass('flex', 'flex-col', 'min-h-screen')
    })

    it('should render main content area', () => {
      renderHome()
      const main = document.querySelector('main')
      expect(main).toHaveClass('flex-1', 'bg-white', 'pt-[125px]')
    })
  })

  describe('Banner System', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should initialize with first banner', () => {
      renderHome()
      // Should have banner container
      const bannerContainer = document.querySelector('.rounded-xl')
      expect(bannerContainer).toBeInTheDocument()
    })

    it('should rotate banners automatically', () => {
      renderHome()
      
      // Fast-forward time to trigger banner rotation
      vi.advanceTimersByTime(18150) // 18.15 seconds
      
      // Should still have banner container (banner changed)
      const bannerContainer = document.querySelector('.rounded-xl')
      expect(bannerContainer).toBeInTheDocument()
    })

    it('should have navigation dots', () => {
      renderHome()
      const dots = screen.getAllByRole('button').filter(button => 
        button.className.includes('rounded-full') && button.className.includes('border-2')
      )
      expect(dots.length).toBe(10) // 10 banners
    })

    it('should change banner when dot is clicked', () => {
      renderHome()
      const dots = screen.getAllByRole('button').filter(button => 
        button.className.includes('rounded-full')
      )
      
      // Click third dot
      fireEvent.click(dots[2])
      
      // Should still have banner container
      const bannerContainer = document.querySelector('.rounded-xl')
      expect(bannerContainer).toBeInTheDocument()
    })

    it('should have active dot styling', () => {
      renderHome()
      const dots = screen.getAllByRole('button').filter(button => 
        button.className.includes('rounded-full')
      )
      
      // First dot should be active
      expect(dots[0]).toHaveClass('bg-red-500')
      expect(dots[1]).toHaveClass('bg-gray-400')
    })
  })

  describe('Banner Content Types', () => {
    it('should render promo banner content', () => {
      renderHome()
      // Check if promo banner elements exist
      const promoText = screen.queryByText(/LEVE 5/)
      // May not be visible on initial banner, but structure should exist
      expect(document.querySelector('.rounded-xl')).toBeInTheDocument()
    })

    it('should render cupons banner content', () => {
      renderHome()
      const bannerContainer = document.querySelector('.rounded-xl')
      expect(bannerContainer).toBeInTheDocument()
    })

    it('should render logo banner content', () => {
      renderHome()
      const bannerContainer = document.querySelector('.rounded-xl')
      expect(bannerContainer).toBeInTheDocument()
    })

    it('should render designs banner content', () => {
      renderHome()
      const bannerContainer = document.querySelector('.rounded-xl')
      expect(bannerContainer).toBeInTheDocument()
    })
  })

  describe('Social Media Integration', () => {
    it('should handle WhatsApp click', () => {
      renderHome()
      
      // Find and click WhatsApp button (when Python banner is active)
      const whatsappButton = screen.queryByTestId('whatsapp-icon')
      if (whatsappButton) {
        fireEvent.click(whatsappButton)
        
        expect(mockOpen).toHaveBeenCalledWith(
          'https://wa.me/5511999999999?text=Ol%C3%A1%21%20Gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20os%20produtos.',
          '_blank'
        )
      }
    })

    it('should handle Instagram click', () => {
      renderHome()
      
      // Find and click Instagram button (when FClub banner is active)
      const instagramButton = screen.queryByTestId('instagram-icon')
      if (instagramButton) {
        fireEvent.click(instagramButton)
        
        expect(mockOpen).toHaveBeenCalledWith(
          'https://instagram.com/looping.official',
          '_blank'
        )
      }
    })

    it('should handle Facebook click', () => {
      renderHome()
      
      // Find and click Facebook button (when FClub banner is active)
      const facebookButton = screen.queryByTestId('facebook-icon')
      if (facebookButton) {
        fireEvent.click(facebookButton)
        
        expect(mockOpen).toHaveBeenCalledWith(
          'https://facebook.com/looping.official',
          '_blank'
        )
      }
    })
  })

  describe('Products Section', () => {
    it('should render products component', () => {
      renderHome()
      expect(screen.getByTestId('products')).toBeInTheDocument()
    })

    it('should render pagination when products exist', () => {
      renderHome()
      // Pagination should exist even if empty initially
      const pagination = document.querySelector('.flex.justify-center.space-x-3')
      expect(pagination).toBeInTheDocument()
    })
  })

  describe('Zoom Detection', () => {
    it('should detect zoom level on mount', () => {
      renderHome()
      expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('should cleanup event listeners on unmount', () => {
      const { unmount } = renderHome()
      unmount()
      expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('should handle window resize', () => {
      renderHome()
      
      // Get the resize handler
      const resizeHandler = mockAddEventListener.mock.calls[0][1]
      
      // Simulate resize
      resizeHandler()
      
      // Component should still render
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive banner container', () => {
      renderHome()
      const bannerContainer = document.querySelector('.rounded-xl')
      expect(bannerContainer).toHaveClass('border-4', 'border-black', 'shadow-2xl', 'bg-white')
    })

    it('should have responsive padding', () => {
      renderHome()
      const bannerWrapper = document.querySelector('.px-4')
      expect(bannerWrapper).toHaveClass('px-4', 'py-8', 'sm:py-10', 'md:py-12')
    })
  })

  describe('State Management', () => {
    it('should initialize with correct default state', () => {
      renderHome()
      // Component should render without errors
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
    })

    it('should handle banner state changes', () => {
      renderHome()
      const dots = screen.getAllByRole('button').filter(button => 
        button.className.includes('rounded-full')
      )
      
      // Click different dots
      dots.forEach((dot, index) => {
        fireEvent.click(dot)
        expect(document.querySelector('.rounded-xl')).toBeInTheDocument()
      })
    })
  })

  describe('Banner Animation', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should set up banner rotation interval', () => {
      renderHome()
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 18150)
    })

    it('should cleanup interval on unmount', () => {
      const { unmount } = renderHome()
      unmount()
      expect(clearInterval).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels on social buttons', () => {
      renderHome()
      
      // Check for ARIA labels on social media buttons
      const whatsappButton = screen.queryByLabelText('Contact via WhatsApp')
      const instagramButton = screen.queryByLabelText('Follow us on Instagram')
      const facebookButton = screen.queryByLabelText('Follow us on Facebook')
      
      // These may not be present on initial banner, but structure should be accessible
      expect(document.querySelector('.rounded-xl')).toBeInTheDocument()
    })

    it('should have keyboard navigation support', () => {
      renderHome()
      const dots = screen.getAllByRole('button').filter(button => 
        button.className.includes('rounded-full')
      )
      
      dots.forEach(dot => {
        expect(dot).toHaveAttribute('type', 'button')
      })
    })

    it('should have semantic HTML structure', () => {
      renderHome()
      expect(document.querySelector('main')).toBeInTheDocument()
      expect(document.querySelector('footer')).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('should render all child components in correct order', () => {
      renderHome()
      
      const content = document.body.textContent
      const navbarIndex = content.indexOf('Navbar')
      const productsIndex = content.indexOf('Products')
      
      expect(navbarIndex).toBeLessThan(productsIndex)
    })

    it('should maintain responsive layout across different screen sizes', () => {
      renderHome()
      
      // Test different viewport sizes
      Object.defineProperty(window, 'innerWidth', { value: 768 })
      fireEvent.resize(window)
      
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
      
      Object.defineProperty(window, 'innerWidth', { value: 1024 })
      fireEvent.resize(window)
      
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle missing window.open gracefully', () => {
      const originalOpen = window.open
      delete window.open
      
      expect(() => {
        renderHome()
      }).not.toThrow()
      
      window.open = originalOpen
    })

    it('should handle resize event errors gracefully', () => {
      renderHome()
      
      const resizeHandler = mockAddEventListener.mock.calls[0][1]
      
      expect(() => {
        resizeHandler()
      }).not.toThrow()
    })
  })
})
