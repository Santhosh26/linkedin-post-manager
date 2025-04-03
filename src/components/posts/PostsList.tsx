//src\components\posts\PostsList.tsx

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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [topicFilter, setTopicFilter] = useState<string>('ALL_TOPICS');

  // Filter posts based on search term and filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter && statusFilter !== 'ALL' ? post.status === statusFilter : true;
    
    const matchesTopic = topicFilter && topicFilter !== 'ALL_TOPICS'
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

  // Get status badge variant
  const getStatusBadgeClassName = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-muted text-muted-foreground border';
      case 'SCHEDULED':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-100 dark:border-amber-800';
      case 'PUBLISHED':
        return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-100 dark:border-green-800';
      default:
        return '';
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
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              className="pl-10"
              placeholder="Search posts or hashtags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="pl-10">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                </div>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Drafts</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Topic Filter */}
          <div className="relative">
            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger className="pl-10">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                </div>
                <SelectValue placeholder="All Topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_TOPICS">All Topics</SelectItem>
                {topics.map(topic => (
                  <SelectItem key={topic.id} value={topic.name}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">
                        <div className="max-w-xl post-content">
                          <p className="line-clamp-2">{post.content}</p>
                          {post.hashtags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {post.hashtags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {post.hashtags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{post.hashtags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getStatusBadgeClassName(post.status)}`}>
                          {getStatusIcon(post.status)}
                          {post.status}
                        </span>
                        {post.status === 'SCHEDULED' && post.scheduledFor && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {new Date(post.scheduledFor).toLocaleString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{post.topic ? post.topic.name : '-'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {post.status === 'PUBLISHED' && post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : new Date(post.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/posts/${post.id}`} className="flex items-center">
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            {post.linkedinPostUrl && (
                              <DropdownMenuItem asChild>
                                <a 
                                  href={post.linkedinPostUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="flex items-center"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" /> View on LinkedIn
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive focus:bg-destructive/10"
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
          <div className="text-center py-8 bg-card rounded-lg border">
            <p className="text-muted-foreground mb-4">
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