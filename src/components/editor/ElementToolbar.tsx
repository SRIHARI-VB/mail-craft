import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Type,
  Palette,
  Pilcrow,
  ImageDown,
  Edit3,
  TextCursorInput,
  PaintBucket,
  Box,
  Layout,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ElementToolbarProps {
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  elementType: string;
  onTextFormatting?: (format: string) => void;
  onAlignment?: (alignment: string) => void;
  onStyleChange?: (property: string, value: string) => void;
  currentStyles?: Record<string, string>;
}

const ElementToolbar: React.FC<ElementToolbarProps> = ({
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  elementType,
  onTextFormatting,
  onAlignment,
  onStyleChange,
  currentStyles = {},
}) => {
  const isTextElement = ["text", "heading", "button"].includes(elementType);
  const isContainer = [
    "container",
    "two-column",
    "three-column",
    "card",
    "callout",
  ].includes(elementType);
  const isImage = elementType === "image";

  const renderToolbarButton = (
    icon: React.ReactNode,
    action: () => void,
    label: string
  ) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md transition-all duration-200 hover:bg-primary/10 hover:text-primary"
          onClick={action}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="px-3 py-1.5">
        <p className="text-xs font-medium">{label}</p>
      </TooltipContent>
    </Tooltip>
  );

  const fontFamilies = [
    "Arial, sans-serif",
    "Helvetica, sans-serif",
    "Georgia, serif",
    "Times New Roman, serif",
    "Courier New, monospace",
    "Tahoma, sans-serif",
    "Verdana, sans-serif",
    "Impact, sans-serif",
  ];

  const fontSizes = [
    "12px",
    "14px",
    "16px",
    "18px",
    "20px",
    "24px",
    "28px",
    "32px",
    "36px",
    "42px",
    "48px",
  ];

  const imageSizes = [
    "100px",
    "200px",
    "300px",
    "400px",
    "500px",
    "100%",
    "75%",
    "50%",
    "25%",
    "auto",
  ];

  return (
    <div
      className="flex flex-wrap items-center p-2 bg-background/95 backdrop-blur-sm border rounded-md shadow-sm animate-fade-in gap-1.5 max-w-full overflow-x-auto toolbar-wrapper"
      style={{ minHeight: "44px" }}
    >
      {/* Text formatting options for text elements */}
      {isTextElement && onTextFormatting && (
        <>
          <div className="flex space-x-0.5 flex-nowrap bg-muted/40 rounded-md p-0.5">
            {renderToolbarButton(
              <TextCursorInput className="h-4 w-4" />,
              () => onTextFormatting("edit"),
              "Edit Text"
            )}
            {renderToolbarButton(
              <Bold className="h-4 w-4" />,
              () => onTextFormatting("bold"),
              "Bold"
            )}
            {renderToolbarButton(
              <Italic className="h-4 w-4" />,
              () => onTextFormatting("italic"),
              "Italic"
            )}
            {renderToolbarButton(
              <Underline className="h-4 w-4" />,
              () => onTextFormatting("underline"),
              "Underline"
            )}
          </div>
          <Separator
            orientation="vertical"
            className="mx-1 h-8 flex-shrink-0 opacity-30"
          />
        </>
      )}

      {/* Text alignment options for text elements */}
      {isTextElement && onAlignment && (
        <>
          <div className="flex space-x-0.5 flex-nowrap bg-muted/40 rounded-md p-0.5">
            {renderToolbarButton(
              <AlignLeft className="h-4 w-4" />,
              () => onAlignment("left"),
              "Align Left"
            )}
            {renderToolbarButton(
              <AlignCenter className="h-4 w-4" />,
              () => onAlignment("center"),
              "Align Center"
            )}
            {renderToolbarButton(
              <AlignRight className="h-4 w-4" />,
              () => onAlignment("right"),
              "Align Right"
            )}
            {elementType === "text" &&
              renderToolbarButton(
                <AlignJustify className="h-4 w-4" />,
                () => onAlignment("justify"),
                "Justify"
              )}
          </div>
          <Separator
            orientation="vertical"
            className="mx-1 h-8 flex-shrink-0 opacity-30"
          />
        </>
      )}

      {/* Style options for all elements */}
      {onStyleChange && (
        <>
          {/* Font styling for text elements */}
          {isTextElement && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                >
                  <Type className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 shadow-lg animate-in fade-in-50 zoom-in-95">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm border-b pb-1">
                    Typography
                  </h4>

                  <div className="space-y-3">
                    <h5 className="text-xs text-muted-foreground">
                      Font Family
                    </h5>
                    <Select
                      defaultValue={
                        currentStyles["fontFamily"] || "Arial, sans-serif"
                      }
                      onValueChange={(value) =>
                        onStyleChange("fontFamily", value)
                      }
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        {fontFamilies.map((font) => (
                          <SelectItem
                            key={font}
                            value={font}
                            style={{ fontFamily: font }}
                          >
                            {font.split(",")[0]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-xs text-muted-foreground">Font Size</h5>
                    <Select
                      defaultValue={currentStyles["fontSize"] || "16px"}
                      onValueChange={(value) =>
                        onStyleChange("fontSize", value)
                      }
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {fontSizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-xs text-muted-foreground">
                      Text Color
                    </h5>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={currentStyles["color"] || "#000000"}
                        onChange={(e) => onStyleChange("color", e.target.value)}
                        className="w-10 h-10 cursor-pointer border rounded-md"
                      />
                      <span className="text-xs font-mono">
                        {currentStyles["color"] || "#000000"}
                      </span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Background color picker for text and container elements */}
          {(isTextElement || isContainer) && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                >
                  <PaintBucket className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 shadow-lg animate-in fade-in-50 zoom-in-95">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm border-b pb-1">
                    Background
                  </h4>

                  <div className="space-y-3">
                    <h5 className="text-xs text-muted-foreground">
                      Background Color
                    </h5>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={currentStyles["backgroundColor"] || "#ffffff"}
                        onChange={(e) =>
                          onStyleChange("backgroundColor", e.target.value)
                        }
                        className="w-10 h-10 cursor-pointer border rounded-md"
                      />
                      <span className="text-xs font-mono">
                        {currentStyles["backgroundColor"] || "#ffffff"}
                      </span>
                    </div>
                  </div>

                  {isContainer && (
                    <div className="space-y-3">
                      <h5 className="text-xs text-muted-foreground">
                        Border Radius
                      </h5>
                      <div className="flex items-center gap-3">
                        <Input
                          type="range"
                          min="0"
                          max="20"
                          value={parseInt(currentStyles["borderRadius"] || "0")}
                          onChange={(e) =>
                            onStyleChange("borderRadius", `${e.target.value}px`)
                          }
                          className="w-full h-2"
                        />
                        <span className="text-xs w-12 text-right">
                          {currentStyles["borderRadius"] || "0px"}
                        </span>
                      </div>
                    </div>
                  )}

                  {isContainer && (
                    <div className="space-y-3">
                      <h5 className="text-xs text-muted-foreground">Padding</h5>
                      <div className="flex items-center gap-3">
                        <Input
                          type="range"
                          min="0"
                          max="40"
                          value={parseInt(
                            (currentStyles["padding"] || "0").replace("px", "")
                          )}
                          onChange={(e) =>
                            onStyleChange("padding", `${e.target.value}px`)
                          }
                          className="w-full h-2"
                        />
                        <span className="text-xs w-12 text-right">
                          {currentStyles["padding"] || "0px"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Image settings */}
          {isImage && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                >
                  <ImageDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 shadow-lg animate-in fade-in-50 zoom-in-95">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm border-b pb-1">
                    Image Settings
                  </h4>

                  <div className="space-y-3">
                    <h5 className="text-xs text-muted-foreground">
                      Image Width
                    </h5>
                    <Select
                      defaultValue={currentStyles["width"] || "auto"}
                      onValueChange={(value) => onStyleChange("width", value)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Width" />
                      </SelectTrigger>
                      <SelectContent>
                        {imageSizes.map((size) => (
                          <SelectItem key={`width-${size}`} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-xs text-muted-foreground">
                      Image Height
                    </h5>
                    <Select
                      defaultValue={currentStyles["height"] || "auto"}
                      onValueChange={(value) => onStyleChange("height", value)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Height" />
                      </SelectTrigger>
                      <SelectContent>
                        {imageSizes.map((size) => (
                          <SelectItem key={`height-${size}`} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs text-muted-foreground">
                      Border Radius
                    </h5>
                    <div className="flex items-center gap-3">
                      <Input
                        type="range"
                        min="0"
                        max="50"
                        value={parseInt(currentStyles["borderRadius"] || "0")}
                        onChange={(e) =>
                          onStyleChange("borderRadius", `${e.target.value}px`)
                        }
                        className="w-full h-2"
                      />
                      <span className="text-xs w-10 text-right">
                        {currentStyles["borderRadius"] || "0px"}
                      </span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          <Separator orientation="vertical" className="mx-1 h-8 opacity-30" />
        </>
      )}

      {/* Element manipulation controls */}
      <div className="flex space-x-0.5 flex-nowrap bg-muted/40 rounded-md p-0.5">
        {renderToolbarButton(
          <MoveUp className="h-4 w-4" />,
          onMoveUp,
          "Move Up"
        )}
        {renderToolbarButton(
          <MoveDown className="h-4 w-4" />,
          onMoveDown,
          "Move Down"
        )}
        {renderToolbarButton(
          <Copy className="h-4 w-4" />,
          onDuplicate,
          "Duplicate"
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="px-3 py-1.5 bg-destructive text-destructive-foreground"
          >
            <p className="text-xs font-medium">Delete</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default ElementToolbar;
