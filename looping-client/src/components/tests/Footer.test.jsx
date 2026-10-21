import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Footer from '../Footer'

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiFacebook: ({ className, size }) => <div data-testid="facebook-icon" className={className} style={{ fontSize: size }} />,
  FiInstagram: ({ className, size }) => <div data-testid="instagram-icon" className={className} style={{ fontSize: size }} />,
  FiTwitter: ({ className, size }) => <div data-testid="twitter-icon" className={className} style={{ fontSize: size }} />,
  FiMail: ({ className }) => <div data-testid="mail-icon" className={className} />,
  FiPhone: ({ className }) => <div data-testid="phone-icon" className={className} />
}))

describe('Footer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderFooter = () => {
    return render(<Footer />)
  }

  describe('Footer Structure', () => {
    it('should render without crashing', () => {
      renderFooter()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('should have correct footer styling', () => {
      renderFooter()
      const footer = screen.getByRole('contentinfo')
      expect(footer).toHaveClass('bg-black', 'text-white', 'w-full', 'mt-12')
    })

    it('should use correct font family', () => {
      renderFooter()
      const footer = screen.getByRole('contentinfo')
      expect(footer).toHaveStyle({ fontFamily: 'Calibri, sans-serif' })
    })
  })

  describe('About Section', () => {
    it('should render "Sobre" section', () => {
      renderFooter()
      expect(screen.getByText('Sobre')).toBeInTheDocument()
    })

    it('should render company description', () => {
      renderFooter()
      expect(screen.getByText(/A Looping Store é uma loja online/)).toBeInTheDocument()
      expect(screen.getByText(/produtos exclusivos e colecionáveis/)).toBeInTheDocument()
      expect(screen.getByText(/melhor experiência de compra/)).toBeInTheDocument()
    })
  })

  describe('Quick Links Section', () => {
    it('should render "Links" section', () => {
      renderFooter()
      expect(screen.getByText('Links')).toBeInTheDocument()
    })

    it('should render all quick links', () => {
      renderFooter()
      expect(screen.getByText('Início')).toBeInTheDocument()
      expect(screen.getByText('Categorias')).toBeInTheDocument()
      expect(screen.getByText('Ofertas')).toBeInTheDocument()
      expect(screen.getByText('Blog')).toBeInTheDocument()
      expect(screen.getByText('FAQ')).toBeInTheDocument()
    })

    it('should have hover effect classes on links', () => {
      renderFooter()
      const links = screen.getAllByText(/Início|Categorias|Ofertas|Blog|FAQ/)
      links.forEach(link => {
        expect(link).toHaveClass('hover:text-yellow-400', 'cursor-pointer', 'transition-colors')
      })
    })
  })

  describe('Contact Section', () => {
    it('should render "Contato" section', () => {
      renderFooter()
      expect(screen.getByText('Contato')).toBeInTheDocument()
    })

    it('should render email contact', () => {
      renderFooter()
      expect(screen.getByText('contato@looping.com')).toBeInTheDocument()
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
    })

    it('should render phone contact', () => {
      renderFooter()
      expect(screen.getByText('+55 11 99999-9999')).toBeInTheDocument()
      expect(screen.getByTestId('phone-icon')).toBeInTheDocument()
    })

    it('should render business hours', () => {
      renderFooter()
      expect(screen.getByText('Atendimento: Seg - Sex, 9h - 18h')).toBeInTheDocument()
    })

    it('should have correct styling for contact items', () => {
      renderFooter()
      const emailItem = screen.getByText('contato@looping.com').closest('li')
      expect(emailItem).toHaveClass('flex', 'items-center', 'gap-2', 'text-white')
      
      const phoneItem = screen.getByText('+55 11 99999-9999').closest('li')
      expect(phoneItem).toHaveClass('flex', 'items-center', 'gap-2', 'text-white')
    })
  })

  describe('Social Media Section', () => {
    it('should render "Redes Sociais" section', () => {
      renderFooter()
      expect(screen.getByText('Redes Sociais')).toBeInTheDocument()
    })

    it('should render all social media icons', () => {
      renderFooter()
      expect(screen.getByTestId('facebook-icon')).toBeInTheDocument()
      expect(screen.getByTestId('instagram-icon')).toBeInTheDocument()
      expect(screen.getByTestId('twitter-icon')).toBeInTheDocument()
    })

    it('should render social media description', () => {
      renderFooter()
      expect(screen.getByText(/Siga-nos para novidades/)).toBeInTheDocument()
      expect(screen.getByText(/promoções e lançamentos exclusivos!/)).toBeInTheDocument()
    })

    it('should have hover effects on social icons', () => {
      renderFooter()
      const socialIcons = screen.getAllByRole('link')
      socialIcons.forEach(icon => {
        expect(icon).toHaveClass('hover:text-yellow-400', 'transition-colors', 'text-white')
      })
    })

    it('should have correct icon sizes', () => {
      renderFooter()
      const facebookIcon = screen.getByTestId('facebook-icon')
      expect(facebookIcon).toHaveStyle({ fontSize: '24px' })
      
      const instagramIcon = screen.getByTestId('instagram-icon')
      expect(instagramIcon).toHaveStyle({ fontSize: '24px' })
      
      const twitterIcon = screen.getByTestId('twitter-icon')
      expect(twitterIcon).toHaveStyle({ fontSize: '24px' })
    })
  })

  describe('Copyright Section', () => {
    it('should render copyright text', () => {
      renderFooter()
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(`${currentYear} Looping Store. Todos os direitos reservados.`)).toBeInTheDocument()
    })

    it('should have correct copyright styling', () => {
      renderFooter()
      const copyrightText = screen.getByText(/Looping Store/)
      expect(copyrightText).toHaveClass('text-white', 'text-center', 'py-4', 'text-xl')
    })

    it('should have border top separator', () => {
      renderFooter()
      const borderDiv = screen.getByText(/Looping Store/).closest('div')
      expect(borderDiv.parentElement).toHaveClass('border-t', 'border-gray-700', 'mt-6')
    })
  })

  describe('Responsive Design', () => {
    it('should use responsive grid layout', () => {
      renderFooter()
      const gridContainer = screen.getByRole('contentinfo').querySelector('.grid')
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-4')
    })

    it('should have responsive padding', () => {
      renderFooter()
      const footer = screen.getByRole('contentinfo')
      const contentDiv = footer.querySelector('.px-6')
      expect(contentDiv).toHaveClass('px-6', 'md:px-16')
    })
  })

  describe('Text Sizing and Typography', () => {
    it('should use consistent text sizes for headings', () => {
      renderFooter()
      const headings = screen.getAllByText(/Sobre|Links|Contato|Redes Sociais/)
      headings.forEach(heading => {
        expect(heading).toHaveClass('text-3xl', 'font-bold', 'mb-4')
      })
    })

    it('should use appropriate text sizes for content', () => {
      renderFooter()
      const aboutText = screen.getByText(/A Looping Store/)
      expect(aboutText).toHaveClass('text-2xl', 'leading-relaxed')
      
      const contactItems = screen.getAllByText(/contato@looping\.com|\+55 11 99999-9999/)
      contactItems.forEach(item => {
        expect(item).toHaveClass('text-2xl')
      })
    })
  })

  describe('Layout Structure', () => {
    it('should have proper section spacing', () => {
      renderFooter()
      const gridContainer = screen.getByRole('contentinfo').querySelector('.grid')
      expect(gridContainer).toHaveClass('gap-12')
    })

    it('should have proper vertical spacing', () => {
      renderFooter()
      const contentDiv = screen.getByRole('contentinfo').querySelector('.py-12')
      expect(contentDiv).toHaveClass('py-12')
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic HTML5 footer element', () => {
      renderFooter()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('should have accessible link elements', () => {
      renderFooter()
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
    })

    it('should have proper color contrast (white text on black background)', () => {
      renderFooter()
      const footer = screen.getByRole('contentinfo')
      expect(footer).toHaveClass('bg-black', 'text-white')
    })
  })

  describe('Component Integration', () => {
    it('should render all sections in correct order', () => {
      renderFooter()
      const footer = screen.getByRole('contentinfo')
      const content = footer.textContent
      
      // Check order: Sobre, Links, Contato, Redes Sociais
      const sobreIndex = content.indexOf('Sobre')
      const linksIndex = content.indexOf('Links')
      const contatoIndex = content.indexOf('Contato')
      const redesIndex = content.indexOf('Redes Sociais')
      
      expect(sobreIndex).toBeLessThan(linksIndex)
      expect(linksIndex).toBeLessThan(contatoIndex)
      expect(contatoIndex).toBeLessThan(redesIndex)
    })
  })

  describe('Dynamic Content', () => {
    it('should display current year dynamically', () => {
      // Mock current year
      const mockDate = new Date('2025-01-01')
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate)
      
      renderFooter()
      expect(screen.getByText('2025 Looping Store. Todos os direitos reservados.')).toBeInTheDocument()
      
      // Restore original Date
      vi.restoreAllMocks()
    })
  })
})
