import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmailElement } from "@/types/editor";
import { Laptop, Smartphone, RefreshCw, Maximize2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface EmailPreviewProps {
  elements: EmailElement[];
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ elements }) => {
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop"
  );
  const [previewProvider, setPreviewProvider] = useState("gmail");
  const [key, setKey] = useState(0); // Used to force refresh the preview

  // Refresh the preview
  const handleRefresh = () => {
    setKey((prev) => prev + 1);
    toast.success("Preview refreshed");
  };

  const renderEmailContent = (elements: EmailElement[]) => {
    if (!elements.length) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
          <Eye className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-center">
            No content to preview yet. Add elements to your email template.
          </p>
        </div>
      );
    }

    // Helper function to render nested elements
    const renderElement = (element: EmailElement) => {
      switch (element.type) {
        case "heading":
          return (
            <h2
              key={element.id}
              style={{
                fontSize: element.style?.["font-size"],
                fontWeight: element.style?.["font-weight"],
                fontStyle: element.style?.["font-style"],
                textDecoration: element.style?.["text-decoration"],
                color: element.style?.["color"],
                textAlign: (element.style?.["text-align"] as any) || "left",
                padding: element.style?.["padding"],
                fontFamily: element.style?.["font-family"],
                backgroundColor: element.style?.["background-color"],
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
                fontWeight: element.style?.["font-weight"],
                fontStyle: element.style?.["font-style"],
                textDecoration: element.style?.["text-decoration"],
                color: element.style?.["color"],
                lineHeight: element.style?.["line-height"],
                textAlign: (element.style?.["text-align"] as any) || "left",
                padding: element.style?.["padding"],
                fontFamily: element.style?.["font-family"],
                backgroundColor: element.style?.["background-color"],
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
                textAlign: (element.style?.["text-align"] as any) || "center",
                fontWeight: element.style?.["font-weight"],
                fontStyle: element.style?.["font-style"],
                textDecoration: element.style?.["text-decoration"],
                fontFamily: element.style?.["font-family"],
                fontSize: element.style?.["font-size"],
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
                margin: element.style?.["margin"],
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
              style={{
                textAlign: "center",
                backgroundColor: element.style?.["background-color"],
                padding: element.style?.["padding"],
              }}
            >
              {element.content ? (
                <img
                  src={element.content}
                  alt="Email content"
                  style={{
                    width: element.style?.["width"] || "auto",
                    height: element.style?.["height"] || "auto",
                    borderRadius: element.style?.["border-radius"] || "0px",
                    objectFit: "contain",
                    maxWidth: "100%",
                  }}
                  className="mx-auto"
                />
              ) : (
                <div className="bg-muted/20 aspect-video flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    Image placeholder
                  </span>
                </div>
              )}
            </div>
          );

        case "container":
          return (
            <div
              key={element.id}
              style={{
                padding: element.style?.["padding"],
                backgroundColor: element.style?.["background-color"],
                borderRadius: element.style?.["border-radius"],
                width: element.style?.["width"],
              }}
            >
              {element.children?.map((childElement) =>
                renderElement(childElement)
              )}
            </div>
          );

        case "two-column":
          return (
            <div
              key={element.id}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: element.style?.["gap"],
                backgroundColor: element.style?.["background-color"],
                padding: element.style?.["padding"],
                width: "100%",
              }}
            >
              <div
                style={{
                  width: "calc(50% - 10px)",
                  minWidth: "250px",
                  flex: "1 1 250px",
                }}
              >
                {element.children
                  ?.filter((_, i) => i % 2 === 0)
                  .map((childElement) => renderElement(childElement))}
              </div>
              <div
                style={{
                  width: "calc(50% - 10px)",
                  minWidth: "250px",
                  flex: "1 1 250px",
                }}
              >
                {element.children
                  ?.filter((_, i) => i % 2 === 1)
                  .map((childElement) => renderElement(childElement))}
              </div>
            </div>
          );

        case "three-column":
          return (
            <div
              key={element.id}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: element.style?.["gap"],
                backgroundColor: element.style?.["background-color"],
                padding: element.style?.["padding"],
                width: "100%",
              }}
            >
              <div
                style={{
                  width: "calc(33.333% - 10px)",
                  minWidth: "200px",
                  flex: "1 1 200px",
                }}
              >
                {element.children
                  ?.filter((_, i) => i % 3 === 0)
                  .map((childElement) => renderElement(childElement))}
              </div>
              <div
                style={{
                  width: "calc(33.333% - 10px)",
                  minWidth: "200px",
                  flex: "1 1 200px",
                }}
              >
                {element.children
                  ?.filter((_, i) => i % 3 === 1)
                  .map((childElement) => renderElement(childElement))}
              </div>
              <div
                style={{
                  width: "calc(33.333% - 10px)",
                  minWidth: "200px",
                  flex: "1 1 200px",
                }}
              >
                {element.children
                  ?.filter((_, i) => i % 3 === 2)
                  .map((childElement) => renderElement(childElement))}
              </div>
            </div>
          );

        case "card":
          return (
            <div
              key={element.id}
              style={{
                padding: element.style?.["padding"],
                backgroundColor: element.style?.["background-color"],
                border: element.style?.["border"],
                borderRadius: element.style?.["border-radius"],
                boxShadow: element.style?.["box-shadow"],
              }}
            >
              {element.children?.map((childElement) =>
                renderElement(childElement)
              )}
            </div>
          );

        case "callout":
          return (
            <div
              key={element.id}
              style={{
                padding: element.style?.["padding"],
                backgroundColor: element.style?.["background-color"],
                borderLeft: element.style?.["border-left"],
                color: element.style?.["color"],
                fontSize: element.style?.["font-size"],
                fontFamily: element.style?.["font-family"],
              }}
            >
              {element.content}
            </div>
          );

        case "social-icons":
          return (
            <div
              key={element.id}
              style={{
                display: "flex",
                gap: element.style?.["gap"],
                justifyContent: element.style?.["justify-content"],
                padding: element.style?.["padding"],
                backgroundColor: element.style?.["background-color"],
              }}
              className="text-center"
            >
              <a href="#" className="text-gray-600 mx-2">
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
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-600 mx-2">
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
                >
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-600 mx-2">
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
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="text-gray-600 mx-2">
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
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          );

        default:
          return null;
      }
    };

    // Render the actual elements in the preview
    return (
      <div className="p-4">
        {elements.map((element) => renderElement(element))}
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
            className={
              previewDevice === "desktop" ? "bg-primary/10 text-primary" : ""
            }
            title="Desktop preview"
          >
            <Laptop className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setPreviewDevice("mobile")}
            className={
              previewDevice === "mobile" ? "bg-primary/10 text-primary" : ""
            }
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
              <Button size="icon" variant="ghost" title="Fullscreen preview">
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
