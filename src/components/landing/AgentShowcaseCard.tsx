import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkshopAgent } from "@/data/workshopAgents";
import {
  GraduationCap,
  BarChart3,
  Calendar,
  DollarSign,
  LucideIcon
} from "lucide-react";

interface AgentShowcaseCardProps {
  agent: WorkshopAgent;
}

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  BarChart3,
  Calendar,
  DollarSign
};

const AgentShowcaseCard = ({ agent }: AgentShowcaseCardProps) => {
  const Icon = iconMap[agent.icon] || GraduationCap;

  return (
    <Card className="p-6 hover:shadow-hover transition-all duration-300 border-border bg-card h-full flex flex-col group">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
            {agent.name}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {agent.category}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground mb-6 leading-relaxed">
        {agent.description}
      </p>

      {/* Key Responsibilities */}
      <div className="mb-6 flex-1">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Key Capabilities
        </h4>
        <ul className="space-y-2">
          {agent.responsibilities.slice(0, 3).map((responsibility, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span>{responsibility.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sample Use Case */}
      <div className="mt-auto pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground italic">
          "{agent.sampleUtterances[0]}"
        </p>
      </div>
    </Card>
  );
};

export default AgentShowcaseCard;
