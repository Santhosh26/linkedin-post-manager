// src/app/posts/new/page.tsx
'use client';

import DashboardLayout from '@/components/layout/ClientDashboardLayout';
import PostForm from '@/components/posts/PostForm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewPostPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">New Post</h1>
          <p className="text-muted-foreground mt-1">Create and publish a new LinkedIn post</p>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <CardContent>
            <PostForm />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}