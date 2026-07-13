import React from 'react';
import { getSession } from '../../../features/auth/auth-options';
import { CmsSidebar } from './CmsSidebar';
import { CmsTopbar } from './CmsTopbar';
import { PageTransitionWrapper } from './PageTransitionWrapper';

interface ShellProps {
  children: React.ReactNode;
}

export async function CmsShell({ children }: ShellProps) {
  const session = await getSession();

  return (
    <div className="h-screen overflow-hidden bg-slate-50/20 flex w-screen">
      {/* Dynamic Client Sidebar */}
      <CmsSidebar user={session} />

      {/* Main Column Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <CmsTopbar />
        
        {/* Scrollable Canvas area */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
          <PageTransitionWrapper>
            {children}
          </PageTransitionWrapper>
        </main>
      </div>
    </div>
  );
}

export default CmsShell;
