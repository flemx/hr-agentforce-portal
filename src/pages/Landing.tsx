'use client';

import HeroSection from "@/components/landing/HeroSection";
import WorkshopStats from "@/components/landing/WorkshopStats";
import BusinessUseCaseCard from "@/components/landing/BusinessUseCaseCard";
import CustomerReferences from "@/components/landing/CustomerReferences";
import PresentationSection from "@/components/landing/PresentationSection";
import ReferenceMaterial from "@/components/landing/ReferenceMaterial";
import { businessUseCases } from "@/data/businessUseCases";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Logo Header */}
      <header className="py-6 border-b border-border bg-card">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <div className="flex items-center justify-center gap-6 flex-1">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/512px-Salesforce.com_logo.svg.png?20210504050649"
                alt="Salesforce Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="text-2xl text-muted-foreground font-light">+</span>
              <img
                src="uploads/nto-primary-logo-01.png"
                alt="Prosus Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <HeroSection />
      <WorkshopStats />

      {/* Business Use Cases Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Business Use Cases
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              These use cases were collaboratively developed by NTO HR teams
              and Salesforce consultants during our workshop, addressing real
              challenges in HR operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {businessUseCases.map((useCase) => (
              <BusinessUseCaseCard key={useCase.id} useCase={useCase} />
            ))}
          </div>
        </div>
      </section>

      <CustomerReferences />
      <PresentationSection />
      <ReferenceMaterial />

      {/* Try Agents Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Experience the Future of HR?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-12 leading-relaxed">
              Try the four AI agents we built during the workshop and see how
              they can transform your HR operations
            </p>

            <Button
              size="lg"
              onClick={() => (window.location.href = "/agents")}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg px-12 py-6 h-auto group mb-4"
            >
              Browse All Agents
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card">
        <div className="container px-4 mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Built by Salesforce for NTO • Powered by AgentForce
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
