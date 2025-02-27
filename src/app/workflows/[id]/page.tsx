// src/app/workflows/[id]/page.tsx
'use client';

import { use } from 'react';
import { Navbar } from '@/components/nav/navbar';
import { usePathname } from 'next/navigation';
import InsuranceWorkflow from '@/components/workflows/insurance-workflow';
import InvoiceWorkflow from '@/components/workflows/invoice-workflow';
import JobFollowupWorkflow from '@/components/workflows/job-followup-workflow';
import LeadQualificationWorkflow from '@/components/workflows/lead-qualification-workflow';

// Define the params interface
interface WorkflowParams {
  id: string;
}

export default function WorkflowPage() {
  const pathname = usePathname(); // ✅ Get the full pathname
  const workflowId = pathname.split('/').pop(); // ✅ Extract the last part as `id`

  const renderWorkflow = () => {
    switch (workflowId) {
      case 'insurance':
        return <InsuranceWorkflow />;
      case 'invoice':
        return <InvoiceWorkflow />;
      case 'job-followup':
        return <JobFollowupWorkflow />;
      case 'lead-qualification':
        return <LeadQualificationWorkflow />;
      default:
        return <div className="p-8 text-center">Workflow not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#DEE6E5] pt-20">
      {renderWorkflow()}
    </div>
  );
}