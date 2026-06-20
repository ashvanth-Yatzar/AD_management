import { Outlet, NavLink } from "react-router-dom";
import { Megaphone, LayoutDashboard } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <Megaphone className="h-6 w-6 text-blue-400 mr-2" />
          <span className="font-bold text-sm tracking-wide uppercase">
            Ad Manager
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink
            to="/advertisements"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            Advertisements
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-slate-400">
            Advertisement Management System
          </p>
          <p className="text-xs text-slate-500">v1.0.0</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-border flex items-center px-6 shrink-0">
          <h1 className="text-lg font-semibold text-slate-800">
            Advertisement Management
          </h1>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
