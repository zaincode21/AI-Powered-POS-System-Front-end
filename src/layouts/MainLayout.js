import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar: always visible on md+, togglable on mobile */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with hamburger for mobile */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white shadow z-20">
          <button
            className="text-2xl text-purple-700 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="7" x2="24" y2="7" /><line x1="4" y1="14" x2="24" y2="14" /><line x1="4" y1="21" x2="24" y2="21" /></svg>
          </button>
          <span className="font-bold text-lg text-purple-700">AI-Powered POS System</span>
        </header>
        <main className="flex-1 p-2 sm:p-4 md:p-6 w-full">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
