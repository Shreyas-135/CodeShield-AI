import type { FC, Dispatch, SetStateAction } from 'react';
import { Menu } from 'lucide-react';
import type { ActiveView } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from './logo';
import { SidebarNav } from './sidebar-nav';

const SidebarContent: FC<{
  activeView: ActiveView;
  setActiveView: Dispatch<SetStateAction<ActiveView>>;
}> = ({ activeView, setActiveView }) => (
  <div className="flex flex-col h-full text-foreground">
    <div className="p-4 border-b">
      <div className="flex items-center gap-3">
        <Logo />
        <h1 className="text-xl font-bold">CodeShield AI</h1>
      </div>
    </div>
    <div className="flex-1 p-4">
      <SidebarNav activeView={activeView} setActiveView={setActiveView} />
    </div>
    <div className="p-4 mt-auto border-t">
       <p className="text-xs text-muted-foreground">© 2024 CodeShield AI</p>
    </div>
  </div>
);

export const MainLayout: FC<{
  children: React.ReactNode;
  activeView: ActiveView;
  setActiveView: Dispatch<SetStateAction<ActiveView>>;
}> = ({ children, activeView, setActiveView }) => {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-card md:block">
        <SidebarContent activeView={activeView} setActiveView={setActiveView} />
      </aside>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-full max-w-sm bg-card">
              <SidebarContent activeView={activeView} setActiveView={setActiveView} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Logo />
            <h1 className="text-lg font-bold">CodeShield AI</h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background/90">
          {children}
        </main>
      </div>
    </div>
  );
};
