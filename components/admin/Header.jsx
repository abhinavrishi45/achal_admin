"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Mail, Search, Menu } from "lucide-react";
import Image from "next/image";

export default function Header({ onMenuClick }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    try { localStorage.removeItem("isAdminLoggedIn"); } catch (err) { }
    router.push("/");
  }
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center space-x-4">
        <button onClick={() => onMenuClick && onMenuClick()} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md" aria-label="Open sidebar">
          <Menu className="w-5 h-5" />
        </button>
        {/* <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Achal.com..."
            className="pl-9 pr-4 py-2 bg-gray-100 border-none rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div> */}
      </div>

      <div className="flex items-center space-x-4">
        {/* <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Mail className="w-5 h-5" />
        </button> */}
        <div className="w-px h-6 bg-gray-200 mx-2"></div>
        <div ref={menuRef} className="relative">
          <button onClick={() => setOpen(!open)} className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <div className="w-12 h-8 bg-green-200 rounded-lg border border-green-300 overflow-hidden flex items-center justify-center">
              <span className="text-green-800 font-bold text-xs">Admin</span>
            </div>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20">
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
