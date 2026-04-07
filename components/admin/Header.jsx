import { Bell, Mail, Search, Menu } from "lucide-react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center space-x-4">
        <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md">
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
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Mail className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-2"></div>
        <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <div className="w-8 h-8 bg-green-200 rounded-full border border-green-300 overflow-hidden flex items-center justify-center">
            <span className="text-green-800 font-bold text-xs">AR</span>
          </div>
        </button>
      </div>
    </header>
  );
}
