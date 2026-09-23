import apiClient from '@/api/client';
import type {
  AssistantChatResponse,
  AssistantTopic,
  AssistantSuggestionCategory
} from '@/types';

export const assistantService = {
  /**
   * Send a question to the RAG AI Assistant
   */
  async sendMessage(query: string): Promise<AssistantChatResponse> {
    const response = await apiClient.post<AssistantChatResponse>('/assistant/chat/', { query });
    return response.data;
  },

  /**
   * Get curated quick-start question suggestions
   */
  async getSuggestions(): Promise<{ suggestions: AssistantSuggestionCategory[] }> {
    const response = await apiClient.get<{ suggestions: AssistantSuggestionCategory[] }>('/assistant/suggestions/');
    return response.data;
  },

  /**
   * Get all knowledge base topics and metadata
   */
  async getTopics(): Promise<{ topics: AssistantTopic[]; total_chunks: number }> {
    const response = await apiClient.get<{ topics: AssistantTopic[]; total_chunks: number }>('/assistant/topics/');
    return response.data;
  }
};
