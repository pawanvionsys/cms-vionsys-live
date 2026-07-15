'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Image,
  Search,
  Settings,
  LogOut,
  PenTool,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';

interface SidebarProps {
  user?: { name: string; email: string; role: string } | null;
}

export function CmsSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load initial collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('sidebar-collapsed', String(nextState));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/cms/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Grouped Menu Items
  const navigationGroups = [
    {
      title: 'Content',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Blog Posts', icon: FileText, path: '/blogs' },
        { label: 'Case Studies', icon: Briefcase, path: '/case-studies' },
      ]
    },
    {
      title: 'Assets',
      items: [
        { label: 'Media Library', icon: Image, path: '/media' },
      ]
    },
    {
      title: 'Tools',
      items: [
        { label: 'SEO Tools', icon: Search, path: '/seo-tools' },
      ]
    },
    {
      title: 'Config',
      items: [
        { label: 'Settings', icon: Settings, path: '/settings' },
      ]
    }
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.26, ease: [0.2, 0.8, 0.2, 1] }} // slow standard curve
      className="border-r border-slate-200 bg-white flex flex-col h-screen shrink-0 relative overflow-hidden select-none"
    >
      {/* Sidebar Header */}
      <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          {isCollapsed ? (
            <img src="/logo-icon.png" alt="Logo" className="w-8 h-8 object-contain shrink-0" />
          ) : (
            <img src="/logo-full.png" alt="Vionsys CMS" className="size-38 object-contain select-none" />
          )}
        </div>
        <button
          type="button"
          onClick={toggleCollapse}
          className="p-1.5 hover:bg-slate-50 active-press rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav groups */}
      <div className="flex-1 py-6 px-3 space-y-6 overflow-y-auto overflow-x-hidden">
        {navigationGroups.map(group => (
          <div key={group.title} className="space-y-1.5">
            {/* Group Label */}
            {!isCollapsed ? (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block">
                {group.title}
              </span>
            ) : (
              <div className="h-px bg-slate-100 my-2 mx-2" />
            )}

            {/* Group Items */}
            <div className="space-y-1">
              {group.items.map(item => {
                const isActive = pathname === item.path || pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.label}
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg relative group transition-colors active-press ${
                      isActive
                        ? 'text-brand-700'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {/* Active Sliding Indicator Background */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 bg-brand-50 border border-brand-100 rounded-lg -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    <item.icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Profile Footer */}
      {user && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">{user.name}</p>
                  <p className="text-[9px] text-slate-450 truncate">{user.email}</p>
                </div>
                <span className="px-1.5 py-0.5 rounded-sm bg-brand-100 text-brand-700 text-[8px] font-extrabold uppercase tracking-wider shrink-0">
                  {user.role}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg active-press transition-all shadow-2xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer"
                title={`${user.name} (${user.role})`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 hover:bg-slate-200 active-press rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </motion.aside>
  );
}

export default CmsSidebar;
