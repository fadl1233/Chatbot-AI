import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ModelId } from '../types';

class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;
  private currentModel: ModelId | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  public initializeChat(model: ModelId) {
    // Create a new chat session. 
    // Note: In a real persistent app, we might load history here.
    this.chatSession = this.ai.chats.create({
      model: model,
      config: {
        systemInstruction: "You are a helpful, expert AI assistant. You answer concisely and accurately. You use Markdown for formatting code and structured text.",
      }
    });
    this.currentModel = model;
  }

  public async *sendMessageStream(message: string): AsyncGenerator<string, void, unknown> {
    if (!this.chatSession) {
      throw new Error("Chat session not initialized");
    }

    try {
      const result = await this.chatSession.sendMessageStream({ message });
      
      for await (const chunk of result) {
        // Cast to GenerateContentResponse to access .text safely
        const contentResponse = chunk as GenerateContentResponse;
        if (contentResponse.text) {
            yield contentResponse.text;
        }
      }
    } catch (error) {
      console.error("Error in sendMessageStream:", error);
      throw error;
    }
  }

  public resetSession(model: ModelId) {
    this.initializeChat(model);
  }
}

export const geminiService = new GeminiService();
