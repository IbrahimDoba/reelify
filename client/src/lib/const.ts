import { FileText, HelpCircle, LayoutDashboard, Settings, Video } from "lucide-react";

export const data = {
    user: {
      name: "John Doe",
      email: "john@example.com",
      avatar: "/avatars/default.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
        isActive: true,
        items: [
          {
            title: "Overview",
            url: "/dashboard",
          },
          // {
          //   title: "Analytics",
          //   url: "/analytics",
          // },
        ],
      },
      {
        title: "Projects",
        url: "/projects",
        icon: Video,
        items: [
          {
            title: "All Projects",
            url: "/projects",
          },
          {
            title: "New",
            url: "/projects/new",
          },
          {
            title: "Templates",
            url: "/projects/templates",
          },
        ],
      },
    //   {
    //     title: "Media Library",
    //     url: "/media",
    //     icon: FileVideo,
    //     items: [
    //       {
    //         title: "Videos",
    //         url: "/media/videos",
    //       },
    //       {
    //         title: "Audio",
    //         url: "/media/audio",
    //       },
    //     ],
    //   },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        items: [
          {
            title: "Account",
            url: "/settings/account",
          },
          {
            title: "Billing",
            url: "/settings/billing",
          },
          {
            title: "Preferences",
            url: "/settings/preferences",
          },
        ],
      },
    ],
    projects: [
      {
        name: "Marketing Campaign",
        url: "/referrals",
        icon: FileText,
      },
      {
        name: "Tutorial Series",
        url: "/projects/tutorials",
        icon: HelpCircle,
      },
    ],
  };