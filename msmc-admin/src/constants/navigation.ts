import {
  Home,
  Users,
  FileText,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  Newspaper,
  Settings,
  Star,
} from "lucide-react";

export const NAVIGATION = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },

  {
    title: "Users",
    href: "/users",
    icon: Users,
  },

  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
  },

  {
    title: "Education & Scholarship",
    href: "/education",
    icon: GraduationCap,
  },

  {
    title: "Initiatives",
    href: "/initiatives",
    icon: Lightbulb,
  },

  {
    title: "Complaints",
    href: "/complaints",
    icon: MessageSquare,
  },

  {
    title: "News",
    href: "/news",
    icon: Newspaper,
  },

  {
    title: "Feedback",
    href: "/feedback",
    icon: Star,
  },

  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
] as const;
