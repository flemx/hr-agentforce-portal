import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BusinessUseCase } from "@/data/businessUseCases";
import {
  GraduationCap,
  BarChart3,
  Calendar,
  DollarSign,
  LucideIcon,
  CheckCircle2
} from "lucide-react";

interface BusinessUseCaseCardProps {
  useCase: BusinessUseCase;
}

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  BarChart3,
  Calendar,
  DollarSign
};

const BusinessUseCaseCard = ({ useCase }: BusinessUseCaseCardProps) => {
  const Icon = iconMap[useCase.icon] || GraduationCap;

  return (
    <Card className="p-8 hover:shadow-hover transition-all duration-300 border-border bg-card h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1">
          <Badge variant="outline" className="mb-2 text-xs">
            {useCase.agentName}
          </Badge>
          <h3 className="text-2xl font-bold text-foreground">
            {useCase.title}
          </h3>
        </div>
      </div>

      {/* Challenge */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-destructive mb-2 uppercase tracking-wide">
          The Challenge
        </h4>
        <p className="text-muted-foreground leading-relaxed">
          {useCase.challenge}
        </p>
      </div>

      {/* Solution */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">
          The Solution
        </h4>
        <p className="text-foreground leading-relaxed">
          {useCase.solution}
        </p>
      </div>

      {/* Business Requirements */}
      <div className="mt-auto pt-6 border-t border-border">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Key Requirements
        </h4>
        <ul className="space-y-2">
          {useCase.businessRequirements.map((requirement, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <CheckCircle2 className="flex-shrink-0 w-4 h-4 text-primary mt-0.5" />
              <span>{requirement}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default BusinessUseCaseCard;
