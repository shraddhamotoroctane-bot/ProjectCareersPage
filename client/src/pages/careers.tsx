import Header from "@/components/careers/header";
import HeroSection from "@/components/careers/hero-section";
import MissionSection from "@/components/careers/mission-section";
import JobOpeningsSection from "@/components/careers/job-openings-section";
import CultureSection from "@/components/careers/culture-section";
import ContactSection from "@/components/careers/contact-section";
import Footer from "@/components/careers/footer";

export default function Careers() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      <HeroSection />
      <MissionSection />
      <JobOpeningsSection />
      <CultureSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
