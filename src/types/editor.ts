export type ElementType =
  | "text"
  | "heading"
  | "image"
  | "button"
  | "divider"
  | "spacer"
  | "container"
  | "two-column"
  | "three-column"
  | "card"
  | "callout"
  | "social-icons";

export interface EmailElement {
  id: string;
  type: ElementType;
  content?: string;
  attributes?: Record<string, any>;
  children?: EmailElement[];
  style?: Record<string, string>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  thumbnail?: string;
  category?: string;
  elements: EmailElement[];
  createdAt: string;
  updatedAt: string;
  metadata?: {
    author?: string;
    description?: string;
    tags?: string[];
    price?: number;
    downloadCount?: number;
  };
}
