// src/lib/services/openai.ts
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

/**
 * Formats research data into a more readable format for the AI prompt
 * This helps the AI better understand the structure and content of the research
 */
function formatResearchForPrompt(research: ResearchData): string {
  return `
RESEARCH QUERY: "${research.query}"

${research.results.map((result, index) => `
SOURCE ${index + 1}: ${result.title}
URL: ${result.url}
${result.published_date ? `PUBLISHED: ${result.published_date}` : ''}
CONTENT:
${result.content}
`).join('\n---\n')}
`;
}

export async function generateLinkedInPosts(params: GeneratePostParams): Promise<PostVariation[]> {
  const { topic, researchData, tone = 'professional', variationCount = 2 } = params;
  
  try {
    // Format the research data in a more structured way
    const formattedResearch = formatResearchForPrompt(researchData);
    
    // Define tone descriptions for better AI understanding
    const toneDescriptions = {
      professional: 'formal, authoritative, business-oriented',
      casual: 'conversational, friendly, approachable',
      thoughtful: 'reflective, insightful, thought-provoking'
    };
    
    // Create a system message that instructs the model how to format the response
    const systemMessage = `You are a professional LinkedIn content creator who writes engaging posts based on research data. 
    Your task is to create ${variationCount} LinkedIn post variations with a ${tone} tone (${toneDescriptions[tone]}).
    Each post should:
    1. Be concise (under 1300 characters)
    2. Include 1-2 relevant emojis
    3. Include 3-5 relevant hashtags (without the # symbol in the hashtags array)
    4. Extract key insights from the research
    5. Be formatted for LinkedIn readability (short paragraphs, line breaks)
    6. Include a compelling hook or question
    7. Feel authentic and insightful, not promotional or generic
    
    Format your response as a JSON object with a "posts" array where each item has "content" and "hashtags" properties.
    Example format: { "posts": [{ "content": "Post text here", "hashtags": ["tag1", "tag2"] }] }`;
    
    // Create a user message that provides the formatted research data
    const userMessage = `Create ${variationCount} LinkedIn post variations about "${topic}" based on this research data:
    
    ${formattedResearch}`;
    
    // Make the API call using the OpenAI SDK
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      temperature: tone === 'professional' ? 0.7 : tone === 'casual' ? 0.9 : 0.8,
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