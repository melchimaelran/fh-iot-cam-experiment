import { useState } from "react";
import { NavLink } from "react-router";
import { Button } from "../ui/button";
import {
  Briefcase,
  Code2,
  Link2,
  ListVideo,
  Menu,
  MessageCircle,
  Settings,
  View,
  X,
} from "lucide-react";

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-card/80 backdrop-blur">
      {/* Top bar: title + social links */}
      <h1 className="flex flex-wrap items-center gap-4 px-4 pt-3 text-sm font-medium">
        <span>FH IOT CAM Experiment - By Melchimael</span>
        <span className="text-muted-foreground hidden sm:inline">|</span>
        <span className="hidden sm:flex items-center gap-4">
          <a
            href="https://github.com/melchimaelran/fh-iot-cam-experiment"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-primary"
            aria-label="GitHub"
          >
            <Code2 className="h-4 w-4" /> GitHub
          </a>
          <a
            href="https://wa.me/261387817393"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-primary"
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <a
            href="https://www.linkedin.com/in/melchimael-roeh-429ab6210/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-primary"
            aria-label="LinkedIn"
          >
            <Briefcase className="h-4 w-4" /> LinkedIn
          </a>
        </span>
      </h1>

      {/* Nav bar */}
      <div className="mx-auto flex justify-between items-center gap-2 px-4 py-3 border-b border-t mt-3">
        <div className="flex items-center gap-1 text-sm font-semibold">
          <View className="h-4 w-4" />
        </div>

        {/* Desktop nav links */}
        <div className="hidden sm:flex items-center justify-center gap-2 flex-1">
          <NavLink to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Link2 className="h-4 w-4" />
              Connect FH cameras
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

        {/* Spacer (desktop) */}
        <div className="hidden sm:block" />

        {/* Hamburger button (mobile) */}
        <button
          className="sm:hidden ml-auto p-1 rounded hover:bg-accent"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden flex flex-col gap-1 px-4 pb-3 border-b">
          <NavLink to="/" onClick={() => setMenuOpen(false)}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <Link2 className="h-4 w-4" />
              Connect FH cameras
            </Button>
          </NavLink>
          <NavLink to="/camera-list" onClick={() => setMenuOpen(false)}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <ListVideo className="h-4 w-4" />
              Camera list
            </Button>
          </NavLink>
          <NavLink to="/settings" onClick={() => setMenuOpen(false)}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </NavLink>
          {/* Social links in mobile menu */}
          <div className="flex flex-wrap gap-3 pt-2 text-sm border-t mt-1">
            <a
              href="https://github.com/melchimaelran/fh-iot-cam-experiment"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-primary"
              aria-label="GitHub"
            >
              <Code2 className="h-4 w-4" /> GitHub
            </a>
            <a
              href="https://wa.me/261387817393"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-primary"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href="https://www.linkedin.com/in/melchimael-roeh-429ab6210/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-primary"
              aria-label="LinkedIn"
            >
              <Briefcase className="h-4 w-4" /> LinkedIn
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
