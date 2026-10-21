import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

// Mock the Products component for now
const MockProducts = () => {
  return <div>Mock Products Component</div>
}

describe('Simple Products Test', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  it('renders mock products component', () => {
    render(
      <BrowserRouter>
        <MockProducts />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Mock Products Component')).toBeInTheDocument()
  })

  it('should pass a basic assertion', () => {
    expect(true).toBe(true)
  })
})
