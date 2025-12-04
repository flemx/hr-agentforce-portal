import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const SearchBar = ({ 
  placeholder = "Search HR agents...", 
  value, 
  onChange,
  className 
}: SearchBarProps) => {
  return (
    <div className={cn("relative max-w-2xl", className)}>
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
        <Search className="w-5 h-5" />
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="pl-12 pr-4 py-6 text-base border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-xl shadow-card transition-all duration-300"
      />
    </div>
  );
};