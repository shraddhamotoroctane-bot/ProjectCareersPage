import { Mail, MapPin } from "lucide-react";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function ContactSection() {

  return (
    <section id="contact" className="py-12 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" data-testid="contact-title">
            Get In Touch
          </h2>
          <p className="text-muted-foreground" data-testid="contact-subtitle">
            Ready to join our team? Let's connect.
          </p>
        </div>

        {/* Desktop: Single line, Mobile: Stacked from left */}
        <div className="flex flex-col md:flex-row items-start md:items-center md:justify-center gap-4 md:gap-12">
          <div className="flex items-center space-x-3" data-testid="contact-email">
            <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center">
              <Mail className="text-white w-4 h-4" />
            </div>
            <div>
              <div className="font-medium text-foreground text-sm">Email</div>
              <div className="text-muted-foreground">hrteam@motoroctane.com</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3" data-testid="contact-address">
            <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center">
              <MapPin className="text-white w-4 h-4" />
            </div>
            <div>
              <div className="font-medium text-foreground text-sm">Office</div>
              <div className="text-muted-foreground">Vashi, Navi Mumbai</div>
            </div>
          </div>
        </div>
        
        {/* Social Media Links */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-6" data-testid="social-title">
            Follow Us
          </h3>
          <div className="flex flex-col gap-4">
            {/* First row: YouTube, Instagram, LinkedIn, X */}
            <div className="flex justify-center space-x-6">
              <a 
                href="https://www.youtube.com/@motoroctane" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors duration-200"
                data-testid="social-youtube"
              >
                <FaYoutube className="text-white w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/motoroctane" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors duration-200"
                data-testid="social-instagram"
              >
                <FaInstagram className="text-white w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com/company/motoroctane" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors duration-200"
                data-testid="social-linkedin"
              >
                <FaLinkedinIn className="text-white w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com/motoroctane" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors duration-200"
                data-testid="social-twitter"
              >
                <FaXTwitter className="text-white w-5 h-5" />
              </a>
            </div>
            
            {/* Second row: Threads, Facebook */}
            <div className="flex justify-center space-x-6">
              <a 
                href="https://www.threads.com/@motoroctane" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors duration-200"
                data-testid="social-threads"
              >
                <span className="text-white font-bold text-sm">@</span>
              </a>
              <a 
                href="https://facebook.com/motoroctane" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors duration-200"
                data-testid="social-facebook"
              >
                <FaFacebookF className="text-white w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
