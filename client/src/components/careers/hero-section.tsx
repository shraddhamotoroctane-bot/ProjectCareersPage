import teamPhoto from '@assets/Hero Image 102.webp';

export default function HeroSection() {
  // Helper function to move text up for mobile and desktop
  const getTextPosition = (moveUp = false) => {
    if (!moveUp) return "";
    return "md:-translate-y-48 lg:-translate-y-56 xl:-translate-y-64";
  };

  // Helper function to move buttons up for desktop only  
  const getButtonPosition = (moveUp = false) => {
    if (!moveUp) return "mt-8 sm:mt-12";
    return "mt-8 sm:mt-12 md:-mt-4 lg:-mt-6 xl:-mt-8";
  };
  const scrollToJobs = () => {
    const element = document.getElementById('jobs');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToAbout = () => {
    const element = document.getElementById('culture');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative text-primary-foreground overflow-hidden mt-18 md:mt-20 lg:mt-22 xl:mt-24">
      {/* FIXED BACKGROUND IMAGE LAYER - Never changes */}
      <div className="absolute inset-0 w-full h-[450px] lg:h-[700px] xl:h-[800px]">
        {/* Desktop background image */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            backgroundImage: teamPhoto ? `url(${teamPhoto})` : 'none',
            backgroundSize: '105%',
            backgroundPosition: '80% 40%',
            backgroundRepeat: 'no-repeat',
            width: '100%',
            height: '100%'
          }}
        ></div>

        {/* Mobile background image */}
        <div
          className="absolute inset-0 md:hidden"
          style={{
            backgroundImage: teamPhoto ? `url(${teamPhoto})` : 'none',
            backgroundSize: '110%',
            backgroundPosition: '70% 40%',
            backgroundRepeat: 'no-repeat',
            width: '100%',
            height: '100%'
          }}
        ></div>

        {/* Fixed gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(139, 34, 34, 0.7) 0%, rgba(139, 34, 34, 0.65) 70%, rgba(139, 34, 34, 0.6) 100%)"
          }}
        ></div>
      </div>

      {/* SEPARATE TEXT CONTENT LAYER - Can be moved independently */}
      <div className="relative z-10 w-full h-[450px] lg:h-[700px] xl:h-[800px] flex flex-col justify-center items-center text-center px-6 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Title - Independently positioned */}
          <div className={`mb-6 sm:mb-8 ${getTextPosition(true)}`}>
            <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold text-white leading-tight" data-testid="hero-title">
              Join India's Leading Automotive Community
            </h1>
          </div>

          {/* Hidden subtitle */}
          <p className="text-base sm:text-lg md:text-2xl mb-8 sm:mb-10 text-white max-w-2xl sm:max-w-3xl mx-auto leading-relaxed font-medium px-2 hidden" data-testid="hero-subtitle">
            At MotorOctane, we're India's premier automotive consultancy and car expertise platform. Join our team of automotive specialists, content creators, and industry experts who are passionate about the Indian automotive scene.
          </p>

          {/* Buttons - Independently positioned */}
          <div className={`flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4 ${getButtonPosition(true)}`}>
            <button
              onClick={scrollToJobs}
              className="bg-white text-gray-900 px-6 sm:px-10 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
              data-testid="button-view-positions"
            >
              View Open Positions
            </button>
            <button
              onClick={scrollToAbout}
              className="border-2 border-white text-white px-6 sm:px-10 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:bg-white hover:text-gray-900 transform hover:scale-105 transition-all duration-200 shadow-lg"
              data-testid="button-learn-culture"
            >
              Learn About Our Culture
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
