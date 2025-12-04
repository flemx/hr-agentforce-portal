'use client';

import { useState, useEffect } from "react";
import { AgentCard } from "@/components/AgentCard";
import { SearchBar } from "@/components/SearchBar";
import { AgentChat } from "@/components/AgentChat";
import { MessageCircleQuestion, Loader2, ArrowLeft, LogOut } from "lucide-react";
import { fetchSalesforceAgents } from "@/utils/salesforce";
import { getAgentIcon, getAgentCategory } from "@/utils/agentIcons";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface Agent {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

const HRAgents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        const salesforceAgents = await fetchSalesforceAgents();

        const mappedAgents: Agent[] = salesforceAgents.map((agent) => ({
          id: agent.Id,
          title: agent.MasterLabel,
          description: agent.Description || "No description available",
          icon: getAgentIcon(agent.AgentTemplate, agent.DeveloperName),
          category: getAgentCategory(agent.AgentTemplate),
        }));

        setAgents(mappedAgents);
      } catch (error) {
        console.error("Error loading agents:", error);
        toast({
          title: "Error loading agents",
          description:
            "Failed to fetch agents from Salesforce. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, [toast]);

  const filteredAgents = agents.filter(
    (agent) =>
      agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAgentClick = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (agent) {
      setSelectedAgent(agent);
      setIsChatOpen(true);
    }
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
    setSelectedAgent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Logo Header */}
      <header className="py-6 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-6">
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
                alt="NTO Logo"
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

      <div className="container mx-auto px-6 py-12">
        {/* Back to Landing Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workshop Overview
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground inline-flex items-center gap-3 mb-6">
            {/* <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2">
              <img
                src="/lovable-uploads/4989b6fd-baf0-44e0-a9e5-f6d3b56b91e7.png"
                alt="NTO Logo"
                className="w-full h-full object-contain"
              />
            </div> */}
            <span className="text-primary">NTO</span> HR Assistant Hub
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Get instant help with all your HR needs. Our AI agents are here to
            assist you with onboarding, leave requests, payroll questions, and
            much more.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-12">
          <SearchBar
            placeholder="Search HR agents..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        {/* Browse Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">
              Browse HR Agents
            </h2>
            <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {filteredAgents.length} agents available
            </span>
          </div>
        </div>

        {/* Agents Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              Loading agents from Salesforce...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                title={agent.title}
                description={agent.description}
                icon={agent.icon}
                category={agent.category}
                onClick={() => handleAgentClick(agent.id)}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredAgents.length === 0 && agents.length > 0 && (
          <div className="text-center py-12">
            <MessageCircleQuestion className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No agents found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or browse all available agents.
            </p>
          </div>
        )}

        {!loading && agents.length === 0 && (
          <div className="text-center py-12">
            <MessageCircleQuestion className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No agents available
            </h3>
            <p className="text-muted-foreground">
              Unable to load agents from Salesforce. Please check your
              connection and try again.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-12 border-t border-border/50 bg-gradient-primary text-white rounded-2xl p-8 mt-12">
          <p className="text-sm text-white/90">
            This is a demo application Salesforce Agentforce, using dummy data.
          </p>
        </div>
      </div>

      {/* Chat Widget */}
      {selectedAgent && (
        <AgentChat
          agent={selectedAgent}
          isOpen={isChatOpen}
          onClose={handleChatClose}
        />
      )}
    </div>
  );
};

export default HRAgents;
