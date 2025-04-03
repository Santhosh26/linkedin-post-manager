// src\lib\contexts\ResearchContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

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
  getResearchData: (researchId: string) => ResearchData | null;
}

// Create the context with a default value
const ResearchContext = createContext<ResearchContextType>({
  researchId: null,
  researchData: null,
  topicId: null,
  setResearchState: () => {},
  clearResearchState: () => {},
  getResearchData: () => null,
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
  
  // Add a map to store multiple research datasets by ID
  const [researchDatasets, setResearchDatasets] = useState<Map<string, ResearchData>>(new Map());

  // Use useCallback to memoize the function to prevent recreation on each render
  const setResearchState = useCallback((id: string, data: ResearchData, topic: string) => {
    // Prevent unnecessary updates if values are the same
    setResearchId(prevId => {
      if (prevId === id) return prevId;
      return id;
    });
    
    setTopicId(prevTopic => {
      if (prevTopic === topic) return prevTopic;
      return topic;
    });
    
    // For data, we need to do a more careful comparison since it's an object
    setResearchData(prevData => {
      // If both are null or the same object reference, don't update
      if (prevData === data) return prevData;
      
      // If previous data was null but new data exists, update
      if (!prevData) return data;
      
      // If the query has changed, update
      if (prevData.query !== data.query) return data;
      
      // If the number of results has changed, update
      if (prevData.results.length !== data.results.length) return data;
      
      // Otherwise keep the previous data
      return prevData;
    });
    
    // Also store in the datasets map for later retrieval
    setResearchDatasets(prev => {
      // Don't update the map if we already have this data
      if (prev.has(id) && prev.get(id) === data) {
        return prev;
      }
      
      const newMap = new Map(prev);
      newMap.set(id, data);
      return newMap;
    });
  }, []);

  const clearResearchState = useCallback(() => {
    setResearchId(null);
    setResearchData(null);
    setTopicId(null);
    // Note: We don't clear the datasets map to allow retrieving past research
  }, []);
  
  // Add a method to get research data by ID
  const getResearchData = useCallback((id: string): ResearchData | null => {
    // First check if it's the current research
    if (researchId === id && researchData) {
      return researchData;
    }
    
    // Otherwise check in the stored datasets
    return researchDatasets.get(id) || null;
  }, [researchId, researchData, researchDatasets]);

  return (
    <ResearchContext.Provider
      value={{
        researchId,
        researchData,
        topicId,
        setResearchState,
        clearResearchState,
        getResearchData,
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
};