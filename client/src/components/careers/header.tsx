import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useScrollDirection } from "@/hooks/useScrollDirection";

import aapkaAutoExpertLogo from "@assets/logo102.png";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { direction, atTop, y } = useScrollDirection();

  // Header is only visible when actually at the top of the page
  const isHidden = !atTop;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out overflow-visible ${
        isHidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
      style={{ willChange: 'transform' }}
      data-testid="header-shell"
    >
      {/* Thin Header Bar */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-red-500 relative overflow-visible" style={{ borderBottomWidth: '1px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18 md:h-20 lg:h-22 xl:h-24">
            {/* Logo Container - inside header */}
            <div className={`flex items-center transition-opacity duration-300 ${isMenuOpen ? 'md:opacity-100 opacity-0' : 'opacity-100'}`} data-testid="logo-container">
              <img 
                src={aapkaAutoExpertLogo} 
                alt="Aapka Auto Expert" 
                className="h-16 w-auto max-w-[160px] sm:h-18 sm:max-w-[180px] md:h-20 md:max-w-[200px] lg:h-22 lg:max-w-[220px] xl:h-24 xl:max-w-[240px] object-contain" 
                data-testid="company-logo"
              />
            </div>
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection('home')}
              className="text-gray-600 hover:text-red-600 transition-colors"
              data-testid="nav-home"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-600 hover:text-red-600 transition-colors"
              data-testid="nav-about"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('jobs')}
              className="text-red-600 font-medium"
              data-testid="nav-careers"
            >
              Careers
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-600 hover:text-red-600 transition-colors"
              data-testid="nav-contact"
            >
              Contact
            </button>
          </nav>
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {isMenuOpen ? (
              <X className="text-xl text-gray-700" />
            ) : (
              <Menu className="text-xl text-gray-700" />
            )}
          </button>
        </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 px-4 sm:px-6 lg:px-8 bg-white/98 backdrop-blur-sm border-t border-red-200 shadow-lg">
            <nav className="flex flex-col space-y-4 pt-4">
              <button
                onClick={() => scrollToSection('home')}
                className="text-gray-600 hover:text-red-600 transition-colors text-left py-2"
                data-testid="mobile-nav-home"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-gray-600 hover:text-red-600 transition-colors text-left py-2"
                data-testid="mobile-nav-about"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('jobs')}
                className="text-red-600 font-medium text-left py-2"
                data-testid="mobile-nav-careers"
              >
                Careers
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-gray-600 hover:text-red-600 transition-colors text-left py-2"
                data-testid="mobile-nav-contact"
              >
                Contact
              </button>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
