// src/app/workflows/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight, FileText, Receipt, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const WORKFLOWS = [
  {
    id: 'insurance',
    title: 'Insurance Claims Agent',
    description: 'AI-powered insurance claim analysis and damage assessment',
    icon: FileText,
  },
  {
    id: 'lead-qualification',
    title: 'Lead Qualification Agent',
    description: 'Analyze and qualify sales leads automatically',
    icon: Users,
  },
  {
    id: 'invoice',
    title: 'Invoice Automation Agent',
    description: 'Automated invoice processing and categorization system',
    icon: Receipt,
  },
  {
    id: 'job-followup',
    title: 'Interview Follow-up Agent',
    description: 'CV analysis and Job interview management system',
    icon: Briefcase,
  },
];

import JobWizardWorkflow from "@/components/workflows/job-followup";

export default function WorkflowsPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleWorkflowClick = (id: string) => {
    window.location.href = `/workflows/${id}`;
  };

  // Animation variants for cards
  const containerVariants = {
    hidden: {
      opacity: 1,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  // Animation variants for title section
  const titleVariants = {
    hidden: { y: -30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen p-8 flex justify-center items-center bg-[#DEE6E5]">
      <main>
        <div className="max-w-6xl mx-auto my-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={titleVariants}
          >
            <img
              src="/v.svg"
              alt="Workflow Automation"
              className="w-16 m-auto"
            />
            <h1 className="text-3xl font-bold mt-4 tracking-tight">
              Hi There, Welcome to Vector
            </h1>
            <p className="text-lg mb-8 opacity-70">
              Select any workflow to experience the power of automated agent workflows
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {WORKFLOWS.map((workflow) => (
              <motion.div 
                className="relative" 
                key={workflow.id}
                variants={cardVariants}
                onMouseEnter={() => setHoveredCard(workflow.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Card 
                  className="cursor-pointer"
                  onClick={() => handleWorkflowClick(workflow.id)}
                >
                  <CardHeader>
                    <motion.div 
                      className="flex items-center justify-center"
                      animate={{ 
                        scale: hoveredCard === workflow.id ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <workflow.icon className="h-6 w-6 mb-4" />
                    </motion.div>
                    <h3 className="text-xl mt-4 font-bold">{workflow.title}</h3>
                    <CardDescription>{workflow.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button className="w-full">
                        Launch Workflow
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
                <motion.div 
                  className="absolute top-0 right-0 w-8 h-8"
                  style={{
                    clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
                    background: '#dde6e5'
                  }}
                  animate={{
                    rotate: hoveredCard === workflow.id ? 5 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}