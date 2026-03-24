import api from './api';

export interface Flashcard {
    front: string;
    back: string;
}

// Simple interface to mimic the Chat object behavior expected by consumers
export interface ChatSession {
    sendMessage: (message: string) => Promise<string>;
    history: any[]; // Keep track of history locally
}

export const geminiService = {
    createChatSession: (context: string, initialHistory?: { role: string, parts: { text: string }[] }[]): ChatSession | null => {
        // We create a simpler object that manages its own history
        // and sends it to the backend on each request

        // Transform initial history from "parts" format to simple content format if needed, 
        // or just store it. The backend expects {role, content}.
        // The frontend SDK usage had {role, parts: [{text}]}. 
        // We'll normalize to {role, content} for our internal state and backend API.

        let localHistory: { role: string, content: string }[] = [];

        if (initialHistory) {
            localHistory = initialHistory.map(h => ({
                role: h.role,
                content: h.parts[0]?.text || ''
            }));
        }

        return {
            history: localHistory,
            sendMessage: async (message: string) => {
                try {
                    // Determine system instruction or context from the 'context' arg
                    // Ideally this context is sent every time as system instruction?

                    const response = await api.post('chat-ai/', {
                        mode: 'chat',
                        prompt: message,
                        context: `You are an expert academic tutor for the UniMaster platform. Context: ${context}. Help students understand concepts.`,
                        history: localHistory
                    });

                    const reply = response.data.response;

                    // Update local history
                    localHistory.push({ role: 'user', content: message });
                    localHistory.push({ role: 'model', content: reply });

                    return reply;
                } catch (error) {
                    console.error("AI Chat Error:", error);
                    return "Sorry, I encountered an error connecting to the AI tutor.";
                }
            }
        };
    },

    sendMessage: async (chat: ChatSession, message: string): Promise<string> => {
        // Just delegate to the chat object's method
        return chat.sendMessage(message);
    },

    generateFlashcards: async (topic: string): Promise<Flashcard[]> => {
        try {
            const contents = `Generate 10 high-quality, academic study flashcards for the university course topic: "${topic}". 
              Focus on key definitions, important dates, formulas, or core concepts. 
              Ensure the 'back' is concise and easy to memorize.`;

            const response = await api.post('chat-ai/', {
                mode: 'flashcards',
                prompt: contents
            });

            if (response.data.response) {
                return JSON.parse(response.data.response);
            }
            return [];
        } catch (error) {
            console.error("Flashcard generation failed:", error);
            return [];
        }
    },

    generateStudySummary: async (title: string, description: string): Promise<string> => {
        try {
            const contents = `I am about to study a document titled "${title}". Description: "${description}".
              Provide a brief 2-sentence summary of what I might expect to learn, and list 3 key thought-provoking questions I should keep in mind while reading.
              Format:
              **Summary:** ...
              
              **Key Questions:**
              1. ...
              2. ...
              3. ...`;

            const response = await api.post('chat-ai/', {
                mode: 'summary',
                prompt: contents,
                context: title // Pass title as context/system context helper
            });
            return response.data.response || "";
        } catch (e) {
            return "";
        }
    }
};
