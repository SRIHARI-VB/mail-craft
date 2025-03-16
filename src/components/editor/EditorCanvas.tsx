
import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { EmailElement, ElementType } from "@/types/editor";
import ElementToolbar from "./ElementToolbar";
import { ChevronDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Custom DragDropIcon component since lucide-react doesn't have one
const DragDropIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 8V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v3"/>
    <path d="M18 14v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3"/>
    <path d="M17 18h1c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-1"/>
    <path d="M7 6H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h1"/>
    <line x1="12" y1="2" x2="12" y2="22"/>
  </svg>
);

interface EditorCanvasProps {
  elements: EmailElement[];
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElements: (elements: EmailElement[]) => void;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElements,
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [editingText, setEditingText] = useState<string | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    const elementType = e.dataTransfer.getData("application/mailcraft-element") as ElementType;
    
    if (!elementType) return;
    
    const newElement: EmailElement = {
      id: `element-${Date.now()}`,
      type: elementType,
      content: getDefaultContent(elementType),
      style: getDefaultStyle(elementType),
    };
    
    onUpdateElements([...elements, newElement]);
    onSelectElement(newElement.id);
    
    toast.success(`Added ${elementType} element`);
  };

  const getDefaultContent = (type: ElementType): string => {
    switch (type) {
      case "heading":
        return "Your Heading";
      case "text":
        return "Enter your text here. This is a paragraph that you can edit.";
      case "button":
        return "Click Me";
      default:
        return "";
    }
  };

  const getDefaultStyle = (type: ElementType): Record<string, string> => {
    switch (type) {
      case "heading":
        return { 
          "font-size": "24px", 
          "font-weight": "bold", 
          "color": "#333333",
          "padding": "10px 0"
        };
      case "text":
        return { 
          "font-size": "16px", 
          "color": "#666666",
          "line-height": "1.5",
          "padding": "10px 0"
        };
      case "button":
        return { 
          "background-color": "#3b82f6",
          "color": "#ffffff",
          "padding": "10px 20px",
          "border-radius": "4px",
          "display": "inline-block",
          "cursor": "pointer"
        };
      case "divider":
        return { 
          "border-top": "1px solid #e5e7eb",
          "margin": "20px 0"
        };
      case "spacer":
        return { "height": "30px" };
      case "image":
        return { 
          "max-width": "100%",
          "height": "auto"
        };
      default:
        return {};
    }
  };

  const handleDeleteElement = (id: string) => {
    onUpdateElements(elements.filter(el => el.id !== id));
    onSelectElement(null);
    toast.success("Element deleted");
  };

  const handleDuplicateElement = (id: string) => {
    const elementToDuplicate = elements.find(el => el.id === id);
    if (!elementToDuplicate) return;
    
    const newElement: EmailElement = {
      ...elementToDuplicate,
      id: `element-${Date.now()}`,
    };
    
    const newElements = [...elements];
    const index = elements.findIndex(el => el.id === id);
    newElements.splice(index + 1, 0, newElement);
    
    onUpdateElements(newElements);
    onSelectElement(newElement.id);
    toast.success("Element duplicated");
  };

  const handleMoveElement = (id: string, direction: "up" | "down") => {
    const newElements = [...elements];
    const index = elements.findIndex(el => el.id === id);
    
    if (
      (direction === "up" && index === 0) || 
      (direction === "down" && index === elements.length - 1)
    ) {
      return;
    }
    
    const element = newElements[index];
    newElements.splice(index, 1);
    newElements.splice(direction === "up" ? index - 1 : index + 1, 0, element);
    
    onUpdateElements(newElements);
    toast.success(`Element moved ${direction}`);
  };

  const handleTextFormatting = (id: string, format: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    const newElements = elements.map(el => {
      if (el.id === id) {
        const newStyle = { ...el.style };
        
        switch (format) {
          case "bold":
            newStyle["font-weight"] = newStyle["font-weight"] === "bold" ? "normal" : "bold";
            break;
          case "italic":
            newStyle["font-style"] = newStyle["font-style"] === "italic" ? "normal" : "italic";
            break;
          case "underline":
            newStyle["text-decoration"] = newStyle["text-decoration"] === "underline" ? "none" : "underline";
            break;
        }
        
        return {
          ...el,
          style: newStyle
        };
      }
      return el;
    });
    
    onUpdateElements(newElements);
    toast.success(`Applied ${format} formatting`);
  };

  const handleAlignment = (id: string, alignment: string) => {
    const newElements = elements.map(el => {
      if (el.id === id) {
        return {
          ...el,
          style: {
            ...el.style,
            "text-align": alignment
          }
        };
      }
      return el;
    });
    
    onUpdateElements(newElements);
    toast.success(`Text aligned ${alignment}`);
  };

  const startEditingText = (id: string) => {
    setEditingText(id);
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }, 0);
  };

  const handleTextChange = (id: string, value: string) => {
    const newElements = elements.map(el => {
      if (el.id === id) {
        return {
          ...el,
          content: value
        };
      }
      return el;
    });
    
    onUpdateElements(newElements);
  };

  const handleImageUpload = (id: string) => {
    // Simulate image upload with a placeholder
    const newElements = elements.map(el => {
      if (el.id === id) {
        return {
          ...el,
          content: "https://placehold.co/600x400/3b82f6/ffffff?text=Sample+Image",
        };
      }
      return el;
    });
    
    onUpdateElements(newElements);
    toast.success("Image added");
  };

  const renderElement = (element: EmailElement) => {
    const isSelected = selectedElement === element.id;
    
    switch (element.type) {
      case "heading":
        return (
          <div className={cn("editor-component", isSelected && "editor-component-selected")}>
            {isSelected && editingText === element.id ? (
              <textarea
                ref={textInputRef}
                className="w-full bg-transparent border-none focus:outline-none resize-none"
                value={element.content}
                onChange={(e) => handleTextChange(element.id, e.target.value)}
                onBlur={() => setEditingText(null)}
                style={{
                  fontSize: element.style?.["font-size"],
                  fontWeight: element.style?.["font-weight"],
                  fontStyle: element.style?.["font-style"],
                  textDecoration: element.style?.["text-decoration"],
                  color: element.style?.["color"],
                  textAlign: (element.style?.["text-align"] as any) || "left"
                }}
              />
            ) : (
              <h2
                className="cursor-text"
                style={{
                  fontSize: element.style?.["font-size"],
                  fontWeight: element.style?.["font-weight"],
                  fontStyle: element.style?.["font-style"],
                  textDecoration: element.style?.["text-decoration"],
                  color: element.style?.["color"],
                  textAlign: (element.style?.["text-align"] as any) || "left"
                }}
                onClick={() => startEditingText(element.id)}
              >
                {element.content}
              </h2>
            )}
            {isSelected && (
              <div className="absolute -top-12 left-0 right-0 flex justify-center">
                <ElementToolbar
                  elementType={element.type}
                  onDelete={() => handleDeleteElement(element.id)}
                  onDuplicate={() => handleDuplicateElement(element.id)}
                  onMoveUp={() => handleMoveElement(element.id, "up")}
                  onMoveDown={() => handleMoveElement(element.id, "down")}
                  onTextFormatting={(format) => handleTextFormatting(element.id, format)}
                  onAlignment={(alignment) => handleAlignment(element.id, alignment)}
                />
              </div>
            )}
          </div>
        );
      
      case "text":
        return (
          <div className={cn("editor-component", isSelected && "editor-component-selected")}>
            {isSelected && editingText === element.id ? (
              <textarea
                ref={textInputRef}
                className="w-full bg-transparent border-none focus:outline-none resize-none"
                value={element.content}
                onChange={(e) => handleTextChange(element.id, e.target.value)}
                onBlur={() => setEditingText(null)}
                style={{
                  fontSize: element.style?.["font-size"],
                  fontStyle: element.style?.["font-style"],
                  fontWeight: element.style?.["font-weight"],
                  textDecoration: element.style?.["text-decoration"],
                  color: element.style?.["color"],
                  lineHeight: element.style?.["line-height"],
                  textAlign: (element.style?.["text-align"] as any) || "left"
                }}
              />
            ) : (
              <p
                className="cursor-text"
                style={{
                  fontSize: element.style?.["font-size"],
                  fontStyle: element.style?.["font-style"],
                  fontWeight: element.style?.["font-weight"],
                  textDecoration: element.style?.["text-decoration"],
                  color: element.style?.["color"],
                  lineHeight: element.style?.["line-height"],
                  textAlign: (element.style?.["text-align"] as any) || "left"
                }}
                onClick={() => startEditingText(element.id)}
              >
                {element.content}
              </p>
            )}
            {isSelected && (
              <div className="absolute -top-12 left-0 right-0 flex justify-center">
                <ElementToolbar
                  elementType={element.type}
                  onDelete={() => handleDeleteElement(element.id)}
                  onDuplicate={() => handleDuplicateElement(element.id)}
                  onMoveUp={() => handleMoveElement(element.id, "up")}
                  onMoveDown={() => handleMoveElement(element.id, "down")}
                  onTextFormatting={(format) => handleTextFormatting(element.id, format)}
                  onAlignment={(alignment) => handleAlignment(element.id, alignment)}
                />
              </div>
            )}
          </div>
        );
      
      case "button":
        return (
          <div className={cn("editor-component", isSelected && "editor-component-selected")}>
            {isSelected && editingText === element.id ? (
              <input
                ref={textInputRef as any}
                className="w-full bg-transparent border-none focus:outline-none text-center"
                value={element.content}
                onChange={(e) => handleTextChange(element.id, e.target.value)}
                onBlur={() => setEditingText(null)}
                style={{
                  backgroundColor: element.style?.["background-color"],
                  color: element.style?.["color"],
                  padding: element.style?.["padding"],
                  borderRadius: element.style?.["border-radius"],
                  display: element.style?.["display"],
                  textAlign: (element.style?.["text-align"] as any) || "center",
                  fontWeight: element.style?.["font-weight"],
                  fontStyle: element.style?.["font-style"],
                  textDecoration: element.style?.["text-decoration"],
                }}
              />
            ) : (
              <button
                className="cursor-text"
                style={{
                  backgroundColor: element.style?.["background-color"],
                  color: element.style?.["color"],
                  padding: element.style?.["padding"],
                  borderRadius: element.style?.["border-radius"],
                  display: element.style?.["display"],
                  textAlign: (element.style?.["text-align"] as any) || "center",
                  fontWeight: element.style?.["font-weight"],
                  fontStyle: element.style?.["font-style"],
                  textDecoration: element.style?.["text-decoration"],
                }}
                onClick={() => startEditingText(element.id)}
              >
                {element.content}
              </button>
            )}
            {isSelected && (
              <div className="absolute -top-12 left-0 right-0 flex justify-center">
                <ElementToolbar
                  elementType={element.type}
                  onDelete={() => handleDeleteElement(element.id)}
                  onDuplicate={() => handleDuplicateElement(element.id)}
                  onMoveUp={() => handleMoveElement(element.id, "up")}
                  onMoveDown={() => handleMoveElement(element.id, "down")}
                  onTextFormatting={(format) => handleTextFormatting(element.id, format)}
                  onAlignment={(alignment) => handleAlignment(element.id, alignment)}
                />
              </div>
            )}
          </div>
        );
      
      case "divider":
        return (
          <div className={cn("editor-component", isSelected && "editor-component-selected")}>
            <hr style={{ 
              borderTop: element.style?.["border-top"],
              margin: element.style?.["margin"]
            }} />
            {isSelected && (
              <div className="absolute -top-12 left-0 right-0 flex justify-center">
                <ElementToolbar
                  elementType={element.type}
                  onDelete={() => handleDeleteElement(element.id)}
                  onDuplicate={() => handleDuplicateElement(element.id)}
                  onMoveUp={() => handleMoveElement(element.id, "up")}
                  onMoveDown={() => handleMoveElement(element.id, "down")}
                />
              </div>
            )}
          </div>
        );
      
      case "spacer":
        return (
          <div 
            className={cn("editor-component", isSelected && "editor-component-selected")}
            style={{ height: element.style?.["height"] }}
          >
            <div className="h-full w-full bg-muted/20 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Spacer</span>
            </div>
            {isSelected && (
              <div className="absolute -top-12 left-0 right-0 flex justify-center">
                <ElementToolbar
                  elementType={element.type}
                  onDelete={() => handleDeleteElement(element.id)}
                  onDuplicate={() => handleDuplicateElement(element.id)}
                  onMoveUp={() => handleMoveElement(element.id, "up")}
                  onMoveDown={() => handleMoveElement(element.id, "down")}
                />
              </div>
            )}
          </div>
        );
      
      case "image":
        return (
          <div className={cn("editor-component", isSelected && "editor-component-selected")}>
            {element.content ? (
              <img 
                src={element.content} 
                alt="Email content" 
                className="max-w-full" 
                style={{
                  maxWidth: element.style?.["max-width"],
                  height: element.style?.["height"]
                }}
              />
            ) : (
              <div className="bg-muted/20 aspect-video flex items-center justify-center">
                <Button 
                  variant="ghost" 
                  className="text-muted-foreground"
                  onClick={() => handleImageUpload(element.id)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Click to add image
                </Button>
              </div>
            )}
            {isSelected && (
              <div className="absolute -top-12 left-0 right-0 flex justify-center">
                <ElementToolbar
                  elementType={element.type}
                  onDelete={() => handleDeleteElement(element.id)}
                  onDuplicate={() => handleDuplicateElement(element.id)}
                  onMoveUp={() => handleMoveElement(element.id, "up")}
                  onMoveDown={() => handleMoveElement(element.id, "down")}
                />
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        "bg-white border rounded-lg shadow-sm overflow-auto h-full transition-all",
        isDraggingOver && "border-primary/50 bg-primary/5"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={(e) => {
        if (e.currentTarget === e.target) {
          onSelectElement(null);
        }
      }}
    >
      <div className="p-6 space-y-4 min-h-[600px]">
        {elements.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
            <DragDropIcon className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-center mb-2">Drag elements here to build your email template</p>
            <p className="text-xs">or</p>
            <Button className="mt-2" variant="outline">
              <ChevronDown className="mr-2 h-4 w-4" />
              Choose a template
            </Button>
          </div>
        ) : (
          elements.map((element) => (
            <div 
              key={element.id}
              className="relative"
              onClick={() => onSelectElement(element.id)}
            >
              {renderElement(element)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EditorCanvas;
