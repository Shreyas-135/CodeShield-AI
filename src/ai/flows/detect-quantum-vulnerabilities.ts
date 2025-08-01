// Detects potential quantum computing vulnerabilities and post-quantum cryptography compliance issues.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuantumVulnerabilitySchema = z.object({
  category: z.string().describe("The category of the quantum vulnerability (e.g., 'Classic Crypto', 'PQC Compliance')."),
  vulnerability: z.string().describe("A brief description of the vulnerability."),
  recommendation: z.string().describe("The recommended action to mitigate the vulnerability."),
  codeSnippet: z.string().describe("The relevant line or block of code."),
});

const DetectQuantumVulnerabilitiesInputSchema = z.object({
  code: z.string().describe('The code snippet to scan for quantum vulnerabilities.'),
});
export type DetectQuantumVulnerabilitiesInput = z.infer<typeof DetectQuantumVulnerabilitiesInputSchema>;

const DetectQuantumVulnerabilitiesOutputSchema = z.object({
  isQuantumSafe: z.boolean().describe("Whether the code appears to be safe from common quantum attacks."),
  report: z.array(QuantumVulnerabilitySchema).describe("A list of identified quantum-related security issues."),
  summary: z.string().describe("A high-level summary of the code's quantum readiness.")
});
export type DetectQuantumVulnerabilitiesOutput = z.infer<typeof DetectQuantumVulnerabilitiesOutputSchema>;

export async function detectQuantumVulnerabilities(input: DetectQuantumVulnerabilitiesInput): Promise<DetectQuantumVulnerabilitiesOutput> {
  return detectQuantumVulnerabilitiesFlow(input);
}

const quantumVulnerabilityPrompt = ai.definePrompt({
  name: 'quantumVulnerabilityPrompt',
  input: {schema: DetectQuantumVulnerabilitiesInputSchema},
  output: {schema: DetectQuantumVulnerabilitiesOutputSchema},
  prompt: `You are a Quantum Security Analyst. Your task is to analyze code for two main types of quantum-related vulnerabilities:
1.  **Use of Classical Cryptography Vulnerable to Quantum Attacks:** Identify standard cryptographic algorithms (like RSA, ECC, DSA) that will be breakable by quantum computers.
2.  **Post-Quantum Cryptography (PQC) Compliance:** Check if the code is using or transitioning to quantum-resistant algorithms recommended by NIST (e.g., CRYSTALS-Kyber for key establishment, CRYSTALS-Dilithium for signatures).

Analyze the following code snippet:
'''
{{{code}}}
'''

Based on your analysis:
- Determine if the code is "quantum safe". It is only safe if it uses recognized PQC algorithms and has no quantum-vulnerable classical crypto.
- Create a report listing each identified issue. For each issue, provide the category, a description of the vulnerability, a recommended mitigation (e.g., "Replace RSA encryption with CRYSTALS-Kyber"), and the relevant code snippet.
- Provide a high-level summary of the code's quantum readiness.

Return your analysis in the specified JSON format.
`,
});

const detectQuantumVulnerabilitiesFlow = ai.defineFlow(
  {
    name: 'detectQuantumVulnerabilitiesFlow',
    inputSchema: DetectQuantumVulnerabilitiesInputSchema,
    outputSchema: DetectQuantumVulnerabilitiesOutputSchema,
  },
  async input => {
    const {output} = await quantumVulnerabilityPrompt(input);
    return output!;
  }
);
