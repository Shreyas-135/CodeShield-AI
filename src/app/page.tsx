"use client";

import { useState } from 'react';
import type { FC } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { CodeScanner } from '@/components/dashboard/code-scanner';
import { MalwareDetector } from '@/components/dashboard/malware-detector';
import { PhishingDetector } from '@/components/dashboard/phishing-detector';
import { PromptGuardian } from '@/components/dashboard/prompt-guardian';

export type ActiveView = 'scan' | 'malware' | 'phishing' | 'guardian';

const Home: FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('scan');

  const renderContent = () => {
    switch (activeView) {
      case 'scan':
        return <CodeScanner />;
      case 'malware':
        return <MalwareDetector />;
      case 'phishing':
        return <PhishingDetector />;
      case 'guardian':
        return <PromptGuardian />;
      default:
        return <CodeScanner />;
    }
  };

  return (
    <MainLayout activeView={activeView} setActiveView={setActiveView}>
      {renderContent()}
    </MainLayout>
  );
};

export default Home;
