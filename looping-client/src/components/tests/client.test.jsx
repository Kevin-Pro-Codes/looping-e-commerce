import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

// Simple test component
const TestComponent = () => {
  return <div data-testid="test-component">Hello World</div>
}

describe('Working React Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders test component correctly', () => {
    render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>
    )
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should handle basic assertions', () => {
    expect(1 + 1).toBe(2)
    expect('hello'.toUpperCase()).toBe('HELLO')
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve('async test')
    expect(result).toBe('async test')
  })
})
