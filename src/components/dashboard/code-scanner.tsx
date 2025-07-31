"use client";

import { useState } from 'react';
import { Code, Github, Loader, Search, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { VulnerabilityCard } from './vulnerability-card';
import { Skeleton } from '../ui/skeleton';
import { detectVulnerabilities, UIVulnerability } from '@/ai/flows/detect-vulnerabilities';
import { randomUUID } from 'crypto';

export function CodeScanner() {
  const [code, setCode] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<UIVulnerability[] | null>(null);
  const { toast } = useToast();

  const handleScan = async () => {
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some code to scan.",
      })
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const result = await detectVulnerabilities({ code });
      const vulnerabilitiesWithIds = result.vulnerabilities.map(v => ({...v, id: self.crypto.randomUUID()}));
      setResults(vulnerabilitiesWithIds);
      toast({
        title: "Scan Complete",
        description: `Found ${vulnerabilitiesWithIds.length} potential vulnerabilities.`,
      })
    } catch(e) {
        console.error("Vulnerability scan failed", e);
        toast({
            variant: "destructive",
            title: "Scan Failed",
            description: "Could not complete the vulnerability scan. Please try again.",
        })
    } finally {
        setIsLoading(false);
    }
  };

  const handleRepoScan = () => {
    toast({
        title: "Feature Coming Soon",
        description: "GitHub repository scanning is currently in development.",
    })
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Search className="text-primary w-8 h-8" />
          <h1 className="text-3xl font-bold">Vulnerability Scanner</h1>
        </div>
        <p className="text-muted-foreground">
          Detect vulnerabilities in AI-generated code, get plain-English explanations, and receive AI-powered fix suggestions.
        </p>
      </header>

      <Tabs defaultValue="paste-code">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste-code"><FileCode className="mr-2" /> Paste Code</TabsTrigger>
            <TabsTrigger value="github-repo"><Github className="mr-2" /> GitHub Repo</TabsTrigger>
        </TabsList>
        <TabsContent value="paste-code">
            <Card>
                <CardHeader>
                    <CardTitle>Code to Scan</CardTitle>
                    <CardDescription>Paste code snippets or entire files to analyze.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="Paste your code here..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="min-h-[300px] font-code text-sm"
                        disabled={isLoading}
                    />
                    <Button onClick={handleScan} disabled={isLoading}>
                        {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Scanning...</> : 'Scan Code'}
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="github-repo">
            <Card>
                <CardHeader>
                    <CardTitle>GitHub Repository</CardTitle>
                    <CardDescription>Enter a public repository URL to scan for vulnerabilities.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input 
                            placeholder="https://github.com/user/repo" 
                            value={repoUrl} 
                            onChange={e => setRepoUrl(e.target.value)}
                            disabled
                        />
                        <Button onClick={handleRepoScan} disabled>
                            Scan Repository
                        </Button>
                    </div>
                     <p className="text-sm text-muted-foreground">GitHub integration is for demonstration purposes and will be available soon.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
      {isLoading && (
         <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Analyzing...</h2>
            <Card>
                <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        </div>
      )}

      {results && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Vulnerability Report</h2>
          {results.length === 0 ? (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    No vulnerabilities found.
                </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
                {results.map((vuln) => (
                <VulnerabilityCard key={vuln.id} vulnerability={vuln} />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
