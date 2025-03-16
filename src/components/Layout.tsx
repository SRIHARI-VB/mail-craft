import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Layers,
  ShoppingBag,
  Settings,
  Mail,
  PanelLeft,
  Menu,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavItemProps = {
  to: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

const NavItem = ({ to, icon, label, active, onClick }: NavItemProps) => {
  return (
    <Link to={to} onClick={onClick}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 font-normal",
          active && "bg-primary/10 text-primary"
        )}
      >
        {icon}
        <span>{label}</span>
      </Button>
    </Link>
  );
};

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const pathname = location.pathname;
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="flex items-center mb-6 px-2">
        <img src="/mail-craft-logo.png" className="w-6 h-6 text-primary mr-2" />
        <h1 className="text-xl font-semibold">MailCraft</h1>
      </div>
      <div className="space-y-1">
        <NavItem
          to="/"
          icon={<Layers className="w-5 h-5" />}
          label="Editor"
          active={pathname === "/"}
          onClick={isMobile ? () => setOpen(false) : undefined}
        />
        <NavItem
          to="/marketplace"
          icon={<ShoppingBag className="w-5 h-5" />}
          label="Marketplace"
          active={pathname === "/marketplace"}
          onClick={isMobile ? () => setOpen(false) : undefined}
        />
        <NavItem
          to="/settings"
          icon={<Settings className="w-5 h-5" />}
          label="Settings"
          active={pathname === "/settings"}
          onClick={isMobile ? () => setOpen(false) : undefined}
        />
      </div>
      <div className="mt-auto pt-4">
        <Separator className="my-4" />
        <div className="bg-secondary/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">
            Upgrade to Pro to access premium templates and advanced features.
          </p>
          <Button className="w-full" size="sm">
            Upgrade to Pro
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen overflow-hidden">
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="absolute top-4 left-4 z-50">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4 flex flex-col">
            <NavContent />
          </SheetContent>
        </Sheet>
      ) : (
        <div className="w-64 border-r border-border bg-card p-4 flex flex-col animate-fade-in">
          <NavContent />
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
