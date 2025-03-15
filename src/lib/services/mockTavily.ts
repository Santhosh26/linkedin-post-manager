// src/lib/services/mockTavily.ts
// This is a mock implementation for development/testing when you don't have a valid Tavily API key

interface TavilySearchParams {
    query: string;
    search_depth?: 'basic' | 'advanced';
    include_domains?: string[];
    exclude_domains?: string[];
    max_results?: number;
  }
  
  interface TavilySearchResult {
    url: string;
    title: string;
    content: string;
    score: number;
    published_date?: string;
  }
  
  interface TavilyResponse {
    query: string;
    results: TavilySearchResult[];
  }
  
  export async function mockSearchContent(params: TavilySearchParams): Promise<TavilyResponse> {
    // Log that we're using mock data
    console.log('USING MOCK TAVILY DATA - Replace with real API in production');
    console.log('Search query:', params.query);
    
    // Short delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get number of results to return (default to 5)
    const maxResults = params.max_results || 5;
    
    // Generate mock results based on the query
    const results: TavilySearchResult[] = [];
    
    // Get the topic from the query
    const topic = params.query.toLowerCase();
    
    // Sample domains for URLs
    const domains = [
      'medium.com',
      'techcrunch.com',
      'wired.com',
      'infoworld.com',
      'zdnet.com',
      'computerworld.com',
      'informationweek.com',
      'cio.com',
      'securitymagazine.com',
      'darkreading.com'
    ];
    
    // Sample titles based on popular tech topics
    const sampleTitles = {
      security: [
        'Top 10 Application Security Best Practices for 2025',
        'How Zero Trust Architecture Is Transforming Enterprise Security',
        'The Rise of AI-Powered Security Solutions',
        'Implementing DevSecOps in Modern Development Environments',
        'Blockchain Security: Protecting Digital Assets in the Modern Era',
        'Cloud Security Posture Management: What You Need to Know',
        'The Impact of Quantum Computing on Cybersecurity',
        'Securing Microservices Architecture: Challenges and Solutions',
        'Container Security Best Practices for Enterprise Applications',
        'Threat Hunting: Proactive Approaches to Cybersecurity'
      ],
      leadership: [
        'Building High-Performance Engineering Teams',
        'Emotional Intelligence for Technical Leaders',
        'Navigating Technical Debt as an Engineering Manager',
        'How to Lead Successful Digital Transformations',
        'The Art of Technical Decision Making',
        'Managing Remote Engineering Teams Effectively',
        'From Engineer to Leader: Making the Transition Successfully',
        'Creating a Culture of Innovation in Tech Organizations',
        'Inclusive Leadership Practices in Technology Companies',
        'Mentoring and Coaching for Engineering Excellence'
      ],
      development: [
        'Microservices vs. Monoliths: Making the Right Architecture Choice',
        'The Future of Frontend Development: Whats Coming in 2025',
        'Serverless Computing: Benefits and Implementation Strategies',
        'GraphQL vs. REST: Choosing the Right API Paradigm',
        'Test-Driven Development in Modern JavaScript Applications',
        'Event-Driven Architecture: Patterns and Practices',
        'WebAssembly: The Future of Web Performance',
        'Progressive Web Apps: Development Best Practices',
        'Functional Programming Concepts for JavaScript Developers',
        'Building Accessible Web Applications: WCAG Guidelines'
      ]
    };
    
    // Default to security if no match
    const titles = 
      topic.includes('security') ? sampleTitles.security :
      topic.includes('lead') ? sampleTitles.leadership :
      topic.includes('develop') ? sampleTitles.development :
      sampleTitles.security;
    
    // Generate the requested number of results
    for (let i = 0; i < Math.min(maxResults, titles.length); i++) {
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const title = titles[i];
      const slugifiedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      results.push({
        url: `https://${domain}/${slugifiedTitle}`,
        title,
        content: generateMockContent(title, params.query),
        score: 0.95 - (i * 0.05),  // Decreasing relevance score
        published_date: generateRandomDate()
      });
    }
    
    return {
      query: params.query,
      results
    };
  }
  
  // Helper function to generate mock content
  function generateMockContent(title: string, query: string): string {
    const paragraphs = [
      `In today's rapidly evolving technology landscape, staying ahead of the curve is essential for organizations of all sizes. ${title} represents a critical consideration for modern businesses looking to optimize their operations and security posture.`,
      
      `When implementing ${title.toLowerCase()}, organizations should consider a phased approach that aligns with their business objectives and technical capabilities. Starting with a thorough assessment of current processes and technologies, teams can identify key areas for improvement and establish measurable goals for success.`,
      
      `Industry experts recommend a comprehensive strategy that includes regular training, clear documentation, and a culture of continuous improvement. As ${query} practices evolve, maintaining awareness of emerging trends and potential vulnerabilities is essential for long-term success.`,
      
      `Case studies have shown that organizations implementing robust ${query.toLowerCase()} strategies can achieve significant improvements in efficiency, security, and overall business outcomes. Companies like Microsoft, Google, and Amazon have pioneered many of these approaches, providing valuable insights for others to follow.`,
      
      `Looking ahead to the future of ${title.toLowerCase()}, we can expect increasing integration with artificial intelligence and machine learning technologies, enhanced automation capabilities, and more sophisticated analytics tools to drive decision-making processes.`
    ];
    
    // Return 3 random paragraphs
    return paragraphs
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .join('\n\n');
  }
  
  // Helper function to generate random dates within the last year
  function generateRandomDate(): string {
    const now = new Date();
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - Math.floor(Math.random() * 365));
    return pastDate.toISOString().split('T')[0];
  }