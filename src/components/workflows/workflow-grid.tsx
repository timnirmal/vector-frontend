'use client';

import { useState, useEffect } from 'react';
import { WorkflowCard } from './workflow-card';
import type { Workflow } from '@/lib/types';

const DEMO_WORKFLOWS: Workflow[] = [
  {
    id: 1,
    title: 'Data Analysis Workflow',
    description: 'Analyze and process data using AI agents',
    type: 'analysis',
    status: 'active',
  },
  {
    id: 2,
    title: 'Conversation Chain',
    description: 'Multi-agent conversation simulation',
    type: 'conversation',
    status: 'active',
  },
  {
    id: 3,
    title: 'Decision Making Pipeline',
    description: 'AI-powered decision making process',
    type: 'decision',
    status: 'active',
  },
];

export const WorkflowGrid = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = (id: number) => {
    window.location.href = `/workflows/${id}`;
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Select a Workflow</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_WORKFLOWS.map((workflow) => (
            <WorkflowCard 
              key={workflow.id} 
              workflow={workflow} 
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};