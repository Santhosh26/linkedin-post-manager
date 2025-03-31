// src/components/topics/TopicsList.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PenSquare, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/buttonAdapter';
import { Card, CardHeader, CardContent } from '@/components/ui/cardAdapter';
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Topic {
  id: string;
  name: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

interface TopicsListProps {
  topics: Topic[];
  onDelete: (id: string) => void;
}

const TopicsList = ({ topics, onDelete }: TopicsListProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Filter topics based on search term
  const filteredTopics = topics.filter(topic => 
    topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle delete with confirmation and toast notification
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the topic "${name}"?`)) {
      try {
        setDeletingId(id);
        await onDelete(id);
        toast({
          title: "Topic Deleted",
          description: `"${name}" has been deleted successfully.`,
        });
      } catch (error) {
        console.error('Error deleting topic:', error);
        toast({
          title: "Deletion Failed",
          description: error instanceof Error ? error.message : "Failed to delete topic",
          variant: "destructive",
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <Card>
      <CardHeader 
        title="Your Topics" 
        action={
          <Link href="/topics/new">
            <Button variant='default'>New Topic</Button>
          </Link>
        }
      />
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search topics or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredTopics.length > 0 ? (
          <div className="overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-gray-100">
                    <TableHead className="text-sm font-medium text-gray-600 bg-gray-50 py-3">Topic</TableHead>
                    <TableHead className="text-sm font-medium text-gray-600 bg-gray-50 py-3">Keywords</TableHead>
                    <TableHead className="text-sm font-medium text-gray-600 bg-gray-50 py-3">Created</TableHead>
                    <TableHead className="text-right text-sm font-medium text-gray-600 bg-gray-50 py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTopics.map((topic) => (
                    <TableRow key={topic.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
                      <TableCell className="py-4 text-sm font-medium text-gray-900">
                        {topic.name}
                      </TableCell>
                      <TableCell className="py-4 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {topic.keywords.map((keyword, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-500">
                        {new Date(topic.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/topics/${topic.id}/research`}>
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                              <Search className="h-4 w-4 mr-1" />
                              Research
                            </Button>
                          </Link>
                          <Link href={`/topics/${topic.id}`}>
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                              <PenSquare className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(topic.id, topic.name)}
                            disabled={deletingId === topic.id}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {deletingId === topic.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-[1rem] shadow-bubble border border-gray-200">
            <p className="text-gray-500 mb-4">
              {topics.length === 0
                ? "You haven't created any topics yet."
                : "No topics match your search."}
            </p>
            {topics.length === 0 && (
              <Link href="/topics/new">
                <Button>Create Your First Topic</Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopicsList;