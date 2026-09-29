/**
 * Chatbot API Service
 * Handles communication with the Flask chatbot backend
 */

const CHATBOT_API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:5000';

/**
 * Ask a question to the chatbot
 * @param {string} query - The question to ask
 * @param {number} topK - Number of documents to retrieve (default: 5)
 * @returns {Promise<Object>} Response containing answer, sources, and context
 */
export const askChatbot = async (query, topK = 5) => {
  try {
    const response = await fetch(`${CHATBOT_API_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        top_k: topK,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get response from chatbot');
    }

    return await response.json();
  } catch (error) {
    console.error('Chatbot API Error:', error);
    throw error;
  }
};

/**
 * Check if the chatbot service is available
 * @returns {Promise<boolean>} True if service is reachable
 */
export const checkChatbotHealth = async () => {
  try {
    const response = await fetch(`${CHATBOT_API_URL}/`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('Chatbot service is not reachable:', error);
    return false;
  }
};
