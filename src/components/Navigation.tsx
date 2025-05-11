
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Search } from "lucide-react";

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center">
          <h1 className="text-2xl font-bold">
            Trail<span className="text-secondary">Study</span>
          </h1>
        </Link>

        <div className="flex items-center space-x-4">
          {user?.isAdmin && (
            <Button
              variant="ghost"
              className="text-primary-foreground hover:text-secondary"
              onClick={() => navigate("/admin")}
            >
              Admin Dashboard
            </Button>
          )}
          
          <Button
            variant="ghost"
            className="text-primary-foreground hover:text-secondary"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0 overflow-hidden border-2 border-secondary">
                <User className="h-4 w-4" />
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {user?.id}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
