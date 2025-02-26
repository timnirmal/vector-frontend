// src/components/workflows/lead-qualification-workflow.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Download, FileSpreadsheet, ArrowLeft, Check, Filter } from 'lucide-react';
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';

type LeadStatus = 'New' | 'Qualified' | 'Unqualified';

interface BANT {
  budget: {
    score: number;
    notes: string;
  };
  authority: {
    score: number;
    notes: string;
  };
  need: {
    score: number;
    notes: string;
  };
  timeline: {
    score: number;
    notes: string;
  };
  totalScore: number;
}

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  score?: number;
  notes?: string;
  bant?: BANT;
}

export default function LeadQualificationWorkflow() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'John Smith',
      company: 'Acme Corp',
      email: 'john@acmecorp.com',
      phone: '555-123-4567',
      source: 'Website',
      status: 'New'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      company: 'Tech Solutions',
      email: 'sarah@techsolutions.com',
      phone: '555-987-6543',
      source: 'LinkedIn',
      status: 'New'
    },
    {
      id: '3',
      name: 'Michael Brown',
      company: 'Global Industries',
      email: 'michael@globalind.com',
      phone: '555-456-7890',
      source: 'Referral',
      status: 'New'
    }
  ]);
  const [processingLeads, setProcessingLeads] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      toast.success(`File uploaded successfully`);
      
      // Simulate adding new leads
      const newLeads: Lead[] = [
        {
          id: '4',
          name: 'Emily Wilson',
          company: 'Innovate Inc',
          email: 'emily@innovate.com',
          phone: '555-222-3333',
          source: 'CSV Import',
          status: 'New'
        },
        {
          id: '5',
          name: 'David Lee',
          company: 'Future Tech',
          email: 'david@futuretech.com',
          phone: '555-444-5555',
          source: 'CSV Import',
          status: 'New'
        }
      ];
      
      setLeads(prevLeads => [...prevLeads, ...newLeads]);
    }
  };

  const generateBANTAnalysis = (leadId: string): BANT => {
    // This would normally come from an API call based on the lead data
    // For demo purposes, we're generating random but plausible values
    
    // Generate scores between 1-10
    const budgetScore = Math.floor(Math.random() * 10) + 1;
    const authorityScore = Math.floor(Math.random() * 10) + 1;
    const needScore = Math.floor(Math.random() * 10) + 1;
    const timelineScore = Math.floor(Math.random() * 10) + 1;
    
    const totalScore = (budgetScore + authorityScore + needScore + timelineScore) / 4;
    
    return {
      budget: {
        score: budgetScore,
        notes: budgetScore > 7 
          ? "Has allocated budget for this quarter" 
          : "Budget not specifically allocated, but interested"
      },
      authority: {
        score: authorityScore,
        notes: authorityScore > 7 
          ? "Decision maker with purchasing authority" 
          : "Influencer, needs approval from management"
      },
      need: {
        score: needScore,
        notes: needScore > 7 
          ? "Expressed clear need and pain points" 
          : "Interested but not urgent need identified"
      },
      timeline: {
        score: timelineScore,
        notes: timelineScore > 7 
          ? "Looking to implement within 1-3 months" 
          : "No specific timeline, exploring options"
      },
      totalScore: parseFloat(totalScore.toFixed(1))
    };
  };

  const qualifyLeads = () => {
    if (selectedLeads.length === 0) {
      toast.error("Please select leads to qualify");
      return;
    }

    setIsProcessing(true);
    setProcessingLeads(selectedLeads);
    setProgressValue(0);
    
    // Animation interval for progress bar
    const interval = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    toast.promise(
      new Promise<void>((resolve) => {
        setTimeout(() => {
          setLeads(prevLeads => {
            return prevLeads.map(lead => {
              if (selectedLeads.includes(lead.id)) {
                // Simulate AI qualification logic
                const score = Math.floor(Math.random() * 100);
                const newStatus: LeadStatus = score > 60 ? 'Qualified' : 'Unqualified';
                
                return {
                  ...lead,
                  status: newStatus,
                  score: score,
                  notes: score > 60 
                    ? 'Good fit for our product/service. Recommend follow-up.' 
                    : 'Not a good fit at this time. Recommend nurturing.',
                  bant: newStatus === 'Qualified' ? generateBANTAnalysis(lead.id) : undefined
                };
              }
              return lead;
            });
          });
          
          setSelectedLeads([]);
          setIsProcessing(false);
          setProcessingLeads([]);
          clearInterval(interval);
          setProgressValue(100);
          resolve();

          // Reset progress bar after a delay
          setTimeout(() => {
            setProgressValue(0);
          }, 500);
        }, 2000);
      }),
      {
        loading: 'Qualifying leads...',
        success: 'Leads qualified successfully',
        error: 'Failed to qualify leads',
      }
    );
  };

  const toggleLeadSelection = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) 
        ? prev.filter(leadId => leadId !== id) 
        : [...prev, id]
    );
  };

  const selectAllLeads = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead.id));
    }
  };

  const openLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsSheetOpen(true);
  };

  const getBantScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Function to get classes for row based on processing state
  const getRowClasses = (leadId: string) => {
    if (processingLeads.includes(leadId)) {
      return 'cursor-pointer hover:bg-gray-50 bg-blue-50 animate-pulse';
    }
    return 'cursor-pointer hover:bg-gray-50';
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Lead Qualification Manager</h1>
          <p
            className="flex items-center cursor-pointer"
            onClick={() => router.push("/workflows")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workflows
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Leads
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Leads</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept=".csv,.xlsx"
                          className="hidden"
                          id="lead-upload"
                          onChange={handleFileUpload}
                        />
                        <label htmlFor="lead-upload" className="cursor-pointer">
                          <FileSpreadsheet className="h-8 w-8 mx-auto mb-4" />
                          <p>Drop CSV or Excel file or click to browse</p>
                        </label>
                      </div>
                      <Button onClick={() => document.getElementById('lead-upload')?.click()} className="w-full">
                        Select File
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  onClick={qualifyLeads} 
                  disabled={isProcessing || selectedLeads.length === 0}
                  className="ml-auto"
                >
                  {isProcessing ? (
                    <>
                      <motion.div 
                        className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Qualify Selected
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => toast.success("Template downloaded")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Qualifying leads...</span>
                    <span>{Math.min(progressValue, 100)}%</span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                </div>
              )}
              
              <ScrollArea className="h-[500px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input 
                          type="checkbox" 
                          checked={selectedLeads.length === leads.length && leads.length > 0}
                          onChange={selectAllLeads}
                          className="h-4 w-4"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow 
                        key={lead.id} 
                        className={getRowClasses(lead.id)}
                        onClick={() => lead.status === 'Qualified' && openLeadDetails(lead)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => toggleLeadSelection(lead.id)}
                            className="h-4 w-4"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {lead.name}
                            {lead.status === 'Qualified' && (
                              <motion.span
                                whileHover={{ scale: 1.1 }}
                                className="inline-block"
                              >
                                <Badge variant="outline" className="ml-2 cursor-pointer">
                                  View BANT
                                </Badge>
                              </motion.span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{lead.company}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.source}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              lead.status === 'Qualified' ? 'bg-green-100 text-green-800' :
                              lead.status === 'Unqualified' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }
                          >
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{lead.score || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BANT Analysis Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-hidden flex flex-col">
          <SheetHeader className="px-1">
            <SheetTitle>BANT Analysis</SheetTitle>
            <SheetDescription>
              {selectedLead?.name} - {selectedLead?.company}
            </SheetDescription>
          </SheetHeader>
          
          {/* ScrollArea around the content */}
          <ScrollArea className="flex-1 mt-6">
            <div className="pr-4 pb-8">
              {selectedLead?.bant && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">Overall BANT Score</h3>
                      <span className="text-xl font-bold">{selectedLead.bant.totalScore}/10</span>
                    </div>
                    <Progress 
                      value={selectedLead.bant.totalScore * 10} 
                      className="h-2"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Budget</h3>
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{selectedLead.bant.budget.notes}</p>
                      </div>
                      <div className="ml-4 flex items-center">
                        <div className={`h-6 w-6 rounded-full ${getBantScoreColor(selectedLead.bant.budget.score)} text-white flex items-center justify-center font-bold`}>
                          {selectedLead.bant.budget.score}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Authority</h3>
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{selectedLead.bant.authority.notes}</p>
                      </div>
                      <div className="ml-4 flex items-center">
                        <div className={`h-6 w-6 rounded-full ${getBantScoreColor(selectedLead.bant.authority.score)} text-white flex items-center justify-center font-bold`}>
                          {selectedLead.bant.authority.score}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Need</h3>
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{selectedLead.bant.need.notes}</p>
                      </div>
                      <div className="ml-4 flex items-center">
                        <div className={`h-6 w-6 rounded-full ${getBantScoreColor(selectedLead.bant.need.score)} text-white flex items-center justify-center font-bold`}>
                          {selectedLead.bant.need.score}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Timeline</h3>
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{selectedLead.bant.timeline.notes}</p>
                      </div>
                      <div className="ml-4 flex items-center">
                        <div className={`h-6 w-6 rounded-full ${getBantScoreColor(selectedLead.bant.timeline.score)} text-white flex items-center justify-center font-bold`}>
                          {selectedLead.bant.timeline.score}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="pt-4">
                    <h3 className="font-semibold mb-2">Recommendation</h3>
                    <div className="bg-gray-100 p-3 rounded-md text-sm">
                      {selectedLead.bant.totalScore >= 7 
                        ? "High priority lead. Schedule a follow-up call within 48 hours."
                        : selectedLead.bant.totalScore >= 5
                        ? "Medium priority lead. Provide additional information and check in next week."
                        : "Low priority lead. Add to nurturing campaign and re-evaluate in 3 months."
                      }
                    </div>
                  </div>

                  <Separator />

                  <div className="pt-4">
                    <h3 className="font-semibold mb-2">Additional Insights</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium">Company Size</h4>
                        <p className="text-sm text-gray-600">Mid-size enterprise, 100-500 employees</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Industry</h4>
                        <p className="text-sm text-gray-600">Technology / Software</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Key Technologies</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="secondary" className="text-xs">React</Badge>
                          <Badge variant="secondary" className="text-xs">Node.js</Badge>
                          <Badge variant="secondary" className="text-xs">AWS</Badge>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Previous Interactions</h4>
                        <ul className="text-sm text-gray-600 list-disc pl-5 mt-1">
                          <li>Downloaded whitepaper (2 weeks ago)</li>
                          <li>Attended webinar (1 month ago)</li>
                          <li>Visited pricing page 3 times</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex justify-end py-4 border-t mt-auto">
            <Button onClick={() => setIsSheetOpen(false)}>
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}