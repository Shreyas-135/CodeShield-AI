"use client";
import type { FC, Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import type { ActiveView } from '@/app/page';
import { Bug, Code, Mail, Bot, Share2, Atom } from 'lucide-react';

const navLinks: { view: ActiveView; icon: React.ReactNode; label: string }[] = [
  { view: 'scan', icon: <Code className="size-4" />, label: 'Vulnerability Scanner' },
  { view: 'guardian', icon: <Bot className="size-4" />, label: 'Prompt Guardian' },
  { view: 'quantum', icon: <Atom className="size-4" />, label: 'Quantum Readiness' },
  { view: 'malware', icon: <Bug className="size-4" />, label: 'Malware Detector' },
  { view: 'phishing', icon: <Mail className="size-4" />, label: 'Phishing Detector' },
  { view: 'api', icon: <Share2 className="size-4" />, label: 'API Integration' },
];

export const SidebarNav: FC<{
  activeView: ActiveView;
  setActiveView: Dispatch<SetStateAction<ActiveView>>;
}> = ({ activeView, setActiveView }) => (
    <nav className="space-y-2">
      {navLinks.map((link) => (
        <Button
            key={link.view}
            variant={activeView === link.view ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-2"
            onClick={() => setActiveView(link.view)}
        >
            {link.icon}
            {link.label}
        </Button>
      ))}
    </nav>
);
