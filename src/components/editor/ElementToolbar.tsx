
import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ElementToolbarProps {
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  elementType: string;
  onTextFormatting?: (format: string) => void;
  onAlignment?: (alignment: string) => void;
}

const ElementToolbar: React.FC<ElementToolbarProps> = ({
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  elementType,
  onTextFormatting,
  onAlignment,
}) => {
  const isTextElement = ["text", "heading", "button"].includes(elementType);

  const renderToolbarButton = (icon: React.ReactNode, action: () => void, label: string) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={action}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div className="flex items-center p-2 bg-background border rounded-md shadow-sm animate-fade-in">
      {isTextElement && onTextFormatting && (
        <>
          <div className="flex space-x-1">
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
          <Separator orientation="vertical" className="mx-2 h-8" />
        </>
      )}

      {isTextElement && onAlignment && (
        <>
          <div className="flex space-x-1">
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
            {elementType === "text" && renderToolbarButton(
              <AlignJustify className="h-4 w-4" />, 
              () => onAlignment("justify"), 
              "Justify"
            )}
          </div>
          <Separator orientation="vertical" className="mx-2 h-8" />
        </>
      )}

      <div className="flex space-x-1">
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
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default ElementToolbar;
