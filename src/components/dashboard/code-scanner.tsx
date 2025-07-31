"use client";

import { useState } from 'react';
import { Code, Github, Loader, Search, FileCode, Server, Cloud, BrainCircuit, History, GitPullRequest } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { VulnerabilityCard } from './vulnerability-card';
import { Skeleton } from '../ui/skeleton';
import { detectVulnerabilities, UIVulnerability } from '@/ai/flows/detect-vulnerabilities';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';

type ModelProvider = 'cloud' | 'local';

const sampleVulnerableCode = `
import mysql.connector

def get_user(user_id):
    db = mysql.connector.connect(user='root', password='password', host='localhost', database='testdb')
    cursor = db.cursor()
    # This is vulnerable to SQL Injection
    cursor.execute("SELECT * FROM users WHERE id = '" + user_id + "'")
    user = cursor.fetchone()
    return user

# Hardcoded secret
API_KEY = "da39a3ee5e6b4b0d3255bfef95601890afd80709"

print("Using API Key:", API_KEY)
`;

export function CodeScanner() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<UIVulnerability[] | null>(null);
  const [modelProvider, setModelProvider] = useState<ModelProvider>('cloud');
  const [mistakeMemory, setMistakeMemory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('paste-code');
  const { toast } = useToast();

  const handleScan = async (codeToScan: string) => {
    if (!codeToScan.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some code to scan.",
      })
      return;
    }

    setIsLoading(true);
    setResults(null);
    
    if (modelProvider === 'local') {
        toast({
            title: "Local Model Selected",
            description: "Scanning with a local model ensures your code remains private. This feature is for demonstration purposes.",
        })
    }

    try {
      const result = await detectVulnerabilities({ 
        code: codeToScan,
        pastVulnerabilityTypes: mistakeMemory
      });
      const vulnerabilitiesWithIds = result.vulnerabilities.map(v => ({...v, id: self.crypto.randomUUID()}));
      setResults(vulnerabilitiesWithIds);

      // Update mistake memory with new, unique vulnerability types
      const newVulnerabilityTypes = vulnerabilitiesWithIds.map(v => v.type);
      setMistakeMemory(prev => [...new Set([...prev, ...newVulnerabilityTypes])]);

      toast({
        title: "Scan Complete",
        description: `Found ${vulnerabilitiesWithIds.length} potential vulnerabilities. ${mistakeMemory.length > 0 ? 'Used mistake memory to improve scan.' : ''}`,
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
  
  const handleSimulatePrScan = () => {
    toast({
        title: "Simulating PR Scan",
        description: "Populating with sample vulnerable code from a mock pull request.",
    })
    setCode(sampleVulnerableCode);
    setActiveTab('paste-code');
    // Use a timeout to ensure the tab has switched and code is set before scanning
    setTimeout(() => {
        handleScan(sampleVulnerableCode);
    }, 100);
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paste-code"><FileCode className="mr-2" /> Paste Code</TabsTrigger>
                    <TabsTrigger value="pre-merge-auditor"><GitPullRequest className="mr-2" /> Pre-Merge Auditor</TabsTrigger>
                </TabsList>
                <TabsContent value="paste-code">
                    <Card>
                        <CardHeader>
                            <CardTitle>Code to Scan</CardTitle>
                            <CardDescription>Paste code snippets or entire files to analyze.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Textarea
                                placeholder="Paste your code here..."
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="min-h-[300px] font-code text-sm"
                                disabled={isLoading}
                            />

                            <div>
                                <Label className="mb-2 block font-medium">Choose AI Model Provider</Label>
                                <RadioGroup defaultValue="cloud" onValueChange={(value: string) => setModelProvider(value as ModelProvider)} className="flex gap-4">
                                    <Label htmlFor="cloud-model" className="flex items-center gap-2 border rounded-lg p-3 cursor-pointer has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary flex-1 transition-all">
                                        <RadioGroupItem value="cloud" id="cloud-model" />
                                        <Cloud className="text-primary" />
                                        <div>
                                            <p className="font-semibold">Cloud Model</p>
                                            <p className="text-xs text-muted-foreground">Best performance & accuracy.</p>
                                        </div>
                                    </Label>
                                    <Label htmlFor="local-model" className="flex items-center gap-2 border rounded-lg p-3 cursor-pointer has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary flex-1 transition-all">
                                        <RadioGroupItem value="local" id="local-model" />
                                        <Server className="text-primary" />
                                        <div>
                                            <p className="font-semibold">Local Model</p>
                                            <p className="text-xs text-muted-foreground">For sensitive & proprietary code.</p>
                                        </div>
                                    </Label>
                                </RadioGroup>
                            </div>
                            {modelProvider === 'local' && (
                                <Alert>
                                <Server className="h-4 w-4" />
                                <AlertTitle>Privacy-Preserving Scan</AlertTitle>
                                <AlertDescription>
                                    Your code will be processed on your local machine and will not be sent to any third-party services. (Demonstration)
                                </AlertDescription>
                                </Alert>
                            )}


                            <Button onClick={() => handleScan(code)} disabled={isLoading} className="w-full sm:w-auto">
                                {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Scanning...</> : 'Scan Code'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="pre-merge-auditor">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pre-Merge AI Code Auditor</CardTitle>
                            <CardDescription>Simulate scanning a pull request before it gets merged to catch vulnerabilities early.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <div className="flex justify-center">
                                <GitPullRequest className="w-16 h-16 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                This feature demonstrates how CodeShield can act as a security gate for AI contributions. Clicking the button will load sample vulnerable code from a mock PR and scan it automatically.
                            </p>
                            <Button onClick={handleSimulatePrScan}>
                                Simulate PR Scan
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
        <div className="space-y-4">
            <Card className="sticky top-4">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="w-6 h-6 text-primary" />
                        <CardTitle>AI Mistake Memory</CardTitle>
                    </div>
                    <CardDescription>
                        The scanner learns from past results in this session to improve detection of recurring issues.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {mistakeMemory.length === 0 ? (
                        <div className="text-sm text-muted-foreground flex items-center gap-2 p-4 border-dashed border-2 rounded-lg justify-center">
                            <History className="w-4 h-4" />
                            <span>No mistakes logged yet.</span>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {mistakeMemory.map((mistake, index) => (
                                <Badge key={index} variant="secondary">{mistake}</Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
      
      {isLoading && (
         <div className="space-y-4 mt-8">
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
        <div className="mt-8">
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

    