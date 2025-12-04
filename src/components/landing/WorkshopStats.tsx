import { Card } from "@/components/ui/card";

const WorkshopStats = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Workshop Highlights
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A successful collaboration that demonstrated the transformative potential of AI agents in HR
          </p>
        </div>

        {/* Highlights Description */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 border-border bg-card">
            <div className="text-muted-foreground leading-relaxed text-lg">
              <p className="mb-6">
                In collaboration with NTO's HR leadership team, we conducted an immersive workshop 
                that showcased the practical application of AI agents to solve real-world HR challenges. 
                Through hands-on collaboration, we identified four critical use cases and built 
                working prototypes that demonstrated immediate value.
              </p>
              <ul className="space-y-3 list-disc list-inside">
                <li>Engaged key stakeholders across HR functions—from talent acquisition to compensation and career development</li>
                <li>Addressed specific pain points: reducing administrative burden, enhancing data-driven decision-making, improving employee experience, and ensuring fair compensation</li>
                <li>Achieved strong consensus on scaling these solutions across the organization</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default WorkshopStats;
