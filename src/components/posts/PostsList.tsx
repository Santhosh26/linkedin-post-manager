'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle, 
  PenSquare,
  MoreHorizontal, 
  Edit, 
  Trash2, 
  ExternalLink 
} from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from '@/components/ui/buttonAdapter';
import { Card, CardHeader, CardContent } from '@/components/ui/cardAdapter';

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface Topic {
  id: string;
  name: string;
}

interface Post {
  id: string;
  content: string;
  hashtags: string[];
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
  scheduledFor?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  topic?: {
    name: string;
  };
  linkedinPostUrl?: string;
}

interface PostsListProps {
  posts: Post[];
  topics: Topic[];
  onDelete: (id: string) => void;
}

const PostsList = ({ posts, topics, onDelete }: PostsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [topicFilter, setTopicFilter] = useState<string>('');

  // Filter posts based on search term and filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter ? post.status === statusFilter : true;
    
    const matchesTopic = topicFilter 
      ? post.topic && post.topic.name.toLowerCase() === topicFilter.toLowerCase()
      : true;
    
    return matchesSearch && matchesStatus && matchesTopic;
  });

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <PenSquare className="h-4 w-4 mr-1" />;
      case 'SCHEDULED':
        return <Calendar className="h-4 w-4 mr-1" />;
      case 'PUBLISHED':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader 
        title="Your Posts" 
        action={
          <Link href="/posts/new">
            <Button>Create Post</Button>
          </Link>
        }
      />
      <CardContent>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-foreground dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500
                       hover:border-gray-400 dark:hover:border-gray-600 transition-all
                       sm:text-sm"
              placeholder="Search posts or hashtags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-foreground dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500
                       hover:border-gray-400 dark:hover:border-gray-600 transition-all
                       sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Drafts</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>

          {/* Topic Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-foreground dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500
                       hover:border-gray-400 dark:hover:border-gray-600 transition-all
                       sm:text-sm"
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
            >
              <option value="">All Topics</option>
              {topics.map(topic => (
                <option key={topic.id} value={topic.name}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-700">
                    <TableHead className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 py-3">Content</TableHead>
                    <TableHead className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 py-3">Status</TableHead>
                    <TableHead className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 py-3">Topic</TableHead>
                    <TableHead className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 py-3">Date</TableHead>
                    <TableHead className="text-right text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <TableCell className="py-4 text-sm font-medium">
                        <div className="max-w-xl post-content">
                          <p className="line-clamp-2 text-foreground dark:text-gray-100">{post.content}</p>
                          {post.hashtags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {post.hashtags.slice(0, 3).map((tag, index) => (
                                <span 
                                  key={index} 
                                  className="tag inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.hashtags.length > 3 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-600">
                                  +{post.hashtags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm">
                        <span 
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                            post.status === 'DRAFT' 
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600' 
                              : post.status === 'SCHEDULED' 
                              ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800' 
                              : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800'
                          }`}
                        >
                          {getStatusIcon(post.status)}
                          {post.status}
                        </span>
                        {post.status === 'SCHEDULED' && post.scheduledFor && (
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {new Date(post.scheduledFor).toLocaleString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-500 dark:text-gray-400">{post.topic ? post.topic.name : '-'}</TableCell>
                      <TableCell className="py-4 text-sm text-gray-500 dark:text-gray-400">
                        {post.status === 'PUBLISHED' && post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : new Date(post.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="dropdown-menu border border-gray-200 dark:border-gray-700 shadow-sm">
                            <DropdownMenuLabel className="text-sm text-gray-600 dark:text-gray-300">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-700" />
                            <DropdownMenuItem asChild className="dropdown-item">
                              <Link href={`/posts/${post.id}`} className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            {post.linkedinPostUrl && (
                              <DropdownMenuItem asChild className="dropdown-item">
                                <a 
                                  href={post.linkedinPostUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" /> View on LinkedIn
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" 
                              onClick={() => onDelete(post.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-[1rem] shadow-bubble border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {posts.length === 0
                ? "You haven't created any posts yet."
                : "No posts match your search criteria."}
            </p>
            {posts.length === 0 && (
              <Link href="/posts/new">
                <Button>Create Your First Post</Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostsList;