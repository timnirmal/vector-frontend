// src/components/workflows/lead-qualification-workflow.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Download, FileSpreadsheet, ArrowLeft, Check, Filter, RefreshCw } from 'lucide-react';
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

interface ResearchData {
  companySize?: string;
  industry?: string;
  technologies?: string[];
  interactions?: string[];
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
  research?: ResearchData;
}

// API base URL
const API_BASE_URL = 'https://api.know360.io/lead_qualification_agent';

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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [researchData, setResearchData] = useState<Record<string, any>>({});
  const [isLoadingResearch, setIsLoadingResearch] = useState(false);

  // Fetch all research data on component mount
  useEffect(() => {
    fetchAllResearch();
  }, []);

  const fetchAllResearch = async () => {
    try {
      setIsLoadingResearch(true);
      const response = await fetch(`${API_BASE_URL}/research/`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch research: ${response.status}`);
      }
      
      const data = await response.json();
      setResearchData(data);
    } catch (error) {
      console.error('Error fetching research:', error);
      toast.error('Failed to fetch research data');
    } finally {
      setIsLoadingResearch(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      
      setIsUploading(true);
      
      try {
        // Upload the CSV file to the API
        const response = await fetch(`${API_BASE_URL}/upload-csv/`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload: ${response.status}`);
        }
        
        const result = await response.json();
        toast.success('File uploaded successfully');
        
        // Refresh research data after upload
        await fetchAllResearch();
        
        // Create new leads from the uploaded data
        try {
          const newLeads: Lead[] = [];
          
          // Check if result has the expected structure
          if (result.companies && typeof result.companies === 'object') {
            Object.entries(result.companies).forEach(([companyName, data]: [string, any], index) => {
              if (companyName && typeof data === 'object') {
                newLeads.push({
                  id: `uploaded-${Date.now()}-${index}`,
                  name: data.contact_name || 'Unknown Contact',
                  company: companyName,
                  email: data.contact_email || `contact@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
                  phone: data.contact_phone || 'N/A',
                  source: 'CSV Import',
                  status: 'New'
                });
              }
            });
          } else if (Array.isArray(result)) {
            // Handle array response format
            result.forEach((item, index) => {
              if (item && item.company) {
                newLeads.push({
                  id: `uploaded-${Date.now()}-${index}`,
                  name: item.contact_name || 'Unknown Contact',
                  company: item.company,
                  email: item.email || `contact@${item.company.toLowerCase().replace(/\s+/g, '')}.com`,
                  phone: item.phone || 'N/A',
                  source: 'CSV Import',
                  status: 'New'
                });
              }
            });
          }
          
          if (newLeads.length > 0) {
            setLeads(prevLeads => [...prevLeads, ...newLeads]);
            toast.success(`Added ${newLeads.length} new leads`);
          } else {
            toast.warning('No valid leads found in the uploaded file');
          }
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          toast.error('Failed to process the uploaded data');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('Failed to upload file');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const fetchCompanyResearch = async (companyName: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/research/${encodeURIComponent(companyName)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch company research: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching research for ${companyName}:`, error);
      return null;
    }
  };

  const generateBANTAnalysis = (leadData: any): BANT => {
    // Extract BANT scores from research data if available
    let budgetScore = leadData?.budget_score || Math.floor(Math.random() * 10) + 1;
    let authorityScore = leadData?.authority_score || Math.floor(Math.random() * 10) + 1;
    let needScore = leadData?.need_score || Math.floor(Math.random() * 10) + 1;
    let timelineScore = leadData?.timeline_score || Math.floor(Math.random() * 10) + 1;
    
    // Ensure scores are in valid range
    budgetScore = Math.min(Math.max(budgetScore, 1), 10);
    authorityScore = Math.min(Math.max(authorityScore, 1), 10);
    needScore = Math.min(Math.max(needScore, 1), 10);
    timelineScore = Math.min(Math.max(timelineScore, 1), 10);
    
    const totalScore = (budgetScore + authorityScore + needScore + timelineScore) / 4;
    
    return {
      budget: {
        score: budgetScore,
        notes: leadData?.budget_notes || (budgetScore > 7 
          ? "Has allocated budget for this quarter" 
          : "Budget not specifically allocated, but interested")
      },
      authority: {
        score: authorityScore,
        notes: leadData?.authority_notes || (authorityScore > 7 
          ? "Decision maker with purchasing authority" 
          : "Influencer, needs approval from management")
      },
      need: {
        score: needScore,
        notes: leadData?.need_notes || (needScore > 7 
          ? "Expressed clear need and pain points" 
          : "Interested but not urgent need identified")
      },
      timeline: {
        score: timelineScore,
        notes: leadData?.timeline_notes || (timelineScore > 7 
          ? "Looking to implement within 1-3 months" 
          : "No specific timeline, exploring options")
      },
      totalScore: parseFloat(totalScore.toFixed(1))
    };
  };

  const extractResearchData = (companyData: any): ResearchData => {
    return {
      companySize: companyData?.company_size || 'Unknown',
      industry: companyData?.industry || 'Unknown',
      technologies: companyData?.technologies || [],
      interactions: companyData?.interactions || []
    };
  };

  const qualifyLeads = async () => {
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
        return prev + 2;
      });
    }, 100);

    try {
      // Process each lead sequentially
      const updatedLeads = [...leads];
      
      for (let i = 0; i < selectedLeads.length; i++) {
        const leadId = selectedLeads[i];
        const leadIndex = updatedLeads.findIndex(l => l.id === leadId);
        
        if (leadIndex !== -1) {
          const lead = updatedLeads[leadIndex];
          
          // Fetch company research data if available
          let companyData = researchData[lead.company.toLowerCase()] || null;
          
          // If not in cache, try to fetch it
          if (!companyData) {
            companyData = await fetchCompanyResearch(lead.company);
          }
          
          // Calculate qualification score based on research data
          let score = 0;
          if (companyData) {
            // Use data to calculate score (implement your scoring logic here)
            score = companyData.qualification_score || 
                    (Math.floor(Math.random() * 40) + 60); // Fallback scoring (60-100)
          } else {
            // No research data, use random score
            score = Math.floor(Math.random() * 100);
          }
          
          const newStatus: LeadStatus = score > 60 ? 'Qualified' : 'Unqualified';
          
          // Update lead with qualification data
          updatedLeads[leadIndex] = {
            ...lead,
            status: newStatus,
            score: score,
            notes: score > 60 
              ? 'Good fit for our product/service. Recommend follow-up.' 
              : 'Not a good fit at this time. Recommend nurturing.',
            bant: newStatus === 'Qualified' ? generateBANTAnalysis(companyData) : undefined,
            research: companyData ? extractResearchData(companyData) : undefined
          };
        }
        
        // Update progress for each lead processed
        setProgressValue((i + 1) / selectedLeads.length * 100);
      }
      
      // Update state with all processed leads
      setLeads(updatedLeads);
      toast.success('Leads qualified successfully');
    } catch (error) {
      console.error('Error qualifying leads:', error);
      toast.error('Failed to qualify leads');
    } finally {
      setSelectedLeads([]);
      setIsProcessing(false);
      setProcessingLeads([]);
      clearInterval(interval);
      setProgressValue(100);
      
      // Reset progress bar after a delay
      setTimeout(() => {
        setProgressValue(0);
      }, 500);
    }
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

  // Generate CSV template for download
  const downloadTemplate = () => {
    const headers = 'Company Name,Contact Name,Contact Email,Contact Phone,Industry,Company Size,Annual Revenue,Website\n';
    const sampleRow = 'Acme Inc,John Doe,john@acmeinc.com,555-123-4567,Technology,100-500,10000000,https://acmeinc.com';
    const csvContent = headers + sampleRow;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Template downloaded");
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
                          disabled={isUploading}
                        />
                        <label htmlFor="lead-upload" className="cursor-pointer">
                          <FileSpreadsheet className="h-8 w-8 mx-auto mb-4" />
                          <p>Drop CSV or Excel file or click to browse</p>
                        </label>
                      </div>
                      <Button 
                        onClick={() => document.getElementById('lead-upload')?.click()} 
                        className="w-full"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <motion.div 
                              className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Uploading...
                          </>
                        ) : (
                          'Select File'
                        )}
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
                  onClick={downloadTemplate}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={fetchAllResearch}
                  disabled={isLoadingResearch}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingResearch ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
              </div>
              
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Qualifying leads...</span>
                    <span>{Math.min(progressValue, 100).toFixed(0)}%</span>
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
                            disabled={lead.status !== 'New'}
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

                  {selectedLead.research && (
                    <>
                      <Separator />

                      <div className="pt-4">
                        <h3 className="font-semibold mb-2">Company Research</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium">Company Size</h4>
                            <p className="text-sm text-gray-600">{selectedLead.research.companySize}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Industry</h4>
                            <p className="text-sm text-gray-600">{selectedLead.research.industry}</p>
                          </div>
                          {selectedLead.research.technologies && selectedLead.research.technologies.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium">Key Technologies</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedLead.research.technologies.map((tech, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">{tech}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedLead.research.interactions && selectedLead.research.interactions.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium">Previous Interactions</h4>
                              <ul className="text-sm text-gray-600 list-disc pl-5 mt-1">
                                {selectedLead.research.interactions.map((interaction, index) => (
                                  <li key={index}>{interaction}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
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