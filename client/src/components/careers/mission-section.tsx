import { Users, Heart, Zap, Trophy } from "lucide-react";

export default function MissionSection() {
  return (
    <section id="about" className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8" data-testid="mission-title">
            Join the Ride
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto mb-12" data-testid="mission-description">
            At MotorOctane, we fuel India's automotive passion by bringing together specialists and creators who drive innovation and insight. Join our fast-paced team and help steer the future of the Indian car scene with fresh ideas and expert knowledge.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center" data-testid="value-innovation">
              <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-2xl text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Passionate Work</h3>
              <p className="text-muted-foreground">Work on projects you truly care about in India's most exciting automotive community</p>
            </div>
            <div className="text-center" data-testid="value-collaboration">
              <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-2xl text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Collaborative Team</h3>
              <p className="text-muted-foreground">Work alongside talented creators, marketers, and automotive experts who support each other's growth</p>
            </div>
            <div className="text-center" data-testid="value-excellence">
              <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-2xl text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Career Growth</h3>
              <p className="text-muted-foreground">Build your expertise with mentorship, training, and opportunities to lead impactful projects</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
