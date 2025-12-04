import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, BarChart3, BookOpen, GraduationCap } from "lucide-react";

const references = [
  {
    icon: BarChart3,
    title: "Agentic Benchmark for CRM",
    description: "Research-backed benchmarks showing how AI agents transform CRM operations",
    url: "https://www.salesforceairesearch.com/crm-benchmark",
    buttonText: "View Benchmark"
  },
  {
    icon: BookOpen,
    title: "Agentforce Use Case Library",
    description: "Explore real-world use cases and implementation examples across industries",
    url: "https://www.salesforce.com/eu/agentforce/use-cases/",
    buttonText: "Browse Use Cases"
  },
  {
    icon: GraduationCap,
    title: "Agentforce Training Program",
    description: "Become an Agentblazer with hands-on training and certification on Trailhead",
    url: "https://trailhead.salesforce.com/agentblazer",
    buttonText: "Start Learning"
  }
];

const ReferenceMaterial = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Reference Material
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore additional resources to deepen your understanding of Agentforce
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {references.map((reference, index) => {
            const Icon = reference.icon;
            return (
              <Card
                key={index}
                className="p-8 border-border bg-card hover:shadow-hover transition-all duration-300 flex flex-col"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-primary/10">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {reference.title}
                </h3>
                <p className="text-muted-foreground mb-6 flex-1">
                  {reference.description}
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full group"
                >
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {reference.buttonText}
                    <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ReferenceMaterial;
