
"use client";

import { useState, useEffect } from 'react';
import { Code, Github, Loader, Search, FileCode, Server, Cloud, BrainCircuit, History, GitPullRequest, ShieldCheck, ShieldAlert, Shield, Globe, Trash2, PlusCircle, X, Component, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { VulnerabilityCard } from './vulnerability-card';
import { Skeleton } from '../ui/skeleton';
import { detectVulnerabilities, UIVulnerability, DetectVulnerabilitiesOutput } from '@/ai/flows/detect-vulnerabilities';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '@/components/ui/separator';

type ModelProvider = 'cloud' | 'local';
type ScanResults = DetectVulnerabilitiesOutput & { vulnerabilities: UIVulnerability[] };
type CodeFile = { id: string; path: string; code: string; };

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

const threatFeedMessages = [
  { time: "20:14:01 UTC", text: "New Pattern: Insecure Deserialization in Python Django. Origin: eu-central-1." },
  { time: "20:14:15 UTC", text: "Pattern Confirmed by 50 nodes. Propagating to network..." },
  { time: "20:14:28 UTC", text: "New Pattern: XSS in React via AI-suggested DOM manipulation. Origin: us-east-1." },
  { time: "20:14:55 UTC", text: "New Pattern: Hardcoded API key in a public GitHub commit. Origin: ap-southeast-2." },
  { time: "20:15:10 UTC", text: "Pattern Confirmed by 120 nodes. Propagating to network..." },
  { time: "20:15:33 UTC", text: "Network Alert: Suspicious dependency added in an npm package. Scanning..." },
];

function GlobalThreatFeed() {
    const [messages, setMessages] = useState(threatFeedMessages.slice(0, 2));

    useEffect(() => {
        const interval = setInterval(() => {
            setMessages(prev => {
                const nextIndex = prev.length % threatFeedMessages.length;
                if (prev.length >= threatFeedMessages.length) {
                    return [threatFeedMessages[nextIndex]];
                }
                return [...prev, threatFeedMessages[nextIndex]];
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);
    
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Globe className="w-6 h-6 text-primary" />
                    <CardTitle>Global Threat Feed</CardTitle>
                </div>
                <CardDescription>
                    Simulated real-time vulnerability patterns from the decentralized network.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 h-48 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-primary/50 animate-pulse" />
                            <div className="text-sm">
                                <p className="font-mono text-xs text-muted-foreground">{msg.time}</p>
                                <p className="text-foreground">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function CodeScanner() {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [modelProvider, setModelProvider] = useState<ModelProvider>('cloud');
  const [threatMemory, setThreatMemory] = useState<string[]>([]);
  const [falsePositives, setFalsePositives] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('paste-code');
  const [isClient, setIsClient] = useState(false);
  const [notarizationState, setNotarizationState] = useState<{loading: boolean, reportHash: string | null, txHash: string | null}>({loading: false, reportHash: null, txHash: null});
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setFiles([{ id: crypto.randomUUID(), path: 'src/main.py', code: '' }]);
  }, []);

  if (!isClient) {
    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="h-9 w-64" />
          </div>
          <Skeleton className="h-5 w-full max-w-lg" />
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-[600px] w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const handleFileChange = (id: string, field: 'path' | 'code', value: string) => {
    setFiles(files.map(file => file.id === id ? { ...file, [field]: value } : file));
  };

  const addFile = () => {
    setFiles([...files, { id: crypto.randomUUID(), path: '', code: '' }]);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  // Simple string-based hash simulation. In a real app, use a crypto library.
  const simulateSha256 = (s: string) => {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        const char = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    // Convert to a 64-char hex string to resemble SHA-256
    let hex = (hash >>> 0).toString(16);
    while (hex.length < 8) hex = "0" + hex;
    return (hex + hex + hex + hex + hex + hex + hex + hex).substring(0, 64);
  }

  const handleScan = async () => {
    const filesToScan = files.filter(f => f.code.trim() !== '');

    if (filesToScan.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some code in at least one file to scan.",
      })
      return;
    }

    setIsLoading(true);
    setResults(null);
    setNotarizationState({loading: false, reportHash: null, txHash: null});

    if (modelProvider === 'local') {
        toast({
            title: "Local Model Selected",
            description: "Scanning with a local model ensures your code remains private. This feature is for demonstration purposes.",
        })
    }

    try {
      const result = await detectVulnerabilities({ 
        files: filesToScan.map(({path, code}) => ({path, code})),
        pastVulnerabilityTypes: threatMemory
      });
      const vulnerabilitiesWithIds = result.vulnerabilities.map(v => ({...v, id: crypto.randomUUID()}));
      const finalResult = {...result, vulnerabilities: vulnerabilitiesWithIds};
      setResults(finalResult);

      const newThreatTypes = vulnerabilitiesWithIds.map(v => v.type).filter(type => !falsePositives.includes(type));
      setThreatMemory(prev => [...new Set([...prev, ...newThreatTypes])]);
      
      const reportHash = simulateSha256(JSON.stringify(finalResult));
      setNotarizationState(prev => ({...prev, reportHash}));

      toast({
        title: "Scan Complete",
        description: `Found ${vulnerabilitiesWithIds.length} potential vulnerabilities. Report hash generated.`,
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
    setFiles([{ id: crypto.randomUUID(), path: 'src/vulnerable_pr.py', code: sampleVulnerableCode }]);
    setActiveTab('paste-code');
    setTimeout(() => {
        handleScan();
    }, 100);
  }
  
  const handleNotarize = () => {
      setNotarizationState(prev => ({...prev, loading: true, txHash: null}));
      toast({
          title: "Publishing Report Hash...",
          description: "Broadcasting report hash to the decentralized network for notarization.",
          duration: 3000,
      });

      setTimeout(() => {
          const fakeTxHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
          setNotarizationState(prev => ({...prev, loading: false, txHash: fakeTxHash}));
            toast({
              title: "Transaction Confirmed!",
              description: "The report hash is now immutable on the blockchain.",
          });
      }, 3000);
  }

  const handleMarkFalsePositive = (vulnerability: UIVulnerability) => {
    // Remove from results view
    setResults(prev => prev ? ({ ...prev, vulnerabilities: prev.vulnerabilities.filter(v => v.id !== vulnerability.id) }) : null);
    
    // Add to false positives list if not already there
    setFalsePositives(prev => [...new Set([...prev, vulnerability.type])]);
    
    // Remove from active threats if it's there
    setThreatMemory(prev => prev.filter(t => t !== vulnerability.type));

    toast({
      title: "Feedback Submitted",
      description: "The federated model is learning from your feedback to improve accuracy.",
    });
  }

  const handleDownloadReport = () => {
    if (!results) return;

    const reportJson = JSON.stringify(results, null, 2);
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
        title: "Report Downloaded",
        description: "report.json has been saved.",
    });
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
                    <TabsTrigger value="paste-code"><FileCode className="mr-2" /> File-based Scan</TabsTrigger>
                    <TabsTrigger value="pre-merge-auditor"><GitPullRequest className="mr-2" /> Pre-Merge Auditor</TabsTrigger>
                </TabsList>
                <TabsContent value="paste-code">
                    <Card>
                        <CardHeader>
                            <CardTitle>Code to Scan</CardTitle>
                            <CardDescription>Add one or more files to analyze the project context.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                              {files.map((file) => (
                                <div key={file.id} className="p-4 border rounded-lg space-y-2 relative bg-muted/20">
                                   {files.length > 1 && (
                                     <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute top-2 right-2 h-6 w-6"
                                      onClick={() => removeFile(file.id)}
                                      disabled={isLoading}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                   )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                          <Label htmlFor={`path-${file.id}`} className="text-xs">File Path</Label>
                                          <Input 
                                              id={`path-${file.id}`}
                                              placeholder="e.g., src/app.js"
                                              value={file.path}
                                              onChange={e => handleFileChange(file.id, 'path', e.target.value)}
                                              className="font-code text-sm h-9"
                                              disabled={isLoading}
                                          />
                                      </div>
                                    </div>
                                    <div>
                                      <Label htmlFor={`code-${file.id}`} className="text-xs">Code</Label>
                                      <Textarea
                                          id={`code-${file.id}`}
                                          placeholder="Paste your code here..."
                                          value={file.code}
                                          onChange={e => handleFileChange(file.id, 'code', e.target.value)}
                                          className="min-h-[200px] font-code text-sm"
                                          disabled={isLoading}
                                      />
                                    </div>
                                </div>
                              ))}
                              <Button variant="outline" onClick={addFile} disabled={isLoading}>
                                <PlusCircle className="mr-2" /> Add File
                              </Button>
                            </div>
                            
                            <Separator />

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

                            <div className="flex gap-2">
                                <Button onClick={handleScan} disabled={isLoading} className="w-full sm:w-auto">
                                    {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Scanning...</> : 'Scan Code'}
                                </Button>
                                <Button variant="outline" onClick={() => setFiles([{id: crypto.randomUUID(), path: 'src/main.py', code: ''}])} disabled={isLoading}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Clear All
                                </Button>
                            </div>
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
                        <CardTitle>Federated Learning Model</CardTitle>
                    </div>
                    <CardDescription>
                        The AI learns from user feedback to improve accuracy across the network.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium mb-2">Confirmed Threats</h4>
                        {threatMemory.length === 0 ? (
                            <div className="text-sm text-muted-foreground flex items-center gap-2 p-3 border-dashed border-2 rounded-lg justify-center">
                                <History className="w-4 h-4" />
                                <span>No threats confirmed in this session.</span>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {threatMemory.map((mistake, index) => (
                                    <Badge key={index} variant="secondary">{mistake}</Badge>
                                ))}
                            </div>
                        )}
                    </div>
                     <div>
                        <h4 className="text-sm font-medium mb-2">Learned False Positives</h4>
                        {falsePositives.length === 0 ? (
                            <div className="text-sm text-muted-foreground flex items-center gap-2 p-3 border-dashed border-2 rounded-lg justify-center">
                                <ShieldCheck className="w-4 h-4" />
                                <span>No false positives marked yet.</span>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {falsePositives.map((fp, index) => (
                                    <Badge key={index} variant="outline">{fp}</Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            <GlobalThreatFeed />
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
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold">Vulnerability Report</h2>
             <Button variant="outline" onClick={handleDownloadReport} disabled={!results}>
                <Download className="mr-2" />
                Download Report
             </Button>
          </div>
          <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Component className="w-6 h-6 text-primary" />
                    <CardTitle>Blockchain Audit Trail (Simulation)</CardTitle>
                  </div>
                  <CardDescription>Create an immutable, tamper-proof record of this vulnerability scan by publishing its SHA-256 hash to a decentralized ledger.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {notarizationState.txHash ? (
                         <Alert variant="default" className="border-green-500/50 bg-green-500/10">
                            <ShieldCheck className="h-4 w-4 !text-green-500" />
                            <AlertTitle>Scan Report Notarized</AlertTitle>
                            <AlertDescription>
                                <p className="mb-2">The report hash is now immutable on the blockchain, guaranteeing its authenticity and integrity.</p>
                                <div className="space-y-1 text-xs font-mono">
                                     <p><span className="font-semibold text-muted-foreground">Report Hash:</span> <span className="break-all">{notarizationState.reportHash}</span></p>
                                     <p><span className="font-semibold text-muted-foreground">Transaction ID:</span> <span className="break-all">{notarizationState.txHash}</span></p>
                                </div>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div>
                             <div className="mb-4">
                                <Label className="text-xs font-semibold">Report Hash (SHA-256)</Label>
                                <p className="text-sm font-mono p-2 bg-muted rounded-md break-all">{notarizationState.reportHash || "Scan to generate hash..."}</p>
                             </div>
                            <Button onClick={handleNotarize} disabled={notarizationState.loading || !notarizationState.reportHash}>
                                {notarizationState.loading ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Notarize Scan on Blockchain"}
                            </Button>
                        </div>
                    )}
                </CardContent>
              </Card>

            {results.vulnerabilities.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground flex items-center justify-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span>No vulnerabilities found. The code seems safe.</span>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {results.vulnerabilities.map((vuln) => (
                    <VulnerabilityCard key={vuln.id} vulnerability={vuln} onMarkFalsePositive={handleMarkFalsePositive} />
                    ))}
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

    