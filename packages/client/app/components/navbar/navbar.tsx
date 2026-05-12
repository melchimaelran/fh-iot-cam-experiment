import { NavLink } from "react-router";
import { Button } from "../ui/button";
import {
  Briefcase,
  Code2,
  Gamepad2,
  Link2,
  ListVideo,
  MessageCircle,
  Settings,
  View,
} from "lucide-react";

const Navbar: React.FC = () => {
  return (
    <nav className="w-full  bg-card/80 backdrop-blur">
      <h1 className="flex flex-wrap items-center gap-4 px-4 pt-3 text-sm font-medium  ">
        <span>FH IOT CAM Experiment - By Melchimael</span>
        <span className="text-muted-foreground">|</span>
        <a
          href="#"
          className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-primary"
          aria-label="GitHub"
        >
          <Code2 className="h-4 w-4" /> GitHub
        </a>
        <a
          href="#"
          className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-primary"
          aria-label="WhatsApp"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <a
          href="#"
          className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-primary"
          aria-label="LinkedIn"
        >
          <Briefcase className="h-4 w-4" /> LinkedIn
        </a>
        <a
          href="#"
          className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-primary"
          aria-label="Discord"
        >
          <Gamepad2 className="h-4 w-4" /> Discord
        </a>
      </h1>
      <div className="mx-auto flex justify-between items-center gap-2 px-4 py-3 border-b border-t mt-3">
        <div className="flex items-center gap-1 text-sm font-semibold">
          <View className="h-4 w-4" />
        </div>

        <div className="flex items-center justify-center gap-2 flex-1">
          <NavLink to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Link2 className="h-4 w-4" />
              Connect camera
            </Button>
          </NavLink>
          <NavLink to="/camera-list">
            <Button variant="ghost" size="sm" className="gap-2">
              <ListVideo className="h-4 w-4" />
              Camera list
            </Button>
          </NavLink>

          <NavLink to="/settings">
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </NavLink>
        </div>

        <div></div>
        <div />
      </div>
    </nav>
  );
};

export default Navbar;
