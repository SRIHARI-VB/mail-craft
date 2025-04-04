import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { EmailElement, ElementType } from "@/types/editor";
import ElementToolbar from "./ElementToolbar";
import { ImageDown, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  // Correctly declare draggedElement state at the beginning
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [draggedOverContainerId, setDraggedOverContainerId] = useState<
    string | null
  >(null);
  const [draggedOverColumnIndex, setDraggedOverColumnIndex] = useState<
    number | null
  >(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Add state for tooltip display
  const [tooltip, setTooltip] = useState<{
    text: string;
    position: { x: number; y: number };
  } | null>(null);

  // Add state for drag position indication
  const [dragPosition, setDragPosition] = useState<"top" | "bottom" | null>(
    null
  );
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);
  const [dragHorizontalPosition, setDragHorizontalPosition] = useState<
    "left" | "center" | "right" | null
  >(null);

  // Add state for column hover detection
  const [hoveredColumn, setHoveredColumn] = useState<{
    containerId: string;
    columnIndex: number;
  } | null>(null);

  // Add state for column selection
  const [selectedColumn, setSelectedColumn] = useState<{
    containerId: string;
    columnIndex: number;
  } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    try {
      setIsDraggingOver(false);
      setIsDragging(false);
      // Reset drag position indicators
      setDragPosition(null);
      setDragTargetId(null);
      setTooltip(null);

      // Check if this is an existing element being moved
      const draggedElementId = e.dataTransfer.getData(
        "application/mailcraft-element-id"
      );

      if (draggedElementId) {
        // Handle moving an existing element to the main canvas
        handleElementMove(draggedElementId, null);
        setDraggedElement(null);
        return;
      }

      // Handle dropping a new element
      const elementType = e.dataTransfer.getData(
        "application/mailcraft-element"
      ) as ElementType;

      if (!elementType) {
        toast.error("No element type data found");
        return;
      }

      const newElement: EmailElement = {
        id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: elementType,
        content: getDefaultContent(elementType),
        style: getDefaultStyle(elementType),
      };

      onUpdateElements([...elements, newElement]);
      onSelectElement(newElement.id);

      toast.success(`Added ${elementType} element`);
    } catch (error) {
      console.error("Error in handleDrop:", error);
      toast.error(
        "Something went wrong when adding the element. Please try again."
      );
    }
  };

  const getDefaultContent = (type: ElementType): string => {
    switch (type) {
      case "heading":
        return "Your Heading";
      case "text":
        return "Enter your text here. This is a paragraph that you can edit.";
      case "button":
        return "Click Me";
      case "callout":
        return "Important information that stands out";
      case "social-icons":
        return "Social Media";
      default:
        return "";
    }
  };

  const getDefaultStyle = (type: ElementType): Record<string, string> => {
    switch (type) {
      case "heading":
        return {
          fontSize: "24px",
          fontWeight: "bold",
          color: "#333333",
          padding: "10px 0",
          fontFamily: "Arial, sans-serif",
        };
      case "text":
        return {
          fontSize: "16px",
          color: "#666666",
          lineHeight: "1.5",
          padding: "10px 0",
          fontFamily: "Arial, sans-serif",
        };
      case "button":
        return {
          backgroundColor: "#3b82f6",
          color: "#ffffff",
          padding: "10px 20px",
          borderRadius: "4px",
          display: "inline-block",
          cursor: "pointer",
          fontFamily: "Arial, sans-serif",
          fontSize: "16px",
        };
      case "divider":
        return {
          borderTop: "1px solid #e5e7eb",
          margin: "20px 0",
        };
      case "spacer":
        return { height: "30px" };
      case "image":
        return {
          maxWidth: "100%",
          height: "auto",
          borderRadius: "0px",
        };
      case "container":
        return {
          padding: "20px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          width: "100%",
        };
      case "two-column":
        return {
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          width: "100%",
        };
      case "three-column":
        return {
          display: "flex",
          flexWrap: "wrap",
          gap: "15px",
          width: "100%",
        };
      case "card":
        return {
          padding: "20px",
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        };
      case "callout":
        return {
          padding: "15px",
          backgroundColor: "#f0f9ff",
          borderLeft: "4px solid #3b82f6",
          color: "#1e3a8a",
          fontSize: "16px",
          fontFamily: "Arial, sans-serif",
        };
      case "social-icons":
        return {
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          padding: "10px 0",
        };
      default:
        return {};
    }
  };

  // Fix the handleDeleteElement function to properly handle nested elements
  const handleDeleteElement = (id: string) => {
    try {
      console.log(`Deleting element with ID: ${id}`);

      // Recursive function to remove an element from the tree
      const removeElementById = (elements: EmailElement[]): EmailElement[] => {
        // First check if this element is at the current level
        const filteredElements = elements.filter((el) => el.id !== id);

        // If we removed an element, we're done
        if (filteredElements.length < elements.length) {
          console.log(`Element ${id} found and removed at top level`);
          return filteredElements;
        }

        // Otherwise, recursively check in children
        return filteredElements.map((el) => {
          if (el.children && el.children.length > 0) {
            // Check if the element is in the children
            const newChildren = removeElementById(el.children);

            // If we found and removed the element, the children array will be shorter
            if (newChildren.length < el.children.length) {
              console.log(
                `Element ${id} found and removed from container ${el.id}`
              );

              // Special handling for column layouts - maintain column structure
              if (["two-column", "three-column"].includes(el.type)) {
                const totalColumns = el.type === "two-column" ? 2 : 3;

                // Check if we need to add placeholders to maintain column structure
                if (
                  newChildren.length > 0 &&
                  newChildren.length % totalColumns !== 0
                ) {
                  console.log(
                    `Adding placeholders to maintain column structure in ${el.type}`
                  );

                  // Calculate how many placeholders we need
                  const remainder = newChildren.length % totalColumns;
                  const placeholdersNeeded = totalColumns - remainder;

                  for (let i = 0; i < placeholdersNeeded; i++) {
                    const placeholderId = `placeholder-${Date.now()}-${i}-${Math.random()
                      .toString(36)
                      .substr(2, 9)}`;
                    newChildren.push({
                      id: placeholderId,
                      type: "spacer",
                      content: "",
                      style: { display: "none", height: "0px" },
                    });
                  }
                }
              }

              return { ...el, children: newChildren };
            }

            // Element wasn't found, return the element with updated children
            return { ...el, children: newChildren };
          }

          // No children, return as is
          return el;
        });
      };

      // Apply the remove function and update the elements
      const newElements = removeElementById([...elements]);
      onUpdateElements(newElements);
      onSelectElement(null);
      toast.success("Element deleted");
    } catch (error) {
      console.error("Error deleting element:", error);
      toast.error("Failed to delete element. Please try again.");
    }
  };

  // Fix the handleDuplicateElement function to properly handle nested elements
  const handleDuplicateElement = (id: string) => {
    try {
      console.log(`Duplicating element with ID: ${id}`);

      // Recursive function to find and duplicate an element
      const findAndDuplicateElement = (
        elements: EmailElement[]
      ): { newElements: EmailElement[]; newElementId: string | null } => {
        // First check if the element is at this level
        const elementIndex = elements.findIndex((el) => el.id === id);

        if (elementIndex !== -1) {
          // Element found at this level
          const elementToDuplicate = elements[elementIndex];

          // Generate a unique ID for the duplicate element
          const newId = `element-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;

          // Create a deep copy of the element with the new ID
          const duplicatedElement: EmailElement = JSON.parse(
            JSON.stringify(elementToDuplicate)
          );
          duplicatedElement.id = newId;

          // Create new elements array with duplicated element inserted right after the original
          const newElements = [...elements];
          newElements.splice(elementIndex + 1, 0, duplicatedElement);

          return { newElements, newElementId: newId };
        }

        // Check in children of each element
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];

          if (element.children && element.children.length > 0) {
            // Try to find and duplicate in children
            const result = findAndDuplicateElement(element.children);

            if (result.newElementId) {
              // Element was found and duplicated in children
              // Create a new elements array with updated element
              const newElements = [...elements];
              newElements[i] = {
                ...element,
                children: result.newElements,
              };

              return { newElements, newElementId: result.newElementId };
            }
          }
        }

        // Element not found
        return { newElements: elements, newElementId: null };
      };

      // Apply the duplicate function to the elements
      const result = findAndDuplicateElement([...elements]);

      if (result.newElementId) {
        // Update elements and select the new element
        onUpdateElements(result.newElements);
        onSelectElement(result.newElementId);
        toast.success("Element duplicated");
      } else {
        toast.error("Could not find element to duplicate");
      }
    } catch (error) {
      console.error("Error duplicating element:", error);
      toast.error("Failed to duplicate element. Please try again.");
    }
  };

  // Update handleElementMove to correctly move elements between columns
  const handleElementMove = (
    draggedElementId: string,
    targetContainerId: string | null,
    columnIndex?: number
  ) => {
    // Early return if the element is being dropped onto itself
    if (draggedElementId === targetContainerId && !columnIndex) {
      return;
    }

    try {
      console.log(
        `Moving element ${draggedElementId} to ${
          targetContainerId || "root"
        } at column ${columnIndex || "N/A"}`
      );

      // Recursive function to find an element in the tree
      const findElementInfo = (
        elems: EmailElement[],
        elementId: string,
        parent: EmailElement | null = null
      ): {
        element: EmailElement;
        parent: EmailElement | null;
        index: number;
        columnIndex: number | null;
      } | null => {
        for (let i = 0; i < elems.length; i++) {
          if (elems[i].id === elementId) {
            let columnIndex = null;
            // If parent is a column container, determine which column the element is in
            if (
              parent &&
              ["two-column", "three-column"].includes(parent.type)
            ) {
              const totalColumns = parent.type === "two-column" ? 2 : 3;
              columnIndex = i % totalColumns;
            }

            return {
              element: elems[i],
              parent,
              index: i,
              columnIndex,
            };
          }

          // Check in children if available
          if (elems[i].children && elems[i].children.length > 0) {
            const foundInChildren = findElementInfo(
              elems[i].children,
              elementId,
              elems[i]
            );
            if (foundInChildren) {
              return foundInChildren;
            }
          }
        }
        return null;
      };

      // Find the element to move
      const elementInfo = findElementInfo(elements, draggedElementId);
      if (!elementInfo) {
        toast.error("Element not found");
        return;
      }

      // Find the target container if provided
      let targetContainer: EmailElement | null = null;
      if (targetContainerId) {
        const findContainer = (elems: EmailElement[]): EmailElement | null => {
          for (const el of elems) {
            if (el.id === targetContainerId) {
              return el;
            }
            if (el.children && el.children.length > 0) {
              const foundInChildren = findContainer(el.children);
              if (foundInChildren) {
                return foundInChildren;
              }
            }
          }
          return null;
        };

        targetContainer = findContainer(elements);
        if (!targetContainer) {
          toast.error("Target container not found");
          return;
        }
      }

      // Create a deep copy of the elements array
      let newElements = JSON.parse(JSON.stringify(elements)) as EmailElement[];

      // Helper function to remove an element from its parent
      const removeElement = (
        elements: EmailElement[],
        elementId: string
      ): EmailElement[] => {
        return elements.map((el) => {
          // If this element has children, check them
          if (el.children && el.children.length > 0) {
            // First check if the target is a direct child
            const childIndex = el.children.findIndex(
              (child) => child.id === elementId
            );

            if (childIndex !== -1) {
              // Found it as a direct child - remove it
              const newChildren = [...el.children];
              newChildren.splice(childIndex, 1);
              return { ...el, children: newChildren };
            } else {
              // Check deeper in the tree
              return { ...el, children: removeElement(el.children, elementId) };
            }
          }
          return el;
        });
      };

      // Remove the element from its current position
      if (elementInfo.parent) {
        // Element is in a parent
        newElements = removeElement(newElements, draggedElementId);
      } else {
        // Element is at top level
        newElements = newElements.filter((el) => el.id !== draggedElementId);
      }

      // Helper function to add element to container
      const addToContainer = (
        elements: EmailElement[],
        containerId: string | null,
        element: EmailElement,
        colIndex?: number
      ): EmailElement[] => {
        // Add to top level if no container
        if (!containerId) {
          return [...elements, element];
        }

        return elements.map((el) => {
          if (el.id === containerId) {
            // Handle column-based containers
            if (
              colIndex !== undefined &&
              ["two-column", "three-column"].includes(el.type)
            ) {
              const totalColumns = el.type === "two-column" ? 2 : 3;
              const children = [...(el.children || [])];

              // If the container is empty
              if (children.length === 0) {
                console.log(
                  "Container is empty, creating initial column structure"
                );
                const newChildren = [];

                for (let i = 0; i < totalColumns; i++) {
                  if (i === colIndex) {
                    newChildren.push(element);
                  } else {
                    // Add invisible placeholder elements for other columns
                    const placeholderId = `placeholder-${Date.now()}-${i}-${Math.random()
                      .toString(36)
                      .substr(2, 5)}`;
                    newChildren.push({
                      id: placeholderId,
                      type: "spacer",
                      content: "",
                      style: { display: "none", height: "0px" },
                    });
                  }
                }

                return { ...el, children: newChildren };
              }

              // Get elements in this column
              const columnElements = children.filter(
                (_, i) => i % totalColumns === colIndex
              );
              console.log(
                `Found ${columnElements.length} existing elements in column ${
                  colIndex + 1
                }`
              );

              if (columnElements.length === 0) {
                // If no elements in this column yet
                let insertPosition = colIndex;
                if (colIndex > 0) {
                  // Find where the element should go to maintain column structure
                  for (let i = 0; i <= children.length; i++) {
                    if (i % totalColumns === colIndex) {
                      insertPosition = i;
                      break;
                    }
                  }
                }

                console.log(
                  `Inserting at position ${insertPosition} to maintain column structure`
                );
                children.splice(insertPosition, 0, element);
              } else {
                // Find the last element in this column
                let lastIndex = -1;
                for (let i = children.length - 1; i >= 0; i--) {
                  if (i % totalColumns === colIndex) {
                    lastIndex = i;
                    break;
                  }
                }

                console.log(
                  `Last element in column ${
                    colIndex + 1
                  } is at index ${lastIndex}`
                );

                // Insert after the last element but maintaining column pattern
                let insertPosition = lastIndex + totalColumns;
                if (insertPosition >= children.length) {
                  // If beyond the end of the array, calculate correct position
                  const remainder = children.length % totalColumns;
                  if (remainder <= colIndex) {
                    insertPosition = children.length + (colIndex - remainder);
                  } else {
                    insertPosition =
                      children.length + (totalColumns - remainder + colIndex);
                  }
                }

                console.log(
                  `Inserting at position ${insertPosition} after last element in column`
                );
                children.splice(insertPosition, 0, element);
              }

              return { ...el, children };
            } else {
              // Regular container
              return {
                ...el,
                children: [...(el.children || []), element],
              };
            }
          }

          // Look in children
          if (el.children && el.children.length > 0) {
            return {
              ...el,
              children: addToContainer(
                el.children,
                containerId,
                element,
                colIndex
              ),
            };
          }

          return el;
        });
      };

      // Add the element to its new location
      newElements = addToContainer(
        newElements,
        targetContainerId,
        elementInfo.element,
        columnIndex
      );

      // Update the elements
      onUpdateElements(newElements);
      onSelectElement(draggedElementId);

      // Show success message
      if (targetContainerId && columnIndex !== undefined) {
        toast.success(`Moved element to column ${columnIndex + 1}`);
      } else {
        toast.success("Element moved");
      }
    } catch (error) {
      console.error("Error in handleElementMove:", error);
      toast.error(
        "Something went wrong when moving the element. Please try again."
      );
    }
  };

  const handleTextFormatting = (id: string, format: string) => {
    // Helper function to update an element's formatting
    const updateElementFormatting = (
      elements: EmailElement[]
    ): EmailElement[] => {
      return elements.map((el) => {
        if (el.id === id) {
          const newStyle = { ...el.style };

          switch (format) {
            case "bold":
              newStyle["font-weight"] =
                newStyle["font-weight"] === "bold" ? "normal" : "bold";
              break;
            case "italic":
              newStyle["font-style"] =
                newStyle["font-style"] === "italic" ? "normal" : "italic";
              break;
            case "underline":
              newStyle["text-decoration"] =
                newStyle["text-decoration"] === "underline"
                  ? "none"
                  : "underline";
              break;
            case "edit":
              // This will be handled separately
              return el;
          }

          return {
            ...el,
            style: newStyle,
          };
        }

        // Check children if this element has any
        if (el.children && el.children.length > 0) {
          return {
            ...el,
            children: updateElementFormatting(el.children),
          };
        }

        return el;
      });
    };

    // Special case for edit action
    if (format === "edit") {
      startEditingText(id);
      return;
    }

    const newElements = updateElementFormatting(elements);
    onUpdateElements(newElements);
    toast.success(`Applied ${format} formatting`);
  };

  const handleAlignment = (id: string, alignment: string) => {
    // Helper function to update an element's alignment property
    const updateElementAlignment = (
      elements: EmailElement[]
    ): EmailElement[] => {
      return elements.map((el) => {
        if (el.id === id) {
          return {
            ...el,
            style: {
              ...el.style,
              "text-align": alignment,
            },
          };
        }

        // Check children if this element has any
        if (el.children && el.children.length > 0) {
          return {
            ...el,
            children: updateElementAlignment(el.children),
          };
        }

        return el;
      });
    };

    const newElements = updateElementAlignment(elements);
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
    // Helper function to update text content recursively
    const updateElementText = (elements: EmailElement[]): EmailElement[] => {
      return elements.map((el) => {
        if (el.id === id) {
          return {
            ...el,
            content: value,
          };
        }

        // Check children if this element has any
        if (el.children && el.children.length > 0) {
          return {
            ...el,
            children: updateElementText(el.children),
          };
        }

        return el;
      });
    };

    const newElements = updateElementText(elements);
    onUpdateElements(newElements);
  };

  const handleImageUpload = (id: string) => {
    // Create a file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    // When a file is selected
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        document.body.removeChild(fileInput);
        return;
      }

      // Use FileReader to read the image
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;

        // Recursive function to update elements at any level of nesting
        const updateElements = (elements: EmailElement[]): EmailElement[] => {
          return elements.map((el) => {
            if (el.id === id) {
              return {
                ...el,
                content: imageDataUrl,
                style: {
                  ...el.style,
                  width: "auto",
                  "max-width": "100%",
                  height: "auto",
                },
              };
            }

            // If element has children, recursively search and update them
            if (el.children && el.children.length > 0) {
              return {
                ...el,
                children: updateElements(el.children),
              };
            }

            return el;
          });
        };

        // Apply the recursive update function
        const newElements = updateElements(elements);

        onUpdateElements(newElements);
        toast.success("Image uploaded");
        document.body.removeChild(fileInput);
      };

      reader.readAsDataURL(file);
    };

    // Trigger the file input
    fileInput.click();
  };

  const handleStyleChange = (id: string, property: string, value: string) => {
    // Helper function to update an element's style property
    const updateElementStyle = (elements: EmailElement[]): EmailElement[] => {
      return elements.map((el) => {
        if (el.id === id) {
          return {
            ...el,
            style: {
              ...el.style,
              [property]: value,
            },
          };
        }

        // Check children if this element has any
        if (el.children && el.children.length > 0) {
          return {
            ...el,
            children: updateElementStyle(el.children),
          };
        }

        return el;
      });
    };

    const newElements = updateElementStyle(elements);
    onUpdateElements(newElements);
  };

  // Add cross-browser compatibility check for certain CSS properties
  const isCssPropertySupported = (property: string): boolean => {
    // List of properties that might have browser compatibility issues
    const problematicProperties = [
      "display: flex",
      "display: grid",
      "backdrop-filter",
      "position: sticky",
      "position: fixed",
    ];

    // Simple check - in a real app you would use feature detection
    return !problematicProperties.includes(property);
  };

  // Handle element drag start with proper data transfer setup
  const handleElementDragStart = (e: React.DragEvent, elementId: string) => {
    e.stopPropagation();

    // Store the element ID being dragged
    setDraggedElement(elementId);
    setIsDragging(true);

    // Find element info
    let foundElement: EmailElement | null = null;

    // Recursively find the element in the tree
    const findElement = (elements: EmailElement[]): boolean => {
      for (const el of elements) {
        if (el.id === elementId) {
          foundElement = el;
          return true;
        }
        if (el.children && el.children.length > 0) {
          if (findElement(el.children)) {
            return true;
          }
        }
      }
      return false;
    };

    findElement(elements);

    if (foundElement) {
      // Set data transfer with element type for compatibility with existing drop handlers
      // Important: Use setData BEFORE setDragImage for proper browser support
      e.dataTransfer.setData(
        "application/mailcraft-element",
        foundElement.type
      );
      e.dataTransfer.setData("application/mailcraft-element-id", elementId);

      // Set drag effect
      e.dataTransfer.effectAllowed = "move";

      // Create a ghost image that follows the cursor
      const ghostEl = document.createElement("div");
      ghostEl.classList.add(
        "bg-primary",
        "text-white",
        "px-2",
        "py-1",
        "rounded",
        "text-xs"
      );
      ghostEl.innerText = `Moving ${foundElement.type}`;
      document.body.appendChild(ghostEl);
      e.dataTransfer.setDragImage(ghostEl, 0, 0);

      // Remove the ghost element after a delay
      setTimeout(() => {
        document.body.removeChild(ghostEl);
      }, 0);
    }
  };

  // Add drag end handler to reset drag state
  const handleElementDragEnd = () => {
    setIsDragging(false);
    setDraggedElement(null);
  };

  // Enhanced container drag enter handler with better visual feedback
  const handleContainerDragEnter = (
    e: React.DragEvent,
    containerId: string,
    columnIndex?: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverContainerId(containerId);

    // Get the element type being dragged
    const draggedElementId = e.dataTransfer.getData(
      "application/mailcraft-element-id"
    );
    const isExistingElement = !!draggedElementId;
    const draggedElementType = e.dataTransfer.getData(
      "application/mailcraft-element"
    );

    // Get dimensions for tooltip positioning
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    // Set tooltip text based on whether it's a column or container
    if (columnIndex !== undefined) {
      setDraggedOverColumnIndex(columnIndex);

      // Set tooltip text for columns
      let columnText = isExistingElement
        ? `Move element to column ${columnIndex + 1}`
        : `Add ${draggedElementType} to column ${columnIndex + 1}`;

      if (columnIndex === 0)
        columnText = isExistingElement
          ? "Move to left column"
          : `Add to left column`;
      else if (columnIndex === 1) {
        const isMiddleColumn = (
          e.currentTarget as HTMLElement
        ).parentElement?.classList.contains("grid-cols-3");
        columnText = isExistingElement
          ? isMiddleColumn
            ? "Move to middle column"
            : "Move to right column"
          : isMiddleColumn
          ? `Add to middle column`
          : `Add to right column`;
      } else if (columnIndex === 2)
        columnText = isExistingElement
          ? "Move to right column"
          : `Add to right column`;

      setTooltip({
        text: columnText,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top + 20,
        },
      });

      // Flash the column to highlight it
      const column = e.currentTarget as HTMLElement;
      column.classList.add("animate-pulse");
      setTimeout(() => {
        column.classList.remove("animate-pulse");
      }, 300);
    } else {
      // Set tooltip for regular container
      setTooltip({
        text: isExistingElement
          ? "Move element to container"
          : `Add ${draggedElementType} to container`,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top + 20,
        },
      });
    }
  };

  // Enhanced container drag leave handler
  const handleContainerDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverContainerId(null);
    setDraggedOverColumnIndex(null);
    setTooltip(null);
  };

  // Enhanced column hover handlers
  const handleColumnMouseEnter = (
    e: React.MouseEvent,
    containerId: string,
    columnIndex: number
  ) => {
    e.stopPropagation();
    setHoveredColumn({ containerId, columnIndex });
  };

  const handleColumnMouseLeave = () => {
    setHoveredColumn(null);
  };

  // Enhanced column selection with visual feedback
  const handleColumnSelect = (
    e: React.MouseEvent,
    containerId: string,
    columnIndex: number
  ) => {
    e.stopPropagation();

    // Toggle selection - if already selected, deselect it
    if (
      selectedColumn?.containerId === containerId &&
      selectedColumn.columnIndex === columnIndex
    ) {
      setSelectedColumn(null);
    } else {
      setSelectedColumn({ containerId, columnIndex });
      // Deselect any currently selected element
      onSelectElement(null);

      // Show toast message indicating column selection
      const columnNumber = columnIndex + 1;
      toast.success(`Selected column ${columnNumber}`);
    }
  };

  // Improved element drag over handler to better detect positions
  const handleElementDragOver = (e: React.DragEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Get current target dimensions and position
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY;
    const x = e.clientX;

    // Improved vertical position detection with a smaller threshold near edges
    const topThreshold = rect.top + Math.min(rect.height * 0.2, 20); // 20% or 20px max
    const bottomThreshold = rect.bottom - Math.min(rect.height * 0.2, 20); // 20% or 20px max

    if (y < topThreshold) {
      setDragPosition("top");
      // Set tooltip for top position
      setTooltip({
        text: "Insert before",
        position: { x: rect.left + rect.width / 2, y: rect.top - 10 },
      });
    } else if (y > bottomThreshold) {
      setDragPosition("bottom");
      // Set tooltip for bottom position
      setTooltip({
        text: "Insert after",
        position: { x: rect.left + rect.width / 2, y: rect.bottom + 10 },
      });
    } else {
      setDragPosition(null);
      setTooltip(null);
    }

    // Horizontal position detection for wider elements (for column layouts)
    const horizontalThird = rect.width / 3;
    if (x < rect.left + horizontalThird) {
      setDragHorizontalPosition("left");
    } else if (x < rect.left + horizontalThird * 2) {
      setDragHorizontalPosition("center");
    } else {
      setDragHorizontalPosition("right");
    }

    setDragTargetId(elementId);
  };

  const handleElementDragLeave = (e: React.DragEvent) => {
    // Only clear states if we're actually leaving the element (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragPosition(null);
      setDragTargetId(null);
      setDragHorizontalPosition(null);
      setTooltip(null);
    }
  };

  // Enhanced function to handle position-based element drops with proper error handling
  const handleElementPositionDrop = (
    e: React.DragEvent,
    targetElementId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      console.log(`Position drop over element ${targetElementId}`);

      // Reset visual indicators
      setIsDragging(false);
      setDraggedOverContainerId(null);
      setDraggedOverColumnIndex(null);

      // Get the element type being dragged - handle both existing elements and new elements
      const draggedElementId = e.dataTransfer.getData(
        "application/mailcraft-element-id"
      );
      const elementType = e.dataTransfer.getData(
        "application/mailcraft-element"
      ) as ElementType;

      console.log("Drop data:", {
        draggedElementId,
        elementType,
        dragPosition,
      });

      // Save current position information before we reset it
      const currentDragPosition = dragPosition;

      // Reset states
      setDragPosition(null);
      setDragTargetId(null);
      setDragHorizontalPosition(null);
      setTooltip(null);

      // If no position indicator is active, treat this as a standard drop
      if (!currentDragPosition) {
        console.log("No drag position indicator, treating as standard drop");
        if (draggedElementId) {
          // Try to find the parent of the target element
          const findTargetParent = (
            elems: EmailElement[]
          ): { parent: EmailElement | null; index: number } | null => {
            for (const el of elems) {
              if (el.children && el.children.length > 0) {
                const childIndex = el.children.findIndex(
                  (child) => child.id === targetElementId
                );
                if (childIndex !== -1) {
                  return { parent: el, index: childIndex };
                }

                const nestedResult = findTargetParent(el.children);
                if (nestedResult) return nestedResult;
              }
            }
            return null;
          };

          const targetParentInfo = findTargetParent(elements);

          if (targetParentInfo) {
            // If we found a parent, use handleContainerDrop to drop into that container
            console.log(
              `Found parent container for target, forwarding to container drop handler`
            );
            handleContainerDrop(e, targetParentInfo.parent!.id);
          } else {
            // Otherwise drop at root level
            handleDrop(e);
          }
        } else if (elementType) {
          // Create a new element next to the target
          handleDrop(e);
        }
        return;
      }

      // If we're dropping an existing element
      if (draggedElementId) {
        console.log(
          `Moving existing element ${draggedElementId} with position ${currentDragPosition}`
        );

        // Find information about the target element
        const findElementInfo = (
          elems: EmailElement[],
          elementId: string,
          parentElement: EmailElement | null = null,
          parentPath: EmailElement[] = []
        ): {
          element: EmailElement;
          parent: EmailElement | null;
          parentPath: EmailElement[];
          index: number;
          columnIndex: number | null;
        } | null => {
          for (let i = 0; i < elems.length; i++) {
            if (elems[i].id === elementId) {
              // Calculate column index if parent is a column layout
              let colIndex = null;
              if (
                parentElement &&
                ["two-column", "three-column"].includes(parentElement.type)
              ) {
                const totalColumns =
                  parentElement.type === "two-column" ? 2 : 3;
                colIndex = i % totalColumns;
              }

              return {
                element: elems[i],
                parent: parentElement,
                parentPath: parentPath,
                index: i,
                columnIndex: colIndex,
              };
            }

            // Check in children
            if (elems[i].children && elems[i].children.length > 0) {
              const newPath = [...parentPath, elems[i]];
              const found = findElementInfo(
                elems[i].children,
                elementId,
                elems[i],
                newPath
              );
              if (found) return found;
            }
          }
          return null;
        };

        // Get info about target and dragged elements
        const targetInfo = findElementInfo(elements, targetElementId);

        if (!targetInfo) {
          console.error(`Target element ${targetElementId} not found`);
          toast.error("Target element not found");
          return;
        }

        console.log("Target info:", {
          parent: targetInfo.parent?.id || "root",
          index: targetInfo.index,
          columnIndex: targetInfo.columnIndex,
        });

        // Either get the existing element or create a new one
        let elementToInsert: EmailElement;
        let shouldRemoveOriginal = false;

        if (draggedElementId) {
          // Find the dragged element
          const draggedInfo = findElementInfo(elements, draggedElementId);

          if (!draggedInfo) {
            console.error(`Dragged element ${draggedElementId} not found`);
            toast.error("Could not find the element being moved");
            return;
          }

          elementToInsert = JSON.parse(JSON.stringify(draggedInfo.element));
          shouldRemoveOriginal = true;

          console.log("Dragged element info:", {
            parent: draggedInfo.parent?.id || "root",
            index: draggedInfo.index,
            columnIndex: draggedInfo.columnIndex,
          });
        } else if (elementType) {
          // Create a new element of the specified type
          const uniqueId = `element-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;
          elementToInsert = {
            id: uniqueId,
            type: elementType,
            content: getDefaultContent(elementType),
            style: getDefaultStyle(elementType),
          };
        } else {
          console.error("No element to insert");
          toast.error("No element data available");
          return;
        }

        // Deep clone the elements array to avoid mutation issues
        let newElements = JSON.parse(
          JSON.stringify(elements)
        ) as EmailElement[];

        // If we need to remove the original element first
        if (shouldRemoveOriginal) {
          const removeElement = (
            elems: EmailElement[],
            elementId: string
          ): EmailElement[] => {
            return elems.map((el) => {
              if (el.children && el.children.length > 0) {
                // Check if this element has the target as a direct child
                const childIndex = el.children.findIndex(
                  (child) => child.id === elementId
                );

                if (childIndex !== -1) {
                  // Found as direct child - remove it
                  const newChildren = [...el.children];
                  newChildren.splice(childIndex, 1);
                  return { ...el, children: newChildren };
                }

                // Check deeper
                return {
                  ...el,
                  children: removeElement(el.children, elementId),
                };
              }
              return el;
            });
          };

          // Remove from top level if not in a parent
          if (!findElementInfo(newElements, draggedElementId)?.parent) {
            newElements = newElements.filter(
              (el) => el.id !== draggedElementId
            );
          } else {
            // Otherwise remove from wherever it is in the tree
            newElements = removeElement(newElements, draggedElementId);
          }
        }

        // Function to insert the element at the target position
        const insertElementAtPosition = (
          elems: EmailElement[],
          targetId: string,
          elementToInsert: EmailElement,
          position: "top" | "bottom"
        ): EmailElement[] => {
          return elems.map((el) => {
            // If this is the target element
            if (el.id === targetId) {
              // Top-level insertion - will be handled outside
              return el;
            }

            // Check if this element has the target as a direct child
            if (el.children && el.children.length > 0) {
              const targetIndex = el.children.findIndex(
                (child) => child.id === targetId
              );

              if (targetIndex !== -1) {
                // Found the target in this element's children
                const newChildren = [...el.children];

                // If this is a column-based container, ensure we maintain column structure
                if (["two-column", "three-column"].includes(el.type)) {
                  const totalColumns = el.type === "two-column" ? 2 : 3;
                  const targetColIndex = targetIndex % totalColumns;

                  // Calculate insertion position that maintains column alignment
                  let insertPosition =
                    position === "top" ? targetIndex : targetIndex + 1;

                  // Ensure the inserted element stays in the same column
                  if (insertPosition % totalColumns !== targetColIndex) {
                    // If inserting at bottom and it would change column, adjust to keep in same column
                    if (position === "bottom") {
                      // Find next position in the same column
                      for (
                        let i = insertPosition;
                        i < newChildren.length + totalColumns;
                        i++
                      ) {
                        if (i % totalColumns === targetColIndex) {
                          insertPosition = i;
                          break;
                        }
                      }
                    }
                  }

                  console.log(
                    `Inserting at position ${insertPosition} in column-based container`
                  );
                  newChildren.splice(insertPosition, 0, elementToInsert);
                } else {
                  // Regular container - simply insert before or after
                  const insertPosition =
                    position === "top" ? targetIndex : targetIndex + 1;
                  console.log(
                    `Inserting at position ${insertPosition} in regular container`
                  );
                  newChildren.splice(insertPosition, 0, elementToInsert);
                }

                return { ...el, children: newChildren };
              }

              // Not a direct child, check deeper
              return {
                ...el,
                children: insertElementAtPosition(
                  el.children,
                  targetId,
                  elementToInsert,
                  position
                ),
              };
            }

            return el;
          });
        };

        // Insert logic varies based on whether target is top-level or nested
        if (targetInfo.parent) {
          // Target is a child of another element
          console.log(`Target is nested, inserting at ${currentDragPosition}`);
          newElements = insertElementAtPosition(
            newElements,
            targetElementId,
            elementToInsert,
            currentDragPosition
          );
        } else {
          // Target is at top level
          const targetIndex = newElements.findIndex(
            (el) => el.id === targetElementId
          );
          if (targetIndex !== -1) {
            const insertPosition =
              currentDragPosition === "top" ? targetIndex : targetIndex + 1;
            console.log(
              `Target is at top level, inserting at position ${insertPosition}`
            );
            newElements.splice(insertPosition, 0, elementToInsert);
          } else {
            console.error("Could not find target element in top level");
            toast.error("Error positioning element");
            return;
          }
        }

        // Update the elements
        onUpdateElements(newElements);

        // Select the inserted element
        onSelectElement(elementToInsert.id);

        toast.success(`Element inserted ${currentDragPosition} target`);
      } else if (elementType) {
        // Creating a new element and positioning it
        console.log(
          `Creating new ${elementType} element with position ${currentDragPosition}`
        );

        // Generate a unique ID
        const uniqueId = `element-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;

        // Create the new element
        const newElement: EmailElement = {
          id: uniqueId,
          type: elementType,
          content: getDefaultContent(elementType),
          style: getDefaultStyle(elementType),
        };

        // Similar logic as above, but for new elements
        let newElements = JSON.parse(
          JSON.stringify(elements)
        ) as EmailElement[];

        // Find target element info
        const findTargetInfo = (
          elems: EmailElement[],
          targetId: string,
          parent: EmailElement | null = null
        ): {
          element: EmailElement;
          parent: EmailElement | null;
          index: number;
        } | null => {
          for (let i = 0; i < elems.length; i++) {
            if (elems[i].id === targetId) {
              return { element: elems[i], parent, index: i };
            }

            if (elems[i].children && elems[i].children.length > 0) {
              const found = findTargetInfo(
                elems[i].children,
                targetId,
                elems[i]
              );
              if (found) return found;
            }
          }
          return null;
        };

        const targetInfo = findTargetInfo(elements, targetElementId);

        if (!targetInfo) {
          console.error(`Target element ${targetElementId} not found`);
          toast.error("Target element not found");
          return;
        }

        // Insert the element before or after the target
        if (targetInfo.parent) {
          // Target is nested in a parent container
          newElements = newElements.map((el) => {
            if (el.id === targetInfo.parent!.id) {
              const children = [...el.children!];
              const insertIndex =
                currentDragPosition === "top"
                  ? targetInfo.index
                  : targetInfo.index + 1;

              // Special handling for column-based containers
              if (["two-column", "three-column"].includes(el.type)) {
                const totalColumns = el.type === "two-column" ? 2 : 3;
                const columnIndex = targetInfo.index % totalColumns;

                // Ensure insert position maintains column structure
                let adjustedIndex = insertIndex;
                if (insertIndex % totalColumns !== columnIndex) {
                  // Find the next position in the same column
                  for (
                    let i = insertIndex;
                    i < children.length + totalColumns;
                    i++
                  ) {
                    if (i % totalColumns === columnIndex) {
                      adjustedIndex = i;
                      break;
                    }
                  }
                }

                children.splice(adjustedIndex, 0, newElement);
              } else {
                // Regular container
                children.splice(insertIndex, 0, newElement);
              }

              return { ...el, children };
            }

            // Check nested children
            if (el.children && el.children.length > 0) {
              return {
                ...el,
                children: el.children.map((child) => {
                  if (child.id === targetInfo.parent!.id) {
                    const newChildren = [...child.children!];
                    const insertIndex =
                      currentDragPosition === "top"
                        ? targetInfo.index
                        : targetInfo.index + 1;
                    newChildren.splice(insertIndex, 0, newElement);
                    return { ...child, children: newChildren };
                  }
                  return child;
                }),
              };
            }

            return el;
          });
        } else {
          // Target is at top level
          const targetIndex = newElements.findIndex(
            (el) => el.id === targetElementId
          );
          if (targetIndex !== -1) {
            const insertIndex =
              currentDragPosition === "top" ? targetIndex : targetIndex + 1;
            newElements.splice(insertIndex, 0, newElement);
          }
        }

        // Update elements and select the new one
        onUpdateElements(newElements);
        onSelectElement(newElement.id);

        toast.success(`Added ${elementType} ${currentDragPosition} target`);
      }

      // Reset dragged element state
      setDraggedElement(null);
    } catch (error) {
      console.error("Error in handleElementPositionDrop:", error);
      toast.error("Something went wrong with the drag operation");
      // Reset all states to be safe
      setDragPosition(null);
      setDragTargetId(null);
      setDragHorizontalPosition(null);
      setTooltip(null);
      setDraggedElement(null);
    }
  };

  // Update handleMoveElement to properly handle elements within columns and nested containers
  const handleMoveElement = (id: string, direction: "up" | "down") => {
    try {
      console.log(`Moving element ${id} ${direction}`);

      // Structure to track element location
      type ElementLocation = {
        element: EmailElement;
        parent: EmailElement | null;
        index: number;
        siblingElements: EmailElement[];
        columnIndex?: number;
        columnTotal?: number;
      };

      // Find the element and its context in the element tree
      const findElementLocation = (
        elements: EmailElement[],
        parent: EmailElement | null = null
      ): ElementLocation | null => {
        // Check if the element is at this level
        const elementIndex = elements.findIndex((el) => el.id === id);

        if (elementIndex !== -1) {
          // Found at this level
          let columnIndex: number | undefined;
          let columnTotal: number | undefined;

          // Determine column information if parent is a column layout
          if (parent && ["two-column", "three-column"].includes(parent.type)) {
            columnTotal = parent.type === "two-column" ? 2 : 3;
            columnIndex = elementIndex % columnTotal;
          }

          return {
            element: elements[elementIndex],
            parent,
            index: elementIndex,
            siblingElements: elements,
            columnIndex,
            columnTotal,
          };
        }

        // Not at this level, check children
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];

          if (element.children && element.children.length > 0) {
            const found = findElementLocation(element.children, element);
            if (found) return found;
          }
        }

        return null;
      };

      // Find the element location
      const location = findElementLocation(elements);

      if (!location) {
        toast.error("Element not found");
        return;
      }

      console.log("Element location:", {
        parent: location.parent?.id || "root",
        index: location.index,
        columnIndex: location.columnIndex,
        columnTotal: location.columnTotal,
      });

      // Create a copy of the elements array to modify
      let newElements = JSON.parse(JSON.stringify(elements)) as EmailElement[];

      // Extract moving information
      const { parent, index, siblingElements, columnIndex, columnTotal } =
        location;

      // If this is in a column-based container
      if (columnIndex !== undefined && columnTotal) {
        if (direction === "up") {
          // Move up in column
          // Find the previous element in the same column
          let targetIndex = -1;
          for (let i = index - 1; i >= 0; i--) {
            if (i % columnTotal === columnIndex) {
              targetIndex = i;
              break;
            }
          }

          if (targetIndex === -1) {
            toast.info("Already at the top of this column");
            return;
          }

          console.log(
            `Moving element from position ${index} to ${targetIndex} in column ${columnIndex}`
          );

          // Perform the move in the correct parent
          if (parent) {
            // Update the parent's children
            const updateParentChildren = (
              elements: EmailElement[]
            ): EmailElement[] => {
              return elements.map((el) => {
                if (el.id === parent.id) {
                  // This is the parent, swap the elements in its children
                  const newChildren = [...el.children!];
                  const temp = newChildren[index];
                  newChildren[index] = newChildren[targetIndex];
                  newChildren[targetIndex] = temp;
                  return { ...el, children: newChildren };
                }

                // Check in children
                if (el.children && el.children.length > 0) {
                  return { ...el, children: updateParentChildren(el.children) };
                }

                return el;
              });
            };

            newElements = updateParentChildren(newElements);
          } else {
            // Swap at top level
            const temp = newElements[index];
            newElements[index] = newElements[targetIndex];
            newElements[targetIndex] = temp;
          }
        } else {
          // Move down in column
          // Find the next element in the same column
          let targetIndex = -1;
          for (let i = index + 1; i < siblingElements.length; i++) {
            if (i % columnTotal === columnIndex) {
              targetIndex = i;
              break;
            }
          }

          if (targetIndex === -1) {
            toast.info("Already at the bottom of this column");
            return;
          }

          console.log(
            `Moving element from position ${index} to ${targetIndex} in column ${columnIndex}`
          );

          // Perform the move in the correct parent
          if (parent) {
            // Update the parent's children
            const updateParentChildren = (
              elements: EmailElement[]
            ): EmailElement[] => {
              return elements.map((el) => {
                if (el.id === parent.id) {
                  // This is the parent, swap the elements in its children
                  const newChildren = [...el.children!];
                  const temp = newChildren[index];
                  newChildren[index] = newChildren[targetIndex];
                  newChildren[targetIndex] = temp;
                  return { ...el, children: newChildren };
                }

                // Check in children
                if (el.children && el.children.length > 0) {
                  return { ...el, children: updateParentChildren(el.children) };
                }

                return el;
              });
            };

            newElements = updateParentChildren(newElements);
          } else {
            // Swap at top level
            const temp = newElements[index];
            newElements[index] = newElements[targetIndex];
            newElements[targetIndex] = temp;
          }
        }
      } else {
        // Regular element (not in a column-based container)
        if (direction === "up") {
          // Check if already at the top
          if (index === 0) {
            toast.info("Already at the top");
            return;
          }

          // Perform the move in the correct parent
          if (parent) {
            // Update the parent's children
            const updateParentChildren = (
              elements: EmailElement[]
            ): EmailElement[] => {
              return elements.map((el) => {
                if (el.id === parent.id) {
                  // This is the parent, swap the elements in its children
                  const newChildren = [...el.children!];
                  const temp = newChildren[index];
                  newChildren[index] = newChildren[index - 1];
                  newChildren[index - 1] = temp;
                  return { ...el, children: newChildren };
                }

                // Check in children
                if (el.children && el.children.length > 0) {
                  return { ...el, children: updateParentChildren(el.children) };
                }

                return el;
              });
            };

            newElements = updateParentChildren(newElements);
          } else {
            // Swap at top level
            const temp = newElements[index];
            newElements[index] = newElements[index - 1];
            newElements[index - 1] = temp;
          }
        } else {
          // Move down
          // Check if already at the bottom
          if (index === siblingElements.length - 1) {
            toast.info("Already at the bottom");
            return;
          }

          // Perform the move in the correct parent
          if (parent) {
            // Update the parent's children
            const updateParentChildren = (
              elements: EmailElement[]
            ): EmailElement[] => {
              return elements.map((el) => {
                if (el.id === parent.id) {
                  // This is the parent, swap the elements in its children
                  const newChildren = [...el.children!];
                  const temp = newChildren[index];
                  newChildren[index] = newChildren[index + 1];
                  newChildren[index + 1] = temp;
                  return { ...el, children: newChildren };
                }

                // Check in children
                if (el.children && el.children.length > 0) {
                  return { ...el, children: updateParentChildren(el.children) };
                }

                return el;
              });
            };

            newElements = updateParentChildren(newElements);
          } else {
            // Swap at top level
            const temp = newElements[index];
            newElements[index] = newElements[index + 1];
            newElements[index + 1] = temp;
          }
        }
      }

      // Update the elements
      onUpdateElements(newElements);
      toast.success(`Element moved ${direction}`);
    } catch (error) {
      console.error("Error moving element:", error);
      toast.error(`Failed to move element ${direction}. Please try again.`);
    }
  };

  const renderElement = (element: EmailElement) => {
    // Check if this element is selected
    const isSelected = selectedElement === element.id;

    // Top and bottom drag indicators
    const showTopDragIndicator =
      dragPosition === "top" && dragTargetId === element.id;
    const showBottomDragIndicator =
      dragPosition === "bottom" && dragTargetId === element.id;

    const elementClassName = `editor-element ${isSelected ? "selected" : ""}`;

    // Add back elementProps that's referenced in many places
    const isContainer = [
      "container",
      "two-column",
      "three-column",
      "card",
    ].includes(element.type);
    const isCurrentlyDraggedOver = draggedOverContainerId === element.id;

    // Add cross-browser compatibility check for this element's styles
    const safeStyles = { ...element.style };
    Object.entries(safeStyles).forEach(([property, value]) => {
      if (!isCssPropertySupported(`${property}: ${value}`)) {
        // Use fallback style or remove the property
        delete safeStyles[property];
      }
    });

    // Common props for all elements
    const elementProps = {
      id: element.id,
      className: cn(
        "relative p-2 transition-all duration-200 ease-in-out",
        isSelected
          ? "outline outline-2 outline-primary"
          : "outline-none hover:outline hover:outline-1 hover:outline-primary/30",
        isCurrentlyDraggedOver &&
          "bg-primary/10 outline outline-2 outline-primary"
      ),
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectElement(element.id);
      },
      style: safeStyles,
    };

    // Element content based on type
    let elementContent;
    switch (element.type) {
      case "heading":
        elementContent =
          isSelected && editingText === element.id ? (
            <textarea
              ref={textInputRef}
              className="w-full bg-transparent border-none focus:outline-none resize-none"
              value={element.content}
              onChange={(e) => handleTextChange(element.id, e.target.value)}
              onBlur={() => setEditingText(null)}
              style={safeStyles}
            />
          ) : (
            <h2
              {...elementProps}
              className="cursor-text relative"
              onDoubleClick={() => startEditingText(element.id)}
            >
              {element.content}
            </h2>
          );
        break;

      case "text":
        elementContent =
          isSelected && editingText === element.id ? (
            <textarea
              ref={textInputRef}
              className="w-full bg-transparent border-none focus:outline-none resize-none"
              value={element.content}
              onChange={(e) => handleTextChange(element.id, e.target.value)}
              onBlur={() => setEditingText(null)}
              style={safeStyles}
            />
          ) : (
            <p
              {...elementProps}
              className="cursor-text"
              onDoubleClick={() => startEditingText(element.id)}
            >
              {element.content}
            </p>
          );
        break;

      case "button":
        elementContent =
          isSelected && editingText === element.id ? (
            <input
              ref={inputRef}
              className="w-full bg-transparent border-none focus:outline-none text-center"
              value={element.content}
              onChange={(e) => handleTextChange(element.id, e.target.value)}
              onBlur={() => setEditingText(null)}
              style={safeStyles}
            />
          ) : (
            <button
              {...elementProps}
              className="cursor-text"
              onDoubleClick={() => startEditingText(element.id)}
            >
              {element.content}
            </button>
          );
        break;

      case "divider":
        elementContent = <hr {...elementProps} />;
        break;

      case "spacer":
        elementContent = (
          <div
            {...elementProps}
            className={cn(
              elementProps.className,
              "h-full w-full bg-muted/20 flex items-center justify-center"
            )}
          >
            <span className="text-xs text-muted-foreground">Spacer</span>
          </div>
        );
        break;

      case "image":
        elementContent = (
          <div {...elementProps}>
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
              <div
                className="flex flex-col items-center justify-center p-8 bg-muted/20"
                onClick={() => handleImageUpload(element.id)}
              >
                <Button variant="outline" size="sm">
                  <ImageDown className="mr-2 h-4 w-4" />
                  Add Image
                </Button>
              </div>
            )}
          </div>
        );
        break;

      case "container":
        elementContent = (
          <div
            {...elementProps}
            className={cn(
              elementProps.className,
              "border border-dashed border-muted-foreground/20"
            )}
          >
            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <span>📦</span> Container{" "}
              {selectedColumn?.containerId === element.id && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  Column {selectedColumn.columnIndex + 1} selected
                </span>
              )}
            </div>
            <div
              className={cn(
                "min-h-16 border border-dashed border-muted-foreground/20 p-4",
                isDraggingOver && "bg-primary/5",
                draggedOverContainerId === element.id && "bg-primary/5",
                element.children && element.children.length > 0
                  ? "bg-muted/5"
                  : "bg-muted/10"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDragEnter={(e) => handleContainerDragEnter(e, element.id)}
              onDragLeave={handleContainerDragLeave}
              onDrop={(e) => handleContainerDrop(e, element.id)}
            >
              {(!element.children || element.children.length === 0) && (
                <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
                  <ImageDown className="h-6 w-6 mb-2 opacity-40" />
                  <div className="text-xs text-center">
                    Drop elements here to nest them
                  </div>
                </div>
              )}
              {element.children?.map((child) => (
                <React.Fragment key={child.id}>
                  {renderElement(child)}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
        break;

      case "two-column":
        elementContent = (
          <div
            {...elementProps}
            className={cn(elementProps.className, "flex flex-col")}
          >
            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <span>⫴</span> Two Column Layout
              {selectedColumn?.containerId === element.id && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  Column {selectedColumn.columnIndex + 1} selected
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={cn(
                  "min-h-16 border border-dashed p-4 transition-colors duration-200",
                  draggedOverContainerId === element.id &&
                    draggedOverColumnIndex === 0 &&
                    "bg-primary/10 border-primary",
                  selectedColumn?.containerId === element.id &&
                    selectedColumn?.columnIndex === 0 &&
                    "outline outline-2 outline-blue-500",
                  hoveredColumn?.containerId === element.id &&
                    hoveredColumn?.columnIndex === 0 &&
                    !isDragging &&
                    "bg-secondary/50 border-primary/30"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragEnter={(e) => handleContainerDragEnter(e, element.id, 0)}
                onDragLeave={handleContainerDragLeave}
                onDrop={(e) => handleContainerDrop(e, element.id, 0)}
                onClick={(e) => handleColumnSelect(e, element.id, 0)}
                onMouseEnter={(e) => handleColumnMouseEnter(e, element.id, 0)}
                onMouseLeave={handleColumnMouseLeave}
              >
                {/* Column label with guide line */}
                <div className="text-xs text-muted-foreground mb-2 flex items-center border-b border-dashed border-primary/30 pb-1">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 inline-flex items-center justify-center mr-1">
                    1
                  </span>
                  Column 1
                </div>
                {element.children?.filter((_, i) => i % 2 === 0).length ===
                  0 && (
                  <div className="flex flex-col items-center justify-center h-20 text-muted-foreground border-2 border-dashed border-primary/20 rounded-md bg-primary/5">
                    <ImageDown className="h-6 w-6 mb-2 opacity-40" />
                    <div className="text-xs text-center">
                      Drop elements in this column
                    </div>
                  </div>
                )}
                {element.children
                  ?.filter((_, i) => i % 2 === 0)
                  .map((child) => (
                    <React.Fragment key={child.id}>
                      {renderElement(child)}
                    </React.Fragment>
                  ))}
              </div>
              <div
                className={cn(
                  "min-h-16 border border-dashed p-4 transition-colors duration-200",
                  draggedOverContainerId === element.id &&
                    draggedOverColumnIndex === 1 &&
                    "bg-primary/10 border-primary",
                  selectedColumn?.containerId === element.id &&
                    selectedColumn?.columnIndex === 1 &&
                    "outline outline-2 outline-blue-500",
                  hoveredColumn?.containerId === element.id &&
                    hoveredColumn?.columnIndex === 1 &&
                    !isDragging &&
                    "bg-secondary/50 border-primary/30"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragEnter={(e) => handleContainerDragEnter(e, element.id, 1)}
                onDragLeave={handleContainerDragLeave}
                onDrop={(e) => handleContainerDrop(e, element.id, 1)}
                onClick={(e) => handleColumnSelect(e, element.id, 1)}
                onMouseEnter={(e) => handleColumnMouseEnter(e, element.id, 1)}
                onMouseLeave={handleColumnMouseLeave}
              >
                {/* Column label with guide line */}
                <div className="text-xs text-muted-foreground mb-2 flex items-center border-b border-dashed border-primary/30 pb-1">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 inline-flex items-center justify-center mr-1">
                    2
                  </span>
                  Column 2
                </div>
                {element.children?.filter((_, i) => i % 2 === 1).length ===
                  0 && (
                  <div className="flex flex-col items-center justify-center h-20 text-muted-foreground border-2 border-dashed border-primary/20 rounded-md bg-primary/5">
                    <ImageDown className="h-6 w-6 mb-2 opacity-40" />
                    <div className="text-xs text-center">
                      Drop elements in this column
                    </div>
                  </div>
                )}
                {element.children
                  ?.filter((_, i) => i % 2 === 1)
                  .map((child) => (
                    <React.Fragment key={child.id}>
                      {renderElement(child)}
                    </React.Fragment>
                  ))}
              </div>
            </div>
          </div>
        );
        break;

      case "three-column":
        elementContent = (
          <div
            {...elementProps}
            className={cn(elementProps.className, "flex flex-col")}
          >
            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <span>⫶</span> Three Column Layout
              {selectedColumn?.containerId === element.id && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  Column {selectedColumn.columnIndex + 1} selected
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={cn(
                  "min-h-16 border border-dashed p-4 transition-colors duration-200",
                  draggedOverContainerId === element.id &&
                    draggedOverColumnIndex === 0 &&
                    "bg-primary/10 border-primary",
                  selectedColumn?.containerId === element.id &&
                    selectedColumn?.columnIndex === 0 &&
                    "outline outline-2 outline-blue-500",
                  hoveredColumn?.containerId === element.id &&
                    hoveredColumn?.columnIndex === 0 &&
                    !isDragging &&
                    "bg-secondary/50 border-primary/30"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragEnter={(e) => handleContainerDragEnter(e, element.id, 0)}
                onDragLeave={handleContainerDragLeave}
                onDrop={(e) => handleContainerDrop(e, element.id, 0)}
                onClick={(e) => handleColumnSelect(e, element.id, 0)}
                onMouseEnter={(e) => handleColumnMouseEnter(e, element.id, 0)}
                onMouseLeave={handleColumnMouseLeave}
              >
                {/* Column label with guide line */}
                <div className="text-xs text-muted-foreground mb-2 flex items-center border-b border-dashed border-primary/30 pb-1">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 inline-flex items-center justify-center mr-1">
                    1
                  </span>
                  Column 1
                </div>
                {element.children?.filter((_, i) => i % 3 === 0).length ===
                  0 && (
                  <div className="flex flex-col items-center justify-center h-20 text-muted-foreground border-2 border-dashed border-primary/20 rounded-md bg-primary/5">
                    <ImageDown className="h-6 w-6 mb-2 opacity-40" />
                    <div className="text-xs text-center">
                      Drop elements in this column
                    </div>
                  </div>
                )}
                {element.children
                  ?.filter((_, i) => i % 3 === 0)
                  .map((child) => (
                    <React.Fragment key={child.id}>
                      {renderElement(child)}
                    </React.Fragment>
                  ))}
              </div>
              <div
                className={cn(
                  "min-h-16 border border-dashed p-4 transition-colors duration-200",
                  draggedOverContainerId === element.id &&
                    draggedOverColumnIndex === 1 &&
                    "bg-primary/10 border-primary",
                  selectedColumn?.containerId === element.id &&
                    selectedColumn?.columnIndex === 1 &&
                    "outline outline-2 outline-blue-500",
                  hoveredColumn?.containerId === element.id &&
                    hoveredColumn?.columnIndex === 1 &&
                    !isDragging &&
                    "bg-secondary/50 border-primary/30"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragEnter={(e) => handleContainerDragEnter(e, element.id, 1)}
                onDragLeave={handleContainerDragLeave}
                onDrop={(e) => handleContainerDrop(e, element.id, 1)}
                onClick={(e) => handleColumnSelect(e, element.id, 1)}
                onMouseEnter={(e) => handleColumnMouseEnter(e, element.id, 1)}
                onMouseLeave={handleColumnMouseLeave}
              >
                {/* Column label with guide line */}
                <div className="text-xs text-muted-foreground mb-2 flex items-center border-b border-dashed border-primary/30 pb-1">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 inline-flex items-center justify-center mr-1">
                    2
                  </span>
                  Column 2
                </div>
                {element.children?.filter((_, i) => i % 3 === 1).length ===
                  0 && (
                  <div className="flex flex-col items-center justify-center h-20 text-muted-foreground border-2 border-dashed border-primary/20 rounded-md bg-primary/5">
                    <ImageDown className="h-6 w-6 mb-2 opacity-40" />
                    <div className="text-xs text-center">
                      Drop elements in this column
                    </div>
                  </div>
                )}
                {element.children
                  ?.filter((_, i) => i % 3 === 1)
                  .map((child) => (
                    <React.Fragment key={child.id}>
                      {renderElement(child)}
                    </React.Fragment>
                  ))}
              </div>
              <div
                className={cn(
                  "min-h-16 border border-dashed p-4 transition-colors duration-200",
                  draggedOverContainerId === element.id &&
                    draggedOverColumnIndex === 2 &&
                    "bg-primary/10 border-primary",
                  selectedColumn?.containerId === element.id &&
                    selectedColumn?.columnIndex === 2 &&
                    "outline outline-2 outline-blue-500",
                  hoveredColumn?.containerId === element.id &&
                    hoveredColumn?.columnIndex === 2 &&
                    !isDragging &&
                    "bg-secondary/50 border-primary/30"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragEnter={(e) => handleContainerDragEnter(e, element.id, 2)}
                onDragLeave={handleContainerDragLeave}
                onDrop={(e) => handleContainerDrop(e, element.id, 2)}
                onClick={(e) => handleColumnSelect(e, element.id, 2)}
                onMouseEnter={(e) => handleColumnMouseEnter(e, element.id, 2)}
                onMouseLeave={handleColumnMouseLeave}
              >
                {/* Column label with guide line */}
                <div className="text-xs text-muted-foreground mb-2 flex items-center border-b border-dashed border-primary/30 pb-1">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 inline-flex items-center justify-center mr-1">
                    3
                  </span>
                  Column 3
                </div>
                {element.children?.filter((_, i) => i % 3 === 2).length ===
                  0 && (
                  <div className="flex flex-col items-center justify-center h-20 text-muted-foreground border-2 border-dashed border-primary/20 rounded-md bg-primary/5">
                    <ImageDown className="h-6 w-6 mb-2 opacity-40" />
                    <div className="text-xs text-center">
                      Drop elements in this column
                    </div>
                  </div>
                )}
                {element.children
                  ?.filter((_, i) => i % 3 === 2)
                  .map((child) => (
                    <React.Fragment key={child.id}>
                      {renderElement(child)}
                    </React.Fragment>
                  ))}
              </div>
            </div>
          </div>
        );
        break;

      case "card":
        elementContent = (
          <div
            {...elementProps}
            className={cn(elementProps.className, "border rounded-md")}
          >
            <div className="text-xs text-muted-foreground mb-2">Card</div>
            <div
              className={cn(
                "min-h-16 p-4",
                draggedOverContainerId === element.id &&
                  "bg-primary/5 border border-dashed border-muted-foreground/20"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDragEnter={(e) => handleContainerDragEnter(e, element.id)}
              onDragLeave={handleContainerDragLeave}
              onDrop={(e) => handleContainerDrop(e, element.id)}
            >
              {(!element.children || element.children.length === 0) && (
                <div className="text-xs text-muted-foreground text-center">
                  Drop elements here
                </div>
              )}
              {element.children?.map((childElement) => (
                <React.Fragment key={childElement.id}>
                  {renderElement(childElement)}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
        break;

      case "callout":
        elementContent = (
          <div
            {...elementProps}
            className={cn(elementProps.className, "border-l-4")}
          >
            {isSelected && editingText === element.id ? (
              <textarea
                ref={textInputRef}
                className="w-full bg-transparent border-none focus:outline-none resize-none"
                value={element.content}
                onChange={(e) => handleTextChange(element.id, e.target.value)}
                onBlur={() => setEditingText(null)}
                style={safeStyles}
              />
            ) : (
              <p
                className="cursor-text"
                onDoubleClick={() => startEditingText(element.id)}
              >
                {element.content}
              </p>
            )}
          </div>
        );
        break;

      case "social-icons":
        elementContent = (
          <div
            {...elementProps}
            className={cn(elementProps.className, "flex gap-4 justify-center")}
          >
            <a href="#" className="text-gray-600 hover:text-blue-500">
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
            <a href="#" className="text-gray-600 hover:text-blue-400">
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
            <a href="#" className="text-gray-600 hover:text-pink-500">
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
            <a href="#" className="text-gray-600 hover:text-blue-700">
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
        break;

      default:
        elementContent = null;
    }

    return (
      <>
        <div
          className={elementClassName}
          onClick={(e) => {
            e.stopPropagation();
            onSelectElement(element.id);
          }}
          style={element.style}
          data-element-id={element.id}
          data-element-type={element.type}
          onDragOver={(e) => handleElementDragOver(e, element.id)}
          onDragLeave={handleElementDragLeave}
          onDrop={(e) => handleElementPositionDrop(e, element.id)}
        >
          {/* Show the top insertion indicator when dragging */}
          {showTopDragIndicator && (
            <div className="insertion-indicator insertion-indicator-top">
              <div className="insertion-indicator-line"></div>
              <div className="insertion-indicator-circle"></div>
            </div>
          )}

          {/* Show drag handle when element is selected */}
          {isSelected && (
            <div
              className="absolute top-1 left-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity z-10"
              draggable
              onDragStart={(e) => handleElementDragStart(e, element.id)}
              onDragEnd={handleElementDragEnd}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </div>
          )}

          {/* Actual element content */}
          {elementContent}

          {/* Show bottom insertion indicator when dragging */}
          {showBottomDragIndicator && (
            <div className="insertion-indicator insertion-indicator-bottom">
              <div className="insertion-indicator-line"></div>
              <div className="insertion-indicator-circle"></div>
            </div>
          )}

          {/* Show the custom element toolbar when selected */}
          {isSelected && (
            <div className="absolute -bottom-14 left-0 w-full z-10">
              <ElementToolbar
                elementType={element.type}
                onDelete={() => handleDeleteElement(element.id)}
                onDuplicate={() => handleDuplicateElement(element.id)}
                onMoveUp={() => handleMoveElement(element.id, "up")}
                onMoveDown={() => handleMoveElement(element.id, "down")}
                onTextFormatting={(format) =>
                  handleTextFormatting(element.id, format)
                }
                onAlignment={(alignment) =>
                  handleAlignment(element.id, alignment)
                }
                onStyleChange={(property, value) =>
                  handleStyleChange(element.id, property, value)
                }
                currentStyles={element.style}
              />
            </div>
          )}
        </div>
      </>
    );
  };

  // Further improved container drop handler to fix issues with adding multiple elements
  const handleContainerDrop = (
    e: React.DragEvent,
    containerId: string,
    columnIndex?: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      console.log("Container drop event:", {
        containerId,
        columnIndex,
        selectedColumn,
        draggedElement,
      });

      // Reset all visual drag states
      setIsDraggingOver(false);
      setIsDragging(false);
      setDraggedOverContainerId(null);
      setDraggedOverColumnIndex(null);
      setDragPosition(null);
      setDragTargetId(null);
      setTooltip(null);

      // Get drag data
      // Try to get the ID from dataTransfer first, fallback to state if not available
      const dataId = e.dataTransfer.getData("application/mailcraft-element-id");
      const draggedElementId = dataId || draggedElement;
      const elementType = e.dataTransfer.getData(
        "application/mailcraft-element"
      ) as ElementType;

      console.log("Drop data:", {
        draggedElementId,
        elementType,
        dataId,
        draggedElementState: draggedElement,
      });

      // If a column is selected and we're dropping on the container directly,
      // use the selected column instead
      let effectiveColumnIndex = columnIndex;
      if (
        selectedColumn &&
        selectedColumn.containerId === containerId &&
        columnIndex === undefined
      ) {
        effectiveColumnIndex = selectedColumn.columnIndex;
        console.log(
          `Using selected column ${
            effectiveColumnIndex + 1
          } from selectedColumn state`
        );
        toast.success(`Using selected column ${effectiveColumnIndex + 1}`);
      }

      // Enhanced recursive container lookup function
      const findElementWithId = (
        elems: EmailElement[],
        id: string
      ): { element: EmailElement; path: EmailElement[] } | null => {
        for (const element of elems) {
          if (element.id === id) {
            return { element, path: [] };
          }

          if (element.children && element.children.length > 0) {
            const result = findElementWithId(element.children, id);
            if (result) {
              return {
                element: result.element,
                path: [element, ...result.path],
              };
            }
          }
        }
        return null;
      };

      // Find the container by ID anywhere in the element tree
      const containerInfo = findElementWithId(elements, containerId);

      if (!containerInfo) {
        console.error(
          `Container with ID ${containerId} not found in element tree`
        );
        toast.error(
          "Container not found. Please try again or refresh the page."
        );
        return;
      }

      const containerElement = containerInfo.element;
      console.log("Found container:", containerElement);

      // Create a deep copy of the elements array
      let newElements = JSON.parse(JSON.stringify(elements)) as EmailElement[];

      // Handle dropping an existing element (moving it)
      if (draggedElementId) {
        console.log(
          `Moving existing element ${draggedElementId} to container ${containerId} at column ${effectiveColumnIndex}`
        );

        // Find the existing element
        const draggedElementInfo = findElementWithId(
          elements,
          draggedElementId
        );

        if (!draggedElementInfo) {
          console.error(`Element ${draggedElementId} not found`);
          toast.error("Element not found. Please try again.");
          return;
        }

        const elementToMove = JSON.parse(
          JSON.stringify(draggedElementInfo.element)
        );

        // Create a function to remove the dragged element from its current location
        const removeElementById = (
          elements: EmailElement[],
          id: string
        ): EmailElement[] => {
          return elements.map((el) => {
            if (el.children && el.children.length > 0) {
              const childIndex = el.children.findIndex(
                (child) => child.id === id
              );

              if (childIndex !== -1) {
                // Found as direct child, remove it
                const newChildren = [...el.children];
                newChildren.splice(childIndex, 1);
                return { ...el, children: newChildren };
              }

              // Not a direct child, search deeper
              return { ...el, children: removeElementById(el.children, id) };
            }
            return el;
          });
        };

        // Remove the element from its current location
        newElements = removeElementById(newElements, draggedElementId);

        // For top-level elements that weren't caught by the removeElementById function
        newElements = newElements.filter((el) => el.id !== draggedElementId);

        // Now add the element to the target container (recursively)
        const addElementToContainer = (
          elements: EmailElement[],
          containerId: string,
          element: EmailElement,
          columnIndex?: number
        ): EmailElement[] => {
          return elements.map((el) => {
            if (el.id === containerId) {
              // This is our target container
              const children = [...(el.children || [])];

              // Check if this is a column-based container
              const isColumnLayout = ["two-column", "three-column"].includes(
                el.type
              );

              if (isColumnLayout && columnIndex !== undefined) {
                const totalColumns = el.type === "two-column" ? 2 : 3;

                if (children.length === 0) {
                  // Create the initial column structure if container is empty
                  const newChildren = [];
                  for (let i = 0; i < totalColumns; i++) {
                    if (i === columnIndex) {
                      newChildren.push(element);
                    } else {
                      // Add invisible placeholders for other columns
                      const placeholderId = `placeholder-${Date.now()}-${i}-${Math.random()
                        .toString(36)
                        .substr(2, 5)}`;
                      newChildren.push({
                        id: placeholderId,
                        type: "spacer",
                        content: "",
                        style: { display: "none", height: "0px" },
                      });
                    }
                  }
                  return { ...el, children: newChildren };
                }

                // Get all elements in this column by their index modulo totalColumns
                const columnElements = [];
                const columnIndices = [];

                // Find elements that belong to this column and their indices
                for (let i = 0; i < children.length; i++) {
                  if (i % totalColumns === columnIndex) {
                    columnElements.push(children[i]);
                    columnIndices.push(i);
                  }
                }

                console.log(
                  `Column ${columnIndex} elements:`,
                  columnElements.length,
                  "indices:",
                  columnIndices
                );

                if (columnElements.length === 0) {
                  // No elements in this column yet, place at first valid position for this column
                  let insertPosition = columnIndex;

                  // Make sure the position is valid and preserves column structure
                  while (
                    insertPosition < children.length &&
                    insertPosition % totalColumns !== columnIndex
                  ) {
                    insertPosition += 1;
                  }

                  console.log(
                    `Inserting first element at column ${columnIndex} at position ${insertPosition}`
                  );
                  children.splice(insertPosition, 0, element);
                } else {
                  // Find the correct position after the last element in this column
                  const lastColumnElementIndex =
                    columnIndices[columnIndices.length - 1];

                  // Insert exactly at one totalColumns distance after the last element
                  const insertPosition = lastColumnElementIndex + totalColumns;

                  // If that position would be beyond the array boundary
                  if (insertPosition >= children.length) {
                    // Use exact math to calculate the proper end position that maintains column structure
                    let properIndex = children.length;

                    // Adjust to ensure the column alignment is correct
                    while (properIndex % totalColumns !== columnIndex) {
                      properIndex++;
                    }

                    console.log(
                      `Inserting at end position ${properIndex} for column ${columnIndex}`
                    );
                    // If the proper position is beyond the current array, we need to add placeholder elements
                    while (children.length < properIndex) {
                      const currentPosition = children.length;
                      // Every position that isn't our target column gets a placeholder
                      if (currentPosition % totalColumns !== columnIndex) {
                        const placeholderId = `placeholder-${Date.now()}-${currentPosition}-${Math.random()
                          .toString(36)
                          .substr(2, 5)}`;
                        children.push({
                          id: placeholderId,
                          type: "spacer",
                          content: "",
                          style: { display: "none", height: "0px" },
                        });
                      } else {
                        // This is our target column position but we're not at the final position yet
                        const placeholderId = `placeholder-${Date.now()}-${currentPosition}-${Math.random()
                          .toString(36)
                          .substr(2, 5)}`;
                        children.push({
                          id: placeholderId,
                          type: "spacer",
                          content: "",
                          style: { display: "none", height: "0px" },
                        });
                      }
                    }
                    // Now add our actual element
                    children.push(element);
                  } else {
                    // Insert at the calculated position
                    console.log(
                      `Inserting at middle position ${insertPosition} for column ${columnIndex}`
                    );
                    children.splice(insertPosition, 0, element);
                  }
                }
              } else {
                // For regular containers, just append to the children array
                children.push(element);
              }

              return { ...el, children };
            }

            // Not our target container, but check children recursively
            if (el.children && el.children.length > 0) {
              return {
                ...el,
                children: addElementToContainer(
                  el.children,
                  containerId,
                  element,
                  columnIndex
                ),
              };
            }

            return el;
          });
        };

        // Add the element to the target container
        newElements = addElementToContainer(
          newElements,
          containerId,
          elementToMove,
          effectiveColumnIndex
        );

        // Update the elements and select the moved element
        onUpdateElements(newElements);
        onSelectElement(draggedElementId);

        // Show success message
        if (effectiveColumnIndex !== undefined) {
          toast.success(`Moved element to column ${effectiveColumnIndex + 1}`);
        } else {
          toast.success("Element moved to container");
        }

        // Reset state
        setDraggedElement(null);
        return;
      }

      // Otherwise, handle it as creating a new element
      if (!elementType) {
        console.error("No element type found in dataTransfer");
        toast.error("No element type data found. Please try again.");
        return;
      }

      // Generate a unique ID with timestamp and random string to prevent collisions
      const uniqueId = `element-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      console.log(`Creating new ${elementType} element with ID ${uniqueId}`);

      // Create the new element
      const newElement: EmailElement = {
        id: uniqueId,
        type: elementType,
        content: getDefaultContent(elementType),
        style: getDefaultStyle(elementType),
      };

      // Create a function to add the new element to the container (recursively)
      const addNewElementToContainer = (
        elements: EmailElement[],
        containerId: string,
        element: EmailElement,
        columnIndex?: number
      ): EmailElement[] => {
        return elements.map((el) => {
          if (el.id === containerId) {
            // This is our target container
            const children = [...(el.children || [])];

            // Check if this is a column-based container
            const isColumnLayout = ["two-column", "three-column"].includes(
              el.type
            );

            if (isColumnLayout && columnIndex !== undefined) {
              const totalColumns = el.type === "two-column" ? 2 : 3;

              if (children.length === 0) {
                // Create the initial column structure if container is empty
                const newChildren = [];
                for (let i = 0; i < totalColumns; i++) {
                  if (i === columnIndex) {
                    newChildren.push(element);
                  } else {
                    // Add invisible placeholders for other columns
                    const placeholderId = `placeholder-${Date.now()}-${i}-${Math.random()
                      .toString(36)
                      .substr(2, 5)}`;
                    newChildren.push({
                      id: placeholderId,
                      type: "spacer",
                      content: "",
                      style: { display: "none", height: "0px" },
                    });
                  }
                }
                return { ...el, children: newChildren };
              }

              // Get all elements in this column by their index modulo totalColumns
              const columnElements = [];
              const columnIndices = [];

              // Find elements that belong to this column and their indices
              for (let i = 0; i < children.length; i++) {
                if (i % totalColumns === columnIndex) {
                  columnElements.push(children[i]);
                  columnIndices.push(i);
                }
              }

              console.log(
                `Column ${columnIndex} elements:`,
                columnElements.length,
                "indices:",
                columnIndices
              );

              if (columnElements.length === 0) {
                // No elements in this column yet, place at first valid position for this column
                let insertPosition = columnIndex;

                // Make sure the position is valid and preserves column structure
                while (
                  insertPosition < children.length &&
                  insertPosition % totalColumns !== columnIndex
                ) {
                  insertPosition += 1;
                }

                console.log(
                  `Inserting first element at column ${columnIndex} at position ${insertPosition}`
                );
                children.splice(insertPosition, 0, element);
              } else {
                // Find the correct position after the last element in this column
                const lastColumnElementIndex =
                  columnIndices[columnIndices.length - 1];

                // Insert exactly at one totalColumns distance after the last element
                const insertPosition = lastColumnElementIndex + totalColumns;

                // If that position would be beyond the array boundary
                if (insertPosition >= children.length) {
                  // Use exact math to calculate the proper end position that maintains column structure
                  let properIndex = children.length;

                  // Adjust to ensure the column alignment is correct
                  while (properIndex % totalColumns !== columnIndex) {
                    properIndex++;
                  }

                  console.log(
                    `Inserting at end position ${properIndex} for column ${columnIndex}`
                  );
                  // If the proper position is beyond the current array, we need to add placeholder elements
                  while (children.length < properIndex) {
                    const currentPosition = children.length;
                    // Every position that isn't our target column gets a placeholder
                    if (currentPosition % totalColumns !== columnIndex) {
                      const placeholderId = `placeholder-${Date.now()}-${currentPosition}-${Math.random()
                        .toString(36)
                        .substr(2, 5)}`;
                      children.push({
                        id: placeholderId,
                        type: "spacer",
                        content: "",
                        style: { display: "none", height: "0px" },
                      });
                    } else {
                      // This is our target column position but we're not at the final position yet
                      const placeholderId = `placeholder-${Date.now()}-${currentPosition}-${Math.random()
                        .toString(36)
                        .substr(2, 5)}`;
                      children.push({
                        id: placeholderId,
                        type: "spacer",
                        content: "",
                        style: { display: "none", height: "0px" },
                      });
                    }
                  }
                  // Now add our actual element
                  children.push(element);
                } else {
                  // Insert at the calculated position
                  console.log(
                    `Inserting at middle position ${insertPosition} for column ${columnIndex}`
                  );
                  children.splice(insertPosition, 0, element);
                }
              }
            } else {
              // For regular containers, just append to the children array
              children.push(element);
            }

            return { ...el, children };
          }

          // Not our target container, but check children recursively
          if (el.children && el.children.length > 0) {
            return {
              ...el,
              children: addNewElementToContainer(
                el.children,
                containerId,
                element,
                columnIndex
              ),
            };
          }

          return el;
        });
      };

      // Add the new element to the container
      newElements = addNewElementToContainer(
        newElements,
        containerId,
        newElement,
        effectiveColumnIndex
      );

      // Update the elements and select the new element
      onUpdateElements(newElements);
      onSelectElement(newElement.id);

      // Show success message
      if (effectiveColumnIndex !== undefined) {
        toast.success(
          `Added ${elementType} to column ${effectiveColumnIndex + 1}`
        );
      } else {
        toast.success(`Added ${elementType} to container`);
      }
    } catch (error) {
      console.error("Error in handleContainerDrop:", error);
      toast.error("Something went wrong adding the element. Please try again.");
    }
  };

  // Replace all instances of DragDropIcon in empty column placeholders
  const renderTwoColumnLayout = (element: EmailElement) => {
    return (
      <div className="flex flex-wrap mx-[-15px]">
        <div
          className={`w-1/2 px-[15px] ${
            selectedColumn?.containerId === element.id &&
            selectedColumn.columnIndex === 0
              ? "selected-column"
              : ""
          } ${
            isDraggingOver &&
            draggedOverContainerId === element.id &&
            draggedOverColumnIndex === 0
              ? "dragging-over"
              : ""
          }`}
          onMouseEnter={(e) => handleColumnMouseEnter(e, element.id, 0)}
          onMouseLeave={handleColumnMouseLeave}
          onClick={(e) => handleColumnSelect(e, element.id, 0)}
          onDragOver={(e) => handleContainerDragEnter(e, element.id, 0)}
          onDragLeave={(e) => handleContainerDragLeave(e)}
          onDrop={(e) => handleContainerDrop(e, element.id, 0)}
        >
          {element.children && element.children.length > 0 ? (
            element.children
              .filter((_, i) => i % 2 === 0)
              .map((childElement) => renderElement(childElement))
          ) : (
            <div className="column-placeholder">
              <ImageDown className="h-6 w-6 mb-2 opacity-40" />
              <p>Drop elements here</p>
            </div>
          )}
        </div>
        <div
          className={`w-1/2 px-[15px] ${
            selectedColumn?.containerId === element.id &&
            selectedColumn.columnIndex === 1
              ? "selected-column"
              : ""
          } ${
            isDraggingOver &&
            draggedOverContainerId === element.id &&
            draggedOverColumnIndex === 1
              ? "dragging-over"
              : ""
          }`}
          onMouseEnter={(e) => handleColumnMouseEnter(e, element.id, 1)}
          onMouseLeave={handleColumnMouseLeave}
          onClick={(e) => handleColumnSelect(e, element.id, 1)}
          onDragOver={(e) => handleContainerDragEnter(e, element.id, 1)}
          onDragLeave={(e) => handleContainerDragLeave(e)}
          onDrop={(e) => handleContainerDrop(e, element.id, 1)}
        >
          {element.children && element.children.length > 0 ? (
            element.children
              .filter((_, i) => i % 2 === 1)
              .map((childElement) => renderElement(childElement))
          ) : (
            <div className="column-placeholder">
              <ImageDown className="h-6 w-6 mb-2 opacity-40" />
              <p>Drop elements here</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderThreeColumnLayout = (element: EmailElement) => {
    return (
      <div className="flex flex-wrap mx-[-10px]">
        <div
          className={`w-1/3 px-[10px] ${
            selectedColumn?.containerId === element.id &&
            selectedColumn.columnIndex === 0
              ? "selected-column"
              : ""
          } ${
            isDraggingOver &&
            draggedOverContainerId === element.id &&
            draggedOverColumnIndex === 0
              ? "dragging-over"
              : ""
          }`}
          onMouseEnter={(e) => handleColumnMouseEnter(e, element.id, 0)}
          onMouseLeave={handleColumnMouseLeave}
          onClick={(e) => handleColumnSelect(e, element.id, 0)}
          onDragOver={(e) => handleContainerDragEnter(e, element.id, 0)}
          onDragLeave={(e) => handleContainerDragLeave(e)}
          onDrop={(e) => handleContainerDrop(e, element.id, 0)}
        >
          {element.children && element.children.length > 0 ? (
            element.children
              .filter((_, i) => i % 3 === 0)
              .map((childElement) => renderElement(childElement))
          ) : (
            <div className="column-placeholder">
              <ImageDown className="h-6 w-6 mb-2 opacity-40" />
              <p>Drop elements here</p>
            </div>
          )}
        </div>
        <div
          className={`w-1/3 px-[10px] ${
            selectedColumn?.containerId === element.id &&
            selectedColumn.columnIndex === 1
              ? "selected-column"
              : ""
          } ${
            isDraggingOver &&
            draggedOverContainerId === element.id &&
            draggedOverColumnIndex === 1
              ? "dragging-over"
              : ""
          }`}
          onMouseEnter={(e) => handleColumnMouseEnter(e, element.id, 1)}
          onMouseLeave={handleColumnMouseLeave}
          onClick={(e) => handleColumnSelect(e, element.id, 1)}
          onDragOver={(e) => handleContainerDragEnter(e, element.id, 1)}
          onDragLeave={(e) => handleContainerDragLeave(e)}
          onDrop={(e) => handleContainerDrop(e, element.id, 1)}
        >
          {element.children && element.children.length > 0 ? (
            element.children
              .filter((_, i) => i % 3 === 1)
              .map((childElement) => renderElement(childElement))
          ) : (
            <div className="column-placeholder">
              <ImageDown className="h-6 w-6 mb-2 opacity-40" />
              <p>Drop elements here</p>
            </div>
          )}
        </div>
        <div
          className={`w-1/3 px-[10px] ${
            selectedColumn?.containerId === element.id &&
            selectedColumn.columnIndex === 2
              ? "selected-column"
              : ""
          } ${
            isDraggingOver &&
            draggedOverContainerId === element.id &&
            draggedOverColumnIndex === 2
              ? "dragging-over"
              : ""
          }`}
          onMouseEnter={(e) => handleColumnMouseEnter(e, element.id, 2)}
          onMouseLeave={handleColumnMouseLeave}
          onClick={(e) => handleColumnSelect(e, element.id, 2)}
          onDragOver={(e) => handleContainerDragEnter(e, element.id, 2)}
          onDragLeave={(e) => handleContainerDragLeave(e)}
          onDrop={(e) => handleContainerDrop(e, element.id, 2)}
        >
          {element.children && element.children.length > 0 ? (
            element.children
              .filter((_, i) => i % 3 === 2)
              .map((childElement) => renderElement(childElement))
          ) : (
            <div className="column-placeholder">
              <ImageDown className="h-6 w-6 mb-2 opacity-40" />
              <p>Drop elements here</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Replace DragDropIcon in Canvas Drop Zone
  const renderEmptyCanvas = () => {
    return (
      <div
        className="editor-canvas-empty flex flex-col items-center justify-center py-20 text-center text-muted-foreground"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <ImageDown className="h-12 w-12 mb-4 opacity-20" />
        <h3 className="text-xl font-medium mb-2">Your email is empty</h3>
        <p className="max-w-sm mb-4">
          Drag and drop elements from the left sidebar to start building your
          email.
        </p>
      </div>
    );
  };

  // Add renderContainerWithEmptyState function if it doesn't exist
  const renderContainerWithEmptyState = (element: EmailElement) => {
    return (
      <div
        className={`p-4 border-2 border-dashed border-gray-300 rounded-md min-h-[100px] flex items-center justify-center ${
          draggedOverContainerId === element.id ? "bg-blue-50" : ""
        }`}
        onDragOver={(e) => handleContainerDragEnter(e, element.id)}
        onDragLeave={(e) => handleContainerDragLeave(e)}
        onDrop={(e) => handleContainerDrop(e, element.id)}
      >
        {element.children && element.children.length > 0 ? (
          <div className="w-full">
            {element.children.map((childElement) =>
              renderElement(childElement)
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <ImageDown className="h-6 w-6 mb-2 opacity-40" />
            <p>Drop elements here</p>
          </div>
        )}
      </div>
    );
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
        // If clicking the canvas directly (not a child element), deselect
        if (e.currentTarget === e.target) {
          onSelectElement(null);
        }
      }}
    >
      <div
        className="p-6 space-y-4 min-h-[600px]"
        onClick={(e) => {
          // Check if the click is directly on this container and not a child
          if (e.target === e.currentTarget) {
            onSelectElement(null);
          }
        }}
      >
        {elements.length === 0
          ? renderEmptyCanvas()
          : elements.map((element) => (
              <div key={element.id} className="relative">
                {renderElement(element)}
              </div>
            ))}
      </div>

      {/* Tooltip for drag position */}
      {tooltip && (
        <div
          className="fixed bg-black text-white text-xs px-2 py-1 rounded-md shadow-md pointer-events-none z-50"
          style={{
            top: `${tooltip.position.y - 25}px`,
            left: `${tooltip.position.x - 40}px`,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default EditorCanvas;
