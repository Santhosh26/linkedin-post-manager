//src\lib\contexts\ResearchContext.tsx

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the research result interfaces
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

// Define the context state shape
interface ResearchContextType {
  researchId: string | null;
  researchData: ResearchData | null;
  topicId: string | null;
  setResearchState: (researchId: string, researchData: ResearchData, topicId: string) => void;
  clearResearchState: () => void;
}

// Create the context with a default value
const ResearchContext = createContext<ResearchContextType>({
  researchId: null,
  researchData: null,
  topicId: null,
  setResearchState: () => {},
  clearResearchState: () => {},
});

// Export a hook to use the research context
export const useResearchContext = () => useContext(ResearchContext);

interface ResearchProviderProps {
  children: ReactNode;
}

export const ResearchProvider: React.FC<ResearchProviderProps> = ({ children }) => {
  const [researchId, setResearchId] = useState<string | null>(null);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);

  const setResearchState = (id: string, data: ResearchData, topic: string) => {
    setResearchId(id);
    setResearchData(data);
    setTopicId(topic);
  };

  const clearResearchState = () => {
    setResearchId(null);
    setResearchData(null);
    setTopicId(null);
  };

  return (
    <ResearchContext.Provider
      value={{
        researchId,
        researchData,
        topicId,
        setResearchState,
        clearResearchState,
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
};