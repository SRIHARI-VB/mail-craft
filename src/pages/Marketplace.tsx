import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmailTemplate } from "@/types/editor";
import { Search, Filter, Download, Eye, Heart, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for templates
const mockTemplates: EmailTemplate[] = [
  {
    id: "template-1",
    name: "Welcome Email",
    thumbnail: "https://placehold.co/600x400/e9ecef/495057?text=Welcome+Email",
    category: "onboarding",
    elements: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      author: "MailCraft",
      description: "A clean, modern welcome email for new users",
      tags: ["welcome", "onboarding", "minimal"],
      price: 0,
      downloadCount: 1245
    }
  },
  {
    id: "template-2",
    name: "Newsletter",
    thumbnail: "https://placehold.co/600x400/e1f5fe/01579b?text=Newsletter",
    category: "newsletters",
    elements: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      author: "Design Studio",
      description: "Professional newsletter template with sections for articles",
      tags: ["newsletter", "editorial", "professional"],
      price: 19.99,
      downloadCount: 876
    }
  },
  {
    id: "template-3",
    name: "Product Announcement",
    thumbnail: "https://placehold.co/600x400/e8f5e9/2e7d32?text=Product+Launch",
    category: "marketing",
    elements: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      author: "Marketing Pros",
      description: "Announce your new product or feature with this eye-catching template",
      tags: ["product", "announcement", "marketing"],
      price: 14.99,
      downloadCount: 543
    }
  },
  {
    id: "template-4",
    name: "Abandoned Cart",
    thumbnail: "https://placehold.co/600x400/fff3e0/e65100?text=Abandoned+Cart",
    category: "ecommerce",
    elements: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      author: "EcommerceHQ",
      description: "Recovery email for abandoned shopping carts",
      tags: ["ecommerce", "recovery", "sales"],
      price: 24.99,
      downloadCount: 921
    }
  },
  {
    id: "template-5",
    name: "Thank You Email",
    thumbnail: "https://placehold.co/600x400/f3e5f5/6a1b9a?text=Thank+You",
    category: "transactional",
    elements: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      author: "MailCraft",
      description: "Show appreciation to your customers with this elegant template",
      tags: ["thanks", "appreciation", "elegant"],
      price: 0,
      downloadCount: 1578
    }
  },
  {
    id: "template-6",
    name: "Sale Promotion",
    thumbnail: "https://placehold.co/600x400/fce4ec/c2185b?text=Sale+Promotion",
    category: "marketing",
    elements: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      author: "Marketing Pros",
      description: "Drive sales with this high-conversion promotion template",
      tags: ["sale", "discount", "promotion"],
      price: 19.99,
      downloadCount: 732
    }
  }
];

const Marketplace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.metadata?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === "all" || 
      template.category === selectedCategory ||
      (selectedCategory === "free" && template.metadata?.price === 0);
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="p-6 overflow-auto h-screen">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight mb-1">Template Marketplace</h1>
              <p className="text-muted-foreground">Find and purchase professional email templates</p>
            </div>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Sell Your Templates
            </Button>
          </div>
          
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search templates..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
          
          <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="free">Free</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
              <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
              <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
              <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
              <TabsTrigger value="transactional">Transactional</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedCategory} className="mt-0">
              {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-muted-foreground mb-2">No templates found matching your criteria</div>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}>
                    Clear filters
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

interface TemplateCardProps {
  template: EmailTemplate;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={template.thumbnail} 
          alt={template.name}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500",
            isHovered && "scale-105"
          )}
        />
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <Button variant="secondary" className="mb-2">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{template.name}</CardTitle>
          {template.metadata?.price === 0 ? (
            <Badge variant="secondary">Free</Badge>
          ) : (
            <Badge className="bg-primary">${template.metadata?.price.toFixed(2)}</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{template.metadata?.description}</p>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {template.metadata?.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs capitalize">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-2 flex items-center justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Download className="h-3 w-3 mr-1" />
          {template.metadata?.downloadCount}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Heart className="h-4 w-4" />
          </Button>
          <Button>
            {template.metadata?.price === 0 ? "Download" : "Buy Template"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Marketplace;
