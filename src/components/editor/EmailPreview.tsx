
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmailElement } from "@/types/editor";
import { Laptop, Smartphone, RefreshCw, Maximize2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface EmailPreviewProps {
  elements: EmailElement[];
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ elements }) => {
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewProvider, setPreviewProvider] = useState("gmail");
  const [key, setKey] = useState(0); // Used to force refresh the preview

  // Refresh the preview
  const handleRefresh = () => {
    setKey(prev => prev + 1);
    toast.success("Preview refreshed");
  };

  const renderEmailContent = (elements: EmailElement[]) => {
    if (!elements.length) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
          <Eye className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-center">No content to preview yet. Add elements to your email template.</p>
        </div>
      );
    }

    // Render the actual elements in the preview
    return (
      <div className="p-4">
        {elements.map((element) => {
          switch (element.type) {
            case "heading":
              return (
                <h2 
                  key={element.id}
                  style={{
                    fontSize: element.style?.["font-size"],
                    fontWeight: element.style?.["font-weight"],
                    color: element.style?.["color"],
                    textAlign: (element.style?.["text-align"] as any) || "left",
                    padding: element.style?.["padding"]
                  }}
                >
                  {element.content}
                </h2>
              );
            
            case "text":
              return (
                <p 
                  key={element.id}
                  style={{
                    fontSize: element.style?.["font-size"],
                    color: element.style?.["color"],
                    lineHeight: element.style?.["line-height"],
                    textAlign: (element.style?.["text-align"] as any) || "left",
                    padding: element.style?.["padding"]
                  }}
                >
                  {element.content}
                </p>
              );
            
            case "button":
              return (
                <button
                  key={element.id}
                  style={{
                    backgroundColor: element.style?.["background-color"],
                    color: element.style?.["color"],
                    padding: element.style?.["padding"],
                    borderRadius: element.style?.["border-radius"],
                    display: element.style?.["display"],
                    textAlign: (element.style?.["text-align"] as any) || "center"
                  }}
                >
                  {element.content}
                </button>
              );
            
            case "divider":
              return (
                <hr 
                  key={element.id}
                  style={{ 
                    borderTop: element.style?.["border-top"],
                    margin: element.style?.["margin"]
                  }} 
                />
              );
            
            case "spacer":
              return (
                <div 
                  key={element.id}
                  style={{ height: element.style?.["height"] }}
                />
              );
            
            case "image":
              return (
                <div 
                  key={element.id}
                  className="bg-muted/20 aspect-video flex items-center justify-center"
                >
                  <span className="text-xs text-muted-foreground">Image placeholder</span>
                </div>
              );
            
            default:
              return null;
          }
        })}
      </div>
    );
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-medium">Email Preview</h3>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setPreviewDevice("desktop")}
            className={previewDevice === "desktop" ? "bg-primary/10 text-primary" : ""}
            title="Desktop preview"
          >
            <Laptop className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setPreviewDevice("mobile")}
            className={previewDevice === "mobile" ? "bg-primary/10 text-primary" : ""}
            title="Mobile preview"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={handleRefresh}
            title="Refresh preview"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost"
                title="Fullscreen preview"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-screen-lg w-full h-[90vh] p-0">
              <div className="h-full overflow-auto bg-white p-6">
                {renderEmailContent(elements)}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="p-3 border-b bg-muted/30">
        <Select value={previewProvider} onValueChange={setPreviewProvider}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gmail">Gmail</SelectItem>
            <SelectItem value="outlook">Outlook</SelectItem>
            <SelectItem value="apple">Apple Mail</SelectItem>
            <SelectItem value="yahoo">Yahoo Mail</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div 
          key={key}
          className={`bg-white transition-all duration-300 mx-auto h-full overflow-auto ${
            previewDevice === "desktop" ? "w-full" : "w-[375px]"
          }`}
        >
          {renderEmailContent(elements)}
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;
