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

// Mock data, as there's no vulnerability detection flow
const mockVulnerabilities = [
  {
    id: 'vuln-1',
    type: 'SQL Injection',
    description: 'Potential SQL Injection due to string concatenation in query.',
    codeSnippet: `const query = "SELECT * FROM users WHERE id = '" + userId + "'";`,
    file: 'src/db.js',
    line: 42,
  },
  {
    id: 'vuln-2',
    type: 'Hardcoded Secret',
    description: 'An API key is hardcoded in the source file.',
    codeSnippet: `const API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";`,
    file: 'src/api.js',
    line: 5,
  },
  {
    id: 'vuln-3',
    type: 'Unsafe `eval` usage',
    description: 'The `eval` function is used with user-provided input, which can lead to arbitrary code execution.',
    codeSnippet: `eval('console.log("Welcome, " + username)');`,
    file: 'src/greeting.js',
    line: 12,
  },
];

export type Vulnerability = typeof mockVulnerabilities[0];

export function CodeScanner() {
  const [code, setCode] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Vulnerability[] | null>(null);
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

    // Simulate network delay and analysis
    setTimeout(() => {
      setResults(mockVulnerabilities);
      setIsLoading(false);
      toast({
        title: "Scan Complete",
        description: `Found ${mockVulnerabilities.length} potential vulnerabilities.`,
      })
    }, 2000);
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
          <div className="space-y-4">
            {results.map((vuln) => (
              <VulnerabilityCard key={vuln.id} vulnerability={vuln} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
