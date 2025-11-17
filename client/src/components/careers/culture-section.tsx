import { Heart, GraduationCap, Rocket } from "lucide-react";
import seoAnalystImg from '@assets/Seo Analyst.jpg';
import socialMediaCreatorImg from '@assets/Social Media.jpg';
import internsImg from '@assets/Interns.jpg';
import videographerImg from '@assets/Videographer.jpg';
import anchorsImg from '@assets/Anchors.jpg';
import contentWritersImg from '@assets/content writers.jpg';

export default function CultureSection() {
  return (
    <section id="culture" className="py-12 sm:py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4" data-testid="culture-title">
            <span className="text-primary">Life At MotorOctane</span>
          </h2>
          <p className="text-xl text-gray-800 dark:text-gray-200 font-semibold max-w-2xl mx-auto" data-testid="culture-subtitle">
            Where passion meets performance. Join India's most dynamic automotive content team!
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="relative">
            {/* Team member collage */}
            <div 
              className="rounded-xl w-full h-56 sm:h-72 md:h-80 lg:h-96 overflow-hidden shadow-lg"
              data-testid="culture-team-collage"
            >
              <div className="grid grid-cols-3 grid-rows-2 gap-0.5 sm:gap-1 h-full">
                {/* SEO Analyst */}
                <div className="relative">
                  <img 
                    src={seoAnalystImg}
                    alt="SEO Analyst working on optimization"
                    className="w-full h-full object-contain rounded-sm bg-gray-100"
                  />
                  <div className="absolute inset-0 bg-blue-900/10 rounded-sm"></div>
                </div>
                
                {/* Social Media Creator */}
                <div className="relative">
                  <img 
                    src={socialMediaCreatorImg}
                    alt="Social Media Content Creator"
                    className="w-full h-full object-contain rounded-sm bg-gray-100"
                  />
                  <div className="absolute inset-0 bg-blue-900/10 rounded-sm"></div>
                </div>
                
                {/* Interns */}
                <div className="relative">
                  <img 
                    src={internsImg}
                    alt="Interns learning and working"
                    className="w-full h-full object-contain rounded-sm bg-gray-100"
                  />
                  <div className="absolute inset-0 bg-blue-900/10 rounded-sm"></div>
                </div>
                
                {/* Videographer */}
                <div className="relative">
                  <img 
                    src={videographerImg}
                    alt="Professional videographer filming"
                    className="w-full h-full object-contain rounded-sm bg-gray-100"
                  />
                  <div className="absolute inset-0 bg-blue-900/10 rounded-sm"></div>
                </div>
                
                {/* Anchors */}
                <div className="relative">
                  <img 
                    src={anchorsImg}
                    alt="Anchors presenting content"
                    className="w-full h-full object-contain rounded-sm bg-gray-100"
                  />
                  <div className="absolute inset-0 bg-blue-900/10 rounded-sm"></div>
                </div>
                
                {/* Content Writers */}
                <div className="relative">
                  <img 
                    src={contentWritersImg}
                    alt="Content writers creating articles"
                    className="w-full h-full object-contain rounded-sm bg-gray-100"
                  />
                  <div className="absolute inset-0 bg-blue-900/10 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-start space-x-4" data-testid="culture-benefit-balance">
              <div className="bg-primary w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Work-Life Balance</h3>
                <p className="text-gray-700 dark:text-gray-200 font-medium leading-relaxed">Rev up your career without burning out. Flexible hours and time for what matters most.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4" data-testid="culture-benefit-growth">
              <div className="bg-primary w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Professional Growth</h3>
                <p className="text-gray-700 dark:text-gray-200 font-medium leading-relaxed">Shift into higher gear! Learning budgets, mentorship, and clear promotion paths to accelerate your career.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4" data-testid="culture-benefit-innovation">
              <div className="bg-primary w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                <Rocket className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Innovation Culture</h3>
                <p className="text-gray-700 dark:text-gray-200 font-medium leading-relaxed">Drive innovation, not just cars! Bold ideas welcome, creative risks rewarded, breakthrough thinking celebrated.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700" data-testid="stat-satisfaction">
            <div className="text-4xl font-bold text-primary mb-2">95%</div>
            <p className="text-gray-800 dark:text-gray-200 font-bold text-lg">Team Satisfaction</p>
            <p className="text-gray-600 dark:text-gray-300 mt-1 font-medium">Love what they do</p>
          </div>
          <div 
            className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all duration-200 transform hover:scale-105" 
            data-testid="stat-rating"
            onClick={() => window.open('https://www.glassdoor.co.in/Overview/Working-at-MotorOctane-EI_IE5702812.11,22.htm', '_blank')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.open('https://www.glassdoor.co.in/Overview/Working-at-MotorOctane-EI_IE5702812.11,22.htm', '_blank');
              }
            }}
          >
            <div className="text-4xl font-bold text-primary mb-2">4.5/5</div>
            <p className="text-gray-800 dark:text-gray-200 font-bold text-lg">Glassdoor Rating</p>
            <p className="text-gray-600 dark:text-gray-300 mt-1 font-medium">Top workplace culture</p>
            <p className="text-xs text-primary/70 mt-2 font-medium">Click to view reviews →</p>
          </div>
          <div 
            className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all duration-200 transform hover:scale-105" 
            data-testid="stat-ambitionbox"
            onClick={() => window.open('https://www.ambitionbox.com/reviews/rmh-motoroctane-reviews', '_blank')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.open('https://www.ambitionbox.com/reviews/rmh-motoroctane-reviews', '_blank');
              }
            }}
          >
            <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
            <p className="text-gray-800 dark:text-gray-200 font-bold text-lg">AmbitionBox Rating</p>
            <p className="text-gray-600 dark:text-gray-300 mt-1 font-medium">Above industry's average</p>
            <p className="text-xs text-primary/70 mt-2 font-medium">Click to view reviews →</p>
          </div>
        </div>
      </div>
    </section>
  );
}
