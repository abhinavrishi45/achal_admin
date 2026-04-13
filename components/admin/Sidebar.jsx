"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Briefcase,
  Settings,
  Info,
  FileText,
  BriefcaseBusiness,
  PenTool,
  ChevronDown,
  ChevronRight,
  Droplet,
  Truck,
  BatteryCharging,
  Car,
  Utensils,
  Users,
} from "lucide-react";

// import { getServices } from "@/utils/mockDb";

const ICONS = {
  Droplet, Truck, BatteryCharging, Car, Utensils, FileText, Settings, Briefcase, Info, BriefcaseBusiness, PenTool, Home, LayoutDashboard, Users
};

export default function Sidebar() {
  const pathname = usePathname();
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [dynamicServices, setDynamicServices] = useState([]);

  useEffect(() => {
    // Load dynamically created services from API
    const load = async () => {
      try {
        const response = await fetch("https://achal-backend-trial.tannis.in/api/services");
        if (response.ok) {
          const data = await response.json();
          setDynamicServices(Array.isArray(data) ? data : data.services || []);
        }
      } catch (error) {
        console.error("Sidebar failed to load services:", error);
      }
    };

    load();
    // Re-load on focus to ensure it's somewhat synced across navigation
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, [pathname]); // also reload when pathname changes

  const sidebarItems = [
    // { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Home Page", href: "/dashboard/front-page", icon: Home },
    { name: "Our Services", href: "/dashboard/services", icon: Briefcase },
    {
      name: "Service Pages",
      icon: Settings,
      children: dynamicServices.length > 0 ? dynamicServices.map(s => ({
        name: s.name,
        href: `/dashboard/service-pages/${s.slug}`,
        icon: ICONS[s.icon] || FileText
      })) : [
        { name: "No Services Yet", href: "/dashboard/services", icon: FileText }
      ],
    },
    { name: "About-Us", href: "/dashboard/about-us", icon: Info },
    { name: "Terms and Condition", href: "/dashboard/terms", icon: FileText },
    { name: "Careers", href: "/dashboard/careers", icon: BriefcaseBusiness },
    { name: "Applicants", href: "/dashboard/applicants", icon: Users },
    { name: "Blog", href: "/dashboard/blog", icon: PenTool },
    { name: "Quotes", href: "/dashboard/quotes", icon: FileText },
    { name: "FAQs", href: "/dashboard/faq", icon: Info },
  ];

  const toggleDropdown = (name) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <aside className="w-64 bg-[#1e2336] text-gray-300 flex flex-col sticky top-0 h-screen">
      <div className="p-6 flex items-center space-x-3">

        <span className="text-white text-xl font-bold tracking-wide">Achal</span>
      </div>

      <div className="mt-4 px-4 pb-6 flex-1 overflow-y-auto sidebar-scroll">
        <style>{`
          .sidebar-scroll::-webkit-scrollbar {
            width: 10px;
          }
          .sidebar-scroll::-webkit-scrollbar-track {
            background: rgba(30, 35, 54, 0.8);
            border-radius: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: rgba(100, 120, 160, 0.8);
            border-radius: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(150, 170, 210, 1);
          }
        `}</style>
        <p className="text-xs font-semibold text-gray-500 mb-4 px-2 tracking-wider">GENERAL</p>
        <ul className="space-y-1">
          {sidebarItems.map((item, index) => {
            const isActive = pathname === item.href;

            if (item.children) {
              const isChildActive = item.children.some(child => pathname === child.href);
              const isOpen = openDropdowns[item.name] || isChildActive;

              return (
                <li key={index}>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${isOpen ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {isOpen && (
                    <ul className="mt-1 ml-4 space-y-1 border-l border-gray-700 pl-2">
                      {item.children.map((child, idx) => {
                        const isChildLinkActive = pathname === child.href;
                        return (
                          <li key={idx}>
                            <Link
                              href={child.href}
                              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isChildLinkActive
                                ? "bg-orange-500/20 text-orange-400"
                                : "hover:bg-white/5 hover:text-white"
                                }`}
                            >
                              <child.icon className="w-4 h-4 shrink-0" />
                              <span className="font-medium text-sm truncate">{child.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                    ? "bg-[#29324c] border-l-4 border-orange-500 text-white"
                    : "hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-orange-500" : ""}`} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
