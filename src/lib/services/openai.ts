// src/lib/services/openai.ts
// You may need to run: npm install openai
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ResearchResult {
  url: string;
  title: string;
  content: string;
  score: number;
  published_date?: string;
}

interface ResearchData {
  query: string;
  results: ResearchResult[];
}

interface GeneratePostParams {
  topic: string;
  researchData: ResearchData;
  tone?: 'professional' | 'casual' | 'thoughtful';
  variationCount?: number;
}

interface PostVariation {
  content: string;
  hashtags: string[];
}

export async function generateLinkedInPosts(params: GeneratePostParams): Promise<PostVariation[]> {
  const { topic, researchData, tone = 'professional', variationCount = 2 } = params;
  
  try {
    // Create a system message that instructs the model how to format the response
    const systemMessage = `You are a professional LinkedIn content creator who writes engaging posts based on research data. 
    Your task is to create ${variationCount} LinkedIn post variations with a ${tone} tone.
    Format your response as a JSON object with a "posts" array where each item has "content" and "hashtags" properties.
    Example format: { "posts": [{ "content": "Post text here", "hashtags": ["#tag1", "#tag2"] }] }`;
    
    // Create a user message that provides the research data
    const userMessage = `Create ${variationCount} LinkedIn post variations about "${topic}" based on this research data:
    ${JSON.stringify(researchData)}`;
    
    // Make the API call using the OpenAI SDK
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      temperature: 1,
      response_format: { type: "json_object" }
    });
    
    // Extract the content from the completion
    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error('Empty response from OpenAI API');
    }
    
    // Parse the JSON response
    const responseData = JSON.parse(responseContent);
    
    // Return the posts array or an empty array if not found
    return responseData.posts || [];
  } catch (error) {
    console.error('Error generating LinkedIn posts:', error);
    
    // Provide more detailed error information
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    throw new Error('Failed to generate LinkedIn posts');
  }
}