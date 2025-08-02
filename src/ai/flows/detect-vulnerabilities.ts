'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FileSchema = z.object({
  path: z.string().describe('The path of the file.'),
  code: z.string().describe('The content of the file.'),
});

const VulnerabilitySchema = z.object({
  type: z.string().describe('The type of vulnerability (e.g., "SQL Injection", "Hardcoded Secret").'),
  description: z.string().describe('A brief, one-sentence description of the potential vulnerability.'),
  codeSnippet: z.string().describe('The exact line or block of code that is vulnerable.'),
  file: z.string().describe('The file where the vulnerability is located.'),
  line: z.number().describe('The line number where the vulnerability is located. This can be an estimate relative to the snippet.'),
  severity: z.enum(["High", "Medium", "Low"]).describe("The severity of the vulnerability (High, Medium, or Low).")
});

const DetectVulnerabilitiesInputSchema = z.object({
  files: z.array(FileSchema).describe('The code files to scan for vulnerabilities.'),
  pastVulnerabilityTypes: z.array(z.string()).optional().describe('An optional list of vulnerability types that have been detected in previous scans. The scanner should pay special attention to these.'),
});
export type DetectVulnerabilitiesInput = z.infer<typeof DetectVulnerabilitiesInputSchema>;

const DetectVulnerabilitiesOutputSchema = z.object({
  vulnerabilities: z.array(VulnerabilitySchema),
  trustScore: z.number().describe("A score from 0 to 100 indicating the code's trustworthiness. 100 is perfectly trustworthy."),
  trustScoreSummary: z.string().describe("A brief summary of the trust score, e.g., 'Low Risk', 'High Risk'.")
});
export type DetectVulnerabilitiesOutput = z.infer<typeof DetectVulnerabilitiesOutputSchema>;

// We are exporting the AI-generated type, but adding a client-side 'id' field.
export type UIVulnerability = z.infer<typeof VulnerabilitySchema> & { id: string };

export async function detectVulnerabilities(input: DetectVulnerabilitiesInput): Promise<DetectVulnerabilitiesOutput> {
  const result = await detectVulnerabilitiesFlow(input);
  return result;
}

const promptTemplate = `You are an expert security code scanner. Analyze the following code files for potential vulnerabilities.
Consider how these files might interact with each other.

Identify common security issues such as SQL Injection, Cross-Site Scripting (XSS), hardcoded secrets, insecure deserialization, command injection, and other OWASP Top 10 vulnerabilities.

For each vulnerability you find, provide the type, a description, the vulnerable code snippet, the filename where it was found, an estimated line number, and a severity (High, Medium, or Low).

After identifying vulnerabilities, calculate a "Trust Score" from 0-100 for the code.
- Start with a score of 100.
- Subtract 40 for each High severity vulnerability.
- Subtract 20 for each Medium severity vulnerability.
- Subtract 10 for each Low severity vulnerability.
- The minimum score is 0.

Also provide a "Trust Score Summary":
- 80-100: "Low Risk"
- 50-79: "Medium Risk"
- 0-49: "High Risk"

{{#if pastVulnerabilityTypes}}
You have identified the following types of vulnerabilities in the past. Pay special attention to these patterns as they may indicate recurring mistakes made by the AI that generated this code:
{{#each pastVulnerabilityTypes}}
- {{this}}
{{/each}}
This context should help you perform a more targeted and effective scan.
{{/if}}

If no vulnerabilities are found, return an empty array for "vulnerabilities", a trust score of 100, and a summary of "Excellent".

Code Files:
---
{{#each files}}
File: {{{path}}}
'''
{{{code}}}
'''
---
{{/each}}
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
