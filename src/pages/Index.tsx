
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ElementLibrary from "@/components/editor/ElementLibrary";
import EditorCanvas from "@/components/editor/EditorCanvas";
import EmailPreview from "@/components/editor/EmailPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ElementType, EmailElement } from "@/types/editor";
import { Save, Download, PlayCircle, RotateCcw, Eye } from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Index = () => {
  const [elements, setElements] = useState<EmailElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("Untitled Template");
  const [previewMode, setPreviewMode] = useState(false);
  const [exportFormat, setExportFormat] = useState<"html" | "json">("html");
  const isMobile = useIsMobile();

  const handleElementDragStart = (type: ElementType) => {
    return (event: React.DragEvent) => {
      event.dataTransfer.setData("application/mailcraft-element", type);
    };
  };

  const handleSave = () => {
    // Convert the template to JSON for saving
    const template = {
      name: templateName,
      elements: elements,
      updatedAt: new Date().toISOString(),
    };
    
    // In a real app, this would save to a backend API
    // For now, we'll simulate saving by storing in localStorage
    localStorage.setItem("mailcraft_template", JSON.stringify(template));
    toast.success("Template saved successfully");
  };

  // Load saved template on first render
  useEffect(() => {
    const savedTemplate = localStorage.getItem("mailcraft_template");
    if (savedTemplate) {
      try {
        const template = JSON.parse(savedTemplate);
        setTemplateName(template.name);
        setElements(template.elements);
        toast.success("Template loaded from local storage");
      } catch (error) {
        console.error("Failed to load template:", error);
      }
    }
  }, []);

  const generateHTML = () => {
    // Basic HTML email template
    let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${templateName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
`;

    // Add elements to HTML
    elements.forEach(element => {
      switch (element.type) {
        case "heading":
          htmlContent += `<h2 style="`;
          if (element.style) {
            Object.entries(element.style).forEach(([key, value]) => {
              htmlContent += `${key}: ${value}; `;
            });
          }
          htmlContent += `">${element.content}</h2>\n`;
          break;
        
        case "text":
          htmlContent += `<p style="`;
          if (element.style) {
            Object.entries(element.style).forEach(([key, value]) => {
              htmlContent += `${key}: ${value}; `;
            });
          }
          htmlContent += `">${element.content}</p>\n`;
          break;
        
        case "button":
          htmlContent += `<a href="#" style="`;
          if (element.style) {
            Object.entries(element.style).forEach(([key, value]) => {
              htmlContent += `${key}: ${value}; `;
            });
          }
          htmlContent += `">${element.content}</a>\n`;
          break;
        
        case "divider":
          htmlContent += `<hr style="`;
          if (element.style) {
            Object.entries(element.style).forEach(([key, value]) => {
              htmlContent += `${key}: ${value}; `;
            });
          }
          htmlContent += `">\n`;
          break;
        
        case "spacer":
          htmlContent += `<div style="height: ${element.style?.["height"] || '20px'};"></div>\n`;
          break;
        
        case "image":
          if (element.content) {
            htmlContent += `<img src="${element.content}" alt="Email image" style="max-width: 100%;">\n`;
          }
          break;
        
        default:
          break;
      }
    });

    htmlContent += `
  </div>
</body>
</html>
`;

    return htmlContent;
  };

  const generateJSON = () => {
    return JSON.stringify({
      name: templateName,
      elements: elements,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  };

  const handleExport = () => {
    let content: string;
    let fileExtension: string;
    let mimeType: string;
    
    if (exportFormat === "html") {
      content = generateHTML();
      fileExtension = ".html";
      mimeType = "text/html";
    } else {
      content = generateJSON();
      fileExtension = ".json";
      mimeType = "application/json";
    }
    
    // Create file and download it
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${templateName.replace(/\s+/g, "-").toLowerCase()}${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    toast.success(`Template exported as ${exportFormat.toUpperCase()}`);
  };

  const handleTogglePreview = () => {
    setPreviewMode(!previewMode);
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 h-screen flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="text-lg font-medium bg-transparent border-transparent focus-visible:bg-background focus-visible:border-input"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={handleTogglePreview}>
              {previewMode ? <RotateCcw className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {previewMode ? "Back to Editor" : "Preview"}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Template</DialogTitle>
                  <DialogDescription>
                    Choose the format to export your email template.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={exportFormat === "html" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setExportFormat("html")}
                    >
                      HTML
                    </Button>
                    <Button
                      variant={exportFormat === "json" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setExportFormat("json")}
                    >
                      JSON
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleExport}>
                    Export as {exportFormat.toUpperCase()}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button size="sm" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        {previewMode ? (
          <div className="flex-1 overflow-hidden animate-fade-in">
            <EmailPreview elements={elements} />
          </div>
        ) : (
          isMobile ? (
            <div className="flex-1 flex flex-col gap-4 overflow-auto">
              <div className="h-64 overflow-auto">
                <ElementLibrary onElementDragStart={handleElementDragStart} />
              </div>
              <div className="flex-1 overflow-hidden">
                <EditorCanvas
                  elements={elements}
                  selectedElement={selectedElement}
                  onSelectElement={setSelectedElement}
                  onUpdateElements={setElements}
                />
              </div>
              <div className="h-64 overflow-hidden">
                <EmailPreview elements={elements} />
              </div>
            </div>
          ) : (
            <ResizablePanelGroup
              direction="horizontal"
              className="flex-1 overflow-hidden animate-fade-in"
            >
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <ElementLibrary onElementDragStart={handleElementDragStart} />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              <ResizablePanel defaultSize={50}>
                <EditorCanvas
                  elements={elements}
                  selectedElement={selectedElement}
                  onSelectElement={setSelectedElement}
                  onUpdateElements={setElements}
                />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              <ResizablePanel defaultSize={30} minSize={20}>
                <EmailPreview elements={elements} />
              </ResizablePanel>
            </ResizablePanelGroup>
          )
        )}
      </div>
    </Layout>
  );
};

export default Index;
