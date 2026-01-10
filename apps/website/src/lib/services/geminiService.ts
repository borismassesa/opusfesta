interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export const getGeminiResponse = async (userPrompt: string, vendorBio: string): Promise<string> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Gemini API key not configured');
      return "I'm sorry, the AI assistant is not configured at this time. Please contact the vendor directly for assistance.";
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an assistant for a wedding vendor on OpusFesta. 
            Based on the following vendor bio, answer the user's question politely and professionally.
            
            Vendor Bio: ${vendorBio}
            
            User Question: ${userPrompt}
            
            Keep your response concise and helpful.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text || "I'm sorry, I couldn't process that.";
    }
    
    return "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error('Gemini API error:', error);
    return "Sorry, I'm having trouble connecting right now. Please try again later or contact the vendor directly.";
  }
};
