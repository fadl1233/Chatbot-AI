import { ModelId } from './types';

export const DEFAULT_MODEL = ModelId.FLASH;

export const MODEL_LABELS: Record<ModelId, string> = {
  [ModelId.FLASH]: 'Gemini 2.5 Flash (Fast)',
  [ModelId.PRO]: 'Gemini 3 Pro (Reasoning)',
};

export const WELCOME_MESSAGE = `Hello! I'm powered by Google's Gemini models. 
I can help you with coding, writing, analysis, and more. 

How can I assist you today?`;
