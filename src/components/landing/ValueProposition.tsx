'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Workflow,
  Globe,
  Zap,
  ArrowRight,
  Rocket,
  Target
} from "lucide-react";

const valuePoints = [
  {
    icon: Workflow,
    title: "Seamless Integration",
    description: "Connect Slack, scheduling, and third party AI agents for unified HR operations"
  },
  {
    icon: Globe,
    title: "Global Scale",
    description: "From HR Corporate to worldwide HR teams, scaling AI agent capabilities across NTO"
  },
  {
    icon: Zap,
    title: "One Platform Vision",
    description: "Unified communication through Slack for streamlined employee experience"
  }
];

const nextSteps = [
  {
    icon: Target,
    title: "Proof of Concept",
    description: "3-month pilot with prof services and deployment strategists"
  },
  {
    icon: Rocket,
    title: "Full Deployment",
    description: "Scale to production with complete HR agent roadmap"
  }
];

const ValueProposition = () => {
  const router = useRouter();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 mx-auto">
        {/* Value Points */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              The Value of AgentForce
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transforming HR operations through intelligent automation and seamless integration
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {valuePoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <Card
                  key={index}
                  className="p-8 text-center hover:shadow-hover transition-all duration-300 border-border bg-card"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {point.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {point.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-foreground mb-8 text-center">
            Next Steps
          </h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {nextSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card
                  key={index}
                  className="p-6 border-border bg-card hover:border-primary transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground mb-2">
                        {step.title}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="p-12 text-center bg-gradient-primary border-0">
          <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Experience the Future of HR?
          </h3>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Try the four AI agents we built during the workshop and see how they can transform your HR operations
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/agents')}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg px-8 py-6 h-auto group"
          >
            Launch Agent Portal
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Card>
      </div>
    </section>
  );
};

export default ValueProposition;
