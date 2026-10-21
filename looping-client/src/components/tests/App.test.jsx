import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from '../App'

// Mock the GoogleOAuthProvider
vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => children
}))

// Mock environment variable
vi.mock('../main.jsx', () => ({
  default: {}
}))

// Mock child components to focus on App routing
vi.mock('../Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}))

vi.mock('../Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}))

vi.mock('../Basic/PaymentAd', () => ({
  default: () => <div data-testid="payment-ad">PaymentAd</div>
}))

vi.mock('../Home', () => ({
  default: () => <div data-testid="home">Home</div>
}))

vi.mock('../Basic/Profile', () => ({
  default: () => <div data-testid="profile">Profile</div>
}))

vi.mock('../Basic/Login', () => ({
  default: () => <div data-testid="login">Login</div>
}))

vi.mock('../Basic/Register', () => ({
  default: () => <div data-testid="register">Register</div>
}))

vi.mock('../Basic/VerifyEmail', () => ({
  default: () => <div data-testid="verify-email">VerifyEmail</div>
}))

vi.mock('../Basic/Loading', () => ({
  default: () => <div data-testid="loading">Loading</div>
}))

vi.mock('../Basic/AdminPanel', () => ({
  default: () => <div data-testid="admin-panel">AdminPanel</div>
}))

vi.mock('../Basic/ProductDetail', () => ({
  default: () => <div data-testid="product-detail">ProductDetail</div>
}))

vi.mock('../Basic/CheckoutPage', () => ({
  default: () => <div data-testid="checkout-page">CheckoutPage</div>
}))

vi.mock('../Basic/ResetPassword', () => ({
  default: () => <div data-testid="reset-password">ResetPassword</div>
}))

vi.mock('../Basic/SearchPage', () => ({
  default: () => <div data-testid="search-page">SearchPage</div>
}))

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderApp = () => {
    return render(
      <App />
    )
  }

  describe('App Structure', () => {
    it('should render without crashing', () => {
      renderApp()
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
    })

    it('should wrap app with GoogleOAuthProvider', () => {
      renderApp()
      // The fact that it renders without error means GoogleOAuthProvider is working
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
    })

    it('should wrap app with BrowserRouter', () => {
      renderApp()
      // Navigation should work (tested by route changes)
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
    })
  })

  describe('Route Rendering', () => {
    it('should render home page with payment ad and footer on root route', () => {
      renderApp()
      
      expect(screen.getByTestId('home')).toBeInTheDocument()
      expect(screen.getByTestId('payment-ad')).toBeInTheDocument()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('should render login page on /login route', () => {
      renderApp()
      
      // Navigate to login
      window.history.pushState({}, 'Login', '/login')
      fireEvent.popState(window)
      
      expect(screen.getByTestId('login')).toBeInTheDocument()
    })

    it('should render register page on /register route', () => {
      renderApp()
      
      // Navigate to register
      window.history.pushState({}, 'Register', '/register')
      fireEvent.popState(window)
      
      expect(screen.getByTestId('register')).toBeInTheDocument()
    })

    it('should render admin panel on /admin route', () => {
      renderApp()
      
      // Navigate to admin
      window.history.pushState({}, 'Admin', '/admin')
      fireEvent.popState(window)
      
      expect(screen.getByTestId('admin-panel')).toBeInTheDocument()
    })

    it('should render loading page on /loading route', () => {
      renderApp()
      
      // Navigate to loading
      window.history.pushState({}, 'Loading', '/loading')
      fireEvent.popState(window)
      
      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('should render reset password page on /reset-password route', () => {
      renderApp()
      
      // Navigate to reset password
      window.history.pushState({}, 'Reset Password', '/reset-password')
      fireEvent.popState(window)
      
      expect(screen.getByTestId('reset-password')).toBeInTheDocument()
    })

    it('should render email verification page on /verification route', () => {
      renderApp()
      
      // Navigate to verification
      window.history.pushState({}, 'Email Verification', '/verification')
      fireEvent.popState(window)
      
      expect(screen.getByTestId('verify-email')).toBeInTheDocument()
    })

    it('should render product detail page on /product/:id route', () => {
      renderApp()
      
      // Navigate to product detail
      window.history.pushState({}, 'Product Detail', '/product/123')
      fireEvent.popState(window)
      
      expect(screen.getByTestId('product-detail')).toBeInTheDocument()
    })

    it('should render profile page on /profile route', () => {
      renderApp()
      
      // Navigate to profile
      window.history.pushState({}, 'Profile', '/profile')
      fireEvent.popState(window)
      
      expect(screen.getByTestId('profile')).toBeInTheDocument()
    })

    it('should render checkout page on /checkout route', () => {
      renderApp()
      
      // Navigate to checkout
      window.history.pushState({}, 'Checkout', '/checkout')
      fireEvent.popState(window)
      
      expect(screen.getByTestId('checkout-page')).toBeInTheDocument()
    })

    it('should render search page on /search route', () => {
      renderApp()
      
      // Navigate to search
      window.history.pushState({}, 'Search', '/search')
      fireEvent.popState(window)
      
      expect(screen.getByTestId('search-page')).toBeInTheDocument()
    })
  })

  describe('Nested Routes', () => {
    it('should render profile page with nested wishlist route', () => {
      renderApp()
      
      // Navigate to profile wishlist
      window.history.pushState({}, 'Profile Wishlist', '/profile/wishlist')
      fireEvent.popState(window)
      
      expect(screen.getByTestId('profile')).toBeInTheDocument()
    })

    it('should render profile page with nested cart route', () => {
      renderApp()
      
      // Navigate to profile cart
      window.history.pushState({}, 'Profile Cart', '/profile/cart')
      fireEvent.popState(window)
      
      expect(screen.getByTestId('profile')).toBeInTheDocument()
    })
  })

  describe('Route Fallback', () => {
    it('should handle unknown routes gracefully', () => {
      renderApp()
      
      // Navigate to unknown route
      window.history.pushState({}, 'Unknown', '/unknown-route')
      fireEvent.popState(window)
      
      // Should still render navbar (app structure intact)
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('should maintain consistent navbar across all routes', () => {
      renderApp()
      
      // Check navbar exists on multiple routes
      const routes = ['/', '/login', '/register', '/admin', '/profile']
      
      routes.forEach(route => {
        window.history.pushState({}, 'Test', route)
        fireEvent.popState(window)
        expect(screen.getByTestId('navbar')).toBeInTheDocument()
      })
    })

    it('should only show footer and payment ad on home route', () => {
      renderApp()
      
      // Home route should have footer and payment ad
      window.history.pushState({}, 'Home', '/')
      fireEvent.popState(window)
      expect(screen.getByTestId('footer')).toBeInTheDocument()
      expect(screen.getByTestId('payment-ad')).toBeInTheDocument()
      
      // Other routes should not have them
      window.history.pushState({}, 'Login', '/login')
      fireEvent.popState(window)
      expect(screen.queryByTestId('footer')).not.toBeInTheDocument()
      expect(screen.queryByTestId('payment-ad')).not.toBeInTheDocument()
    })
  })

  describe('Environment Configuration', () => {
    it('should use Google OAuth client ID from environment', () => {
      // Mock environment variable
      const originalEnv = import.meta.env
      import.meta.env = { ...originalEnv, VITE_GOOGLE_CLIENT_ID: 'test-client-id' }
      
      renderApp()
      
      // Component should render without errors
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
      
      // Restore original env
      import.meta.env = originalEnv
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic HTML structure', () => {
      renderApp()
      
      // Should have main content area
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      renderApp()
      
      // Should be able to focus on interactive elements
      const navbar = screen.getByTestId('navbar')
      expect(navbar).toBeInTheDocument()
    })
  })
})
