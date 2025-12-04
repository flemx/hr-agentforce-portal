import { 
  UserPlus, 
  Calendar, 
  FileText, 
  Heart, 
  MessageCircleQuestion,
  Clock,
  CreditCard,
  Shield,
  Bot,
  Slack,
  HelpCircle,
  Users,
  Settings
} from "lucide-react";

export const getAgentIcon = (agentTemplate: string, developerName: string) => {
  // Map agent templates to appropriate icons
  if (agentTemplate?.includes('Slack') || developerName?.includes('Slack')) {
    return <Slack className="w-6 h-6" />;
  }
  
  if (agentTemplate?.includes('EmployeeCopilot') || developerName?.includes('Agentforce_Employee')) {
    return <Bot className="w-6 h-6" />;
  }
  
  if (agentTemplate?.includes('Onboarding') || developerName?.includes('Onboarding')) {
    return <UserPlus className="w-6 h-6" />;
  }
  
  if (agentTemplate?.includes('Help') || developerName?.includes('Help')) {
    return <HelpCircle className="w-6 h-6" />;
  }
  
  // Default fallback icon
  return <MessageCircleQuestion className="w-6 h-6" />;
};

export const getAgentCategory = (agentTemplate: string) => {
  if (agentTemplate?.includes('Slack')) {
    return 'Slack Integration';
  }
  
  if (agentTemplate?.includes('Employee')) {
    return 'Employee Services';
  }
  
  if (agentTemplate?.includes('Onboarding')) {
    return 'Onboarding';
  }
  
  if (agentTemplate?.includes('Help')) {
    return 'Support';
  }
  
  return 'AI Agent';
};