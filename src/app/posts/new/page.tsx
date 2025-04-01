// src/app/posts/new/page.tsx
'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import PostForm from '@/components/posts/PostForm';

export default function NewPostPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Create New Post</h1>
        <PostForm />
      </div>
    </DashboardLayout>
  );
}