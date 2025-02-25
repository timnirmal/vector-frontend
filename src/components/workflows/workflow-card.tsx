'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Workflow } from '@/lib/types';

interface WorkflowCardProps {
  workflow: Workflow;
  onSelect: (id: number) => void;
}

export const WorkflowCard = ({ workflow, onSelect }: WorkflowCardProps) => (
  <Card 
    className="hover:shadow-lg transition-shadow cursor-pointer"
    onClick={() => onSelect(workflow.id)}
  >
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="h-6 w-6 bg-blue-100 rounded-full" />
        <ArrowRight className="h-5 w-5 text-gray-400" />
      </div>
      <CardTitle className="text-xl mt-4">{workflow.title}</CardTitle>
      <CardDescription>{workflow.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button variant="outline" className="w-full">
        Launch Workflow
      </Button>
    </CardContent>
  </Card>
);