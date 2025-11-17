export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="footer-company-name">
              MotorOctane
            </h3>
            <p className="text-muted-foreground mb-4" data-testid="footer-company-tagline">
              India's premier car YouTube channel, social media platform, and automotive consultancy.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="footer-social-linkedin"
              >
                <span className="text-sm">LinkedIn</span>
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="footer-social-twitter"
              >
                <span className="text-sm">Twitter</span>
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="footer-social-github"
              >
                <span className="text-sm">GitHub</span>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-about">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-careers">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-news">News</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-blog">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-help">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-contact">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-faq">FAQ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-docs">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-privacy">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-terms">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-cookies">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-compliance">Compliance</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p data-testid="footer-copyright">&copy; 2024 MotorOctane. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
