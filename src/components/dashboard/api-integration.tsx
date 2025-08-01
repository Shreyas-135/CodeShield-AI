"use client";

import { Share2, Terminal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const curlExample = `
curl -X POST https://api.codeshield.ai/v1/scan \\
     -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     -d '{
           "code": "def vulnerable_function(user_input):\\n    # ... your code here"
         }'
`.trim();

const pythonExample = `
import requests
import json

api_key = "YOUR_API_KEY"
code_snippet = """
def get_user(user_id):
    # Vulnerable to SQL Injection
    query = "SELECT * FROM users WHERE id = '" + user_id + "'"
    ...
"""

response = requests.post(
    "https://api.codeshield.ai/v1/scan",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    },
    json={"code": code_snippet}
)

if response.status_code == 200:
    vulnerabilities = response.json()
    print(json.dumps(vulnerabilities, indent=2))
else:
    print(f"Error: {response.status_code}")

`.trim();

const javascriptExample = `
async function scanCode(codeSnippet) {
  const apiKey = 'YOUR_API_KEY';
  const url = 'https://api.codeshield.ai/v1/scan';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: codeSnippet }),
    });

    if (!response.ok) {
      throw new Error(\`API request failed with status \${response.status}\`);
    }

    const results = await response.json();
    console.log(results);
  } catch (error) {
    console.error('Failed to scan code:', error);
  }
}

const codeToScan = \`const user = req.query.user; res.send("Hello " + user);\`;
scanCode(codeToScan);
`.trim();


export function ApiIntegration() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Share2 className="text-primary w-8 h-8" />
          <h1 className="text-3xl font-bold">API Integration</h1>
        </div>
        <p className="text-muted-foreground">
          Become the universal security layer for any AI coding tool. Integrate CodeShield's vulnerability validation directly into your existing development workflow or platform.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>
            CodeShield's core scanning logic is exposed via a simple, secure REST API. This allows you to programmatically scan code snippets and receive structured vulnerability reports in JSON format. This page demonstrates how you would integrate it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Terminal className="w-5 h-5" /> Endpoint
            </h3>
            <div className="p-3 bg-muted rounded-md font-code text-sm">
              <span className="text-green-400">POST</span> <span className="text-foreground">/v1/scan</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Example Requests</h3>
            <Tabs defaultValue="curl">
                <TabsList>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                </TabsList>
                <TabsContent value="curl">
                    <SyntaxHighlighter language="bash" style={vscDarkPlus} customStyle={{ borderRadius: '0.5rem', backgroundColor: '#1E1E1E' }}>
                        {curlExample}
                    </SyntaxHighlighter>
                </TabsContent>
                <TabsContent value="python">
                    <SyntaxHighlighter language="python" style={vscDarkPlus} customStyle={{ borderRadius: '0.5rem', backgroundColor: '#1E1E1E' }}>
                        {pythonExample}
                    </SyntaxHighlighter>
                </TabsContent>
                 <TabsContent value="javascript">
                    <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ borderRadius: '0.5rem', backgroundColor: '#1E1E1E' }}>
                        {javascriptExample}
                    </SyntaxHighlighter>
                </TabsContent>
            </Tabs>
          </div>
          
           <div>
            <h3 className="text-lg font-semibold mb-2">Potential Revenue Model</h3>
            <p className="text-sm text-muted-foreground">
              This API-first approach positions CodeShield as essential infrastructure for the AI-assisted development ecosystem, creating massive scale potential through a pay-per-call or tiered subscription model.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
