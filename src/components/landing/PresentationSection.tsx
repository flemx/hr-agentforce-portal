import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

const PresentationSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Presentation of September 16, 2025
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Download the full workshop presentation
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="p-8 border-border bg-card hover:shadow-hover transition-all duration-300">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  How Salesforce Uses Agents to Empower Employees
                </h3>
                <p className="text-muted-foreground mb-4">
                  Complete workshop deck from the HR AI Workshop
                </p>
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <a
                    href="/uploads/agentforce-playbook.pdf"
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PresentationSection;
