'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VulnerabilitySchema = z.object({
  type: z.string().describe('The type of vulnerability (e.g., "SQL Injection", "Hardcoded Secret").'),
  description: z.string().describe('A brief, one-sentence description of the potential vulnerability.'),
  codeSnippet: z.string().describe('The exact line or block of code that is vulnerable.'),
  file: z.string().describe('The file where the vulnerability is located. Since this is a snippet, you can use a placeholder like "pasted-code.ts".'),
  line: z.number().describe('The line number where the vulnerability is located. This can be an estimate relative to the snippet.'),
});

const DetectVulnerabilitiesInputSchema = z.object({
  code: z.string().describe('The code snippet to scan for vulnerabilities.'),
  pastVulnerabilityTypes: z.array(z.string()).optional().describe('An optional list of vulnerability types that have been detected in previous scans. The scanner should pay special attention to these.'),
});
export type DetectVulnerabilitiesInput = z.infer<typeof DetectVulnerabilitiesInputSchema>;

const DetectVulnerabilitiesOutputSchema = z.object({
  vulnerabilities: z.array(VulnerabilitySchema),
});
export type DetectVulnerabilitiesOutput = z.infer<typeof DetectVulnerabilitiesOutputSchema>;

// We are exporting the AI-generated type, but adding a client-side 'id' field.
export type UIVulnerability = z.infer<typeof VulnerabilitySchema> & { id: string };

export async function detectVulnerabilities(input: DetectVulnerabilitiesInput): Promise<DetectVulnerabilitiesOutput> {
  const result = await detectVulnerabilitiesFlow(input);
  return result;
}

const promptTemplate = `You are an expert security code scanner. Analyze the following code snippet for potential vulnerabilities.
  
Identify common security issues such as SQL Injection, Cross-Site Scripting (XSS), hardcoded secrets, insecure deserialization, command injection, and other OWASP Top 10 vulnerabilities.

For each vulnerability you find, provide the type, a description, the vulnerable code snippet, a placeholder filename, and an estimated line number.

{{#if pastVulnerabilityTypes}}
You have identified the following types of vulnerabilities in the past. Pay special attention to these patterns as they may indicate recurring mistakes made by the AI that generated this code:
{{#each pastVulnerabilityTypes}}
- {{this}}
{{/each}}
This context should help you perform a more targeted and effective scan.
{{/if}}

If no vulnerabilities are found, return an empty array for the "vulnerabilities" field.

Code Snippet:
'''
{{{code}}}
'''
`;

const prompt = ai.definePrompt({
  name: 'detectVulnerabilitiesPrompt',
  input: { schema: DetectVulnerabilitiesInputSchema },
  output: { schema: DetectVulnerabilitiesOutputSchema },
  prompt: promptTemplate,
});

const detectVulnerabilitiesFlow = ai.defineFlow(
  {
    name: 'detectVulnerabilitiesFlow',
    inputSchema: DetectVulnerabilitiesInputSchema,
    outputSchema: DetectVulnerabilitiesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
