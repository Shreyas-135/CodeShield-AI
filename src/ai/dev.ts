import { config } from 'dotenv';
config();

import '@/ai/flows/detect-malware.ts';
import '@/ai/flows/explain-vulnerability.ts';
import '@/ai/flows/detect-phishing.ts';
import '@/ai/flows/suggest-fix.ts';
import '@/ai/flows/detect-vulnerabilities.ts';
import '@/ai/flows/analyze-prompt.ts';
