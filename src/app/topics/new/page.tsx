// src/app/topics/new/page.tsx
'use client';

import DashboardLayout from '@/components/layout/ClientDashboardLayout';
import TopicForm from '@/components/topics/TopicForm';

export default function NewTopicPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Create New Topic</h1>
        <TopicForm />
      </div>
    </DashboardLayout>
  );
}