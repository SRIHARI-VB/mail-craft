
import React from "react";
import { 
  Type, 
  Image, 
  Square,
  SeparatorHorizontal, 
  Layout, 
  LayoutGrid,
  Text,
  Heading
} from "lucide-react";
import { ElementType } from "@/types/editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ElementLibraryProps {
  onElementDragStart: (type: ElementType) => (event: React.DragEvent) => void;
}

const ElementLibrary: React.FC<ElementLibraryProps> = ({ onElementDragStart }) => {
  return (
    <div className="bg-card border rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-medium">Elements</h3>
        <p className="text-sm text-muted-foreground">Drag elements to the editor</p>
      </div>
      
      <Tabs defaultValue="basic" className="w-full flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="p-4 space-y-2 flex-1 overflow-auto">
          <LibraryItem
            type="heading"
            icon={<Heading className="h-5 w-5" />}
            label="Heading"
            onDragStart={onElementDragStart("heading")}
          />
          <LibraryItem
            type="text"
            icon={<Text className="h-5 w-5" />}
            label="Text"
            onDragStart={onElementDragStart("text")}
          />
          <LibraryItem
            type="image" 
            icon={<Image className="h-5 w-5" />}
            label="Image"
            onDragStart={onElementDragStart("image")}
          />
          <LibraryItem
            type="button"
            icon={<Square className="h-5 w-5" />}
            label="Button"
            onDragStart={onElementDragStart("button")}
          />
          <LibraryItem
            type="divider"
            icon={<SeparatorHorizontal className="h-5 w-5" />}
            label="Divider"
            onDragStart={onElementDragStart("divider")}
          />
          <LibraryItem
            type="spacer"
            icon={<Layout className="h-5 w-5" />}
            label="Spacer"
            onDragStart={onElementDragStart("spacer")}
          />
        </TabsContent>
        
        <TabsContent value="layout" className="p-4 space-y-2 flex-1 overflow-auto">
          <LibraryItem
            type="container"
            icon={<LayoutGrid className="h-5 w-5" />}
            label="Container"
            onDragStart={onElementDragStart("container")}
          />
          {/* Add more layout elements as needed */}
        </TabsContent>
        
        <TabsContent value="advanced" className="p-4 flex-1 overflow-auto">
          <p className="text-sm text-muted-foreground">Coming soon...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface LibraryItemProps {
  type: string;
  icon: React.ReactNode;
  label: string;
  onDragStart: (event: React.DragEvent) => void;
}

const LibraryItem: React.FC<LibraryItemProps> = ({ type, icon, label, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        "flex items-center gap-2 p-3 rounded-md border border-border",
        "hover:border-primary/50 hover:bg-primary/5 cursor-grab transition-all duration-200",
        "active:cursor-grabbing"
      )}
    >
      <div className="w-5 h-5 flex items-center justify-center text-primary">
        {icon}
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );
};

export default ElementLibrary;
