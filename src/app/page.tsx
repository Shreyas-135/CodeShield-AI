"use client";

import { useState } from 'react';
import type { FC } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { CodeScanner } from '@/components/dashboard/code-scanner';
import { MalwareDetector } from '@/components/dashboard/malware-detector';
import { PhishingDetector } from '@/components/dashboard/phishing-detector';
import { PromptGuardian } from '@/components/dashboard/prompt-guardian';
import { ApiIntegration } from '@/components/dashboard/api-integration';
import { QuantumReadiness } from '@/components/dashboard/quantum-readiness';

export type ActiveView = 'scan' | 'malware' | 'phishing' | 'guardian' | 'api' | 'quantum';

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
      case 'api':
        return <ApiIntegration />;
      case 'quantum':
        return <QuantumReadiness />;
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
