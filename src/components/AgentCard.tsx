import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  category?: string;
  onClick?: () => void;
  className?: string;
}

export const AgentCard = ({ 
  title, 
  description, 
  icon, 
  category = "HR Services",
  onClick,
  className 
}: AgentCardProps) => {
  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-hover border-0 bg-gradient-card shadow-card",
        "hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-sm">
            {icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                {category}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};