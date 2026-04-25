import React, { useEffect } from "react";
import LandingNavbar from "./LandingNavbar";
import HeroSection from "./HeroSection";
import ProblemSection from "./ProblemSection";
import SolutionSection from "./SolutionSection";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import DashboardPreviewSection from "./DashboardPreviewSection";
import FinalCTASection from "./FinalCTASection";
import Footer from "./Footer";

const LandingPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
      <LandingNavbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DashboardPreviewSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
