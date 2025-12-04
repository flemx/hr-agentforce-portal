import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Database, FileText, Settings } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ToolOutput } from "@/utils/agentforceApi";

interface ToolOutputCardProps {
  toolOutput: ToolOutput;
}

const getToolIcon = (toolType: string) => {
  if (toolType.includes("PTO") || toolType.includes("Balance")) return <FileText className="h-4 w-4" />;
  if (toolType.includes("Database") || toolType.includes("Query")) return <Database className="h-4 w-4" />;
  if (toolType.includes("System") || toolType.includes("Config")) return <Settings className="h-4 w-4" />;
  return <Terminal className="h-4 w-4" />;
};

const getToolDisplayName = (toolType: string): string => {
  // Extract tool name from copilotActionOutput/<tool_name> format
  const match = toolType.match(/copilotActionOutput\/(.+)/);
  if (match) {
    const toolName = match[1];
    // Convert snake_case or PascalCase to readable format
    return toolName
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
  return toolType;
};

export const ToolOutputCard: React.FC<ToolOutputCardProps> = ({ toolOutput }) => {
  const toolDisplayName = getToolDisplayName(toolOutput.type);
  const toolIcon = getToolIcon(toolOutput.type);
  
  // Get the main content - prioritize outputPromptResponse, then check other value properties
  let content = toolOutput.value?.outputPromptResponse;
  
  // If no outputPromptResponse, check for other common content properties
  if (!content) {
    const valueKeys = Object.keys(toolOutput.value || {});
    for (const key of valueKeys) {
      const value = toolOutput.value[key];
      if (typeof value === 'string' && value.trim()) {
        content = value;
        break;
      }
    }
  }
  
  // Fallback to JSON representation
  if (!content) {
    content = JSON.stringify(toolOutput.value, null, 2);
  }

  // Check if content contains HTML tags
  const hasHtmlTags = /<[^>]*>/g.test(content);
  
  // Extract URLs from HTML content for preview (both img src and anchor href)
  const extractPreviewUrls = (htmlContent: string): Array<{url: string, text?: string, type: 'img' | 'link'}> => {
    const urls = [];
    
    // Extract img src URLs
    const imgTagRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = imgTagRegex.exec(htmlContent)) !== null) {
      urls.push({ url: match[1], type: 'img' as const });
    }
    
    // Extract anchor href URLs
    const anchorRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    while ((match = anchorRegex.exec(htmlContent)) !== null) {
      const url = match[1].replace(/&amp;/g, '&'); // Decode HTML entities
      const linkText = match[2];
      urls.push({ url, text: linkText, type: 'link' as const });
    }
    
    return urls;
  };

  const previewUrls = hasHtmlTags ? extractPreviewUrls(content) : [];
  const hasPreviewUrls = previewUrls.length > 0;

  return (
    <Card className="mt-3 bg-card/60 border-primary/20 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
            {toolIcon}
            {toolDisplayName}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            Tool Output
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-headings:text-foreground prose-strong:text-foreground dark:prose-invert [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:bg-background [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-muted/50 [&_th]:font-semibold [&_th]:text-left [&_th]:text-foreground [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-foreground [&_thead]:bg-muted/30">
          {hasPreviewUrls ? (
            <div className="space-y-3">
              {/* Show any text content without HTML tags */}
              {content.replace(/<img[^>]*>|<a[^>]*>.*?<\/a>/gi, '').trim() && (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: content.replace(/<img[^>]*>|<a[^>]*>.*?<\/a>/gi, '') 
                  }}
                  className="break-words"
                />
              )}
              {/* Show URL previews */}
              <div className="space-y-2">
                {previewUrls.map((item, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden bg-background/50">
                    <img 
                      src={item.url} 
                      alt={item.text || "Preview"}
                      className="w-full max-w-md max-h-96 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="p-4 space-y-2">
                              <div class="text-sm font-medium">${item.text || 'Link Preview'}</div>
                              <a href="${item.url}" target="_blank" class="text-primary underline text-sm hover:text-primary/80 transition-colors">
                                ${item.type === 'link' ? 'Open Link' : 'View Image'} ↗
                              </a>
                            </div>
                          `;
                        }
                      }}
                      loading="lazy"
                    />
                    {/* URL display at bottom of preview */}
                    <div className="p-3 border-t bg-muted/30">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {item.text && (
                            <div className="text-sm font-medium text-foreground mb-1">
                              {item.text}
                            </div>
                          )}
                          <div className="text-xs font-mono text-muted-foreground break-all">
                            {item.url}
                          </div>
                        </div>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 transition-colors flex-shrink-0"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : hasHtmlTags ? (
            <div 
              dangerouslySetInnerHTML={{ __html: content }}
              className="break-words"
            />
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          )}
        </div>
      </CardContent>
    </Card>
  );
};