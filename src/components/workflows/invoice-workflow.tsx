'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  Upload,
  Download,
  ArrowLeft,
  Plus,
  File,
  FileText,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import InvoiceDetailsModal from './InvoiceDetailsModal';

interface InvoiceData {
  id: string;
  category: string;
  description: string;
  vendor: string;
  amount: string;
  status: 'processed' | 'pending' | 'error' | 'unprocessed';
  date: string;
  fileName: string;
  // Optional additional details for modal preview
  invoice_number?: string;
  payment_terms?: string;
  due_date?: string;
  po_number?: string;
  notes?: string;
  line_items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
}

export default function InvoiceWorkflow() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processedData, setProcessedData] = useState<InvoiceData[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      setFiles(selectedFiles);
      // Initialize progress for each file
      const initialProgress: { [key: string]: number } = {};
      selectedFiles.forEach((file) => {
        initialProgress[file.name] = 0;
        // Create an entry in processedData for each file immediately
        const newInvoice: InvoiceData = {
          id: `pending-${Date.now()}-${Math.random()}`,
          category: 'Pending',
          description: 'Processing...',
          vendor: 'Pending',
          amount: 'Pending',
          status: 'pending',
          date: new Date().toISOString().split('T')[0],
          fileName: file.name,
        };
        setProcessedData((prev) => [...prev, newInvoice]);
      });
      setUploadProgress(initialProgress);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one invoice to upload');
      return;
    }

    setIsUploading(true);

    try {
      // Create a FormData object for batch processing
      const formData = new FormData();
      // Append all files to the FormData
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Send all files in a single batch request
      const response = await fetch(
        'https://api.know360.io/finance_agent/process-invoices-batch/',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upload invoices`);
      }

      // Get the job ID from the response
      const { job_id } = await response.json();
      console.log('Batch job started with ID:', job_id);

      // Store file names for later matching
      const pendingFileNames = files.map((file) => file.name);
      toast.success(`${files.length} invoice(s) uploaded. Processing started...`);

      // Start polling for job status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(
            `https://api.know360.io/finance_agent/job-status/${job_id}`
          );
          if (!statusResponse.ok) {
            throw new Error(`Failed to get job status`);
          }
          const statusData = await statusResponse.json();
          console.log('Job status:', statusData);

          // If job is not found, has error, or is completed, stop polling
          if (statusData.error || statusData.status === 'completed' || statusData.status === 'failed') {
            clearInterval(pollInterval);
            if (statusData.error) {
              toast.error(`Error processing invoices: ${statusData.error}`);
              // Update affected entries to error state
              setProcessedData((prev) =>
                prev.map((item) => {
                  if (item.status === 'pending' && pendingFileNames.includes(item.fileName)) {
                    return {
                      ...item,
                      status: 'error',
                      description: `Error: ${statusData.error}`,
                    };
                  }
                  return item;
                })
              );
            } else if (statusData.status === 'failed') {
              toast.error('Failed to process invoices');
              setProcessedData((prev) =>
                prev.map((item) => {
                  if (item.status === 'pending' && pendingFileNames.includes(item.fileName)) {
                    return {
                      ...item,
                      status: 'error',
                      description: 'Processing failed - Please try again',
                    };
                  }
                  return item;
                })
              );
            } else if (statusData.status === 'completed') {
              if (statusData.result?.categorized_data && Array.isArray(statusData.result.categorized_data)) {
                // Group entries by filename to consolidate line items
                const fileGroups = statusData.result.categorized_data.reduce((acc: any, data: any) => {
                  if (!acc[data.FileName]) {
                    acc[data.FileName] = [];
                  }
                  acc[data.FileName].push(data);
                  return acc;
                }, {});

                // Update all pending entries in a single state update
                setProcessedData((prev) =>
                  prev.map((item) => {
                    if (item.status === 'pending' && pendingFileNames.includes(item.fileName)) {
                      const entries = fileGroups[item.fileName];
                      if (!entries || entries.length === 0) {
                        return {
                          ...item,
                          status: 'error',
                          description: 'No processing result found',
                        };
                      }
                      const firstEntry = entries[0];
                      const descriptions = entries.map((entry: any) => entry.Description).join(', ');
                      // Convert entries to line items (using correct keys)
                      const line_items = entries.map((entry: any) => ({
                        description: entry.Description || '',
                        quantity: parseFloat(entry.Quantity) || 1,
                        unit_price: parseFloat(entry.Unit_Price) || 0,
                        amount: parseFloat(entry.Total_Price) || 0,
                      }));
                      return {
                        ...item,
                        category: firstEntry.Debit_Account || 'Not Extracted',
                        description: descriptions,
                        vendor: firstEntry['Vendor Account'] || 'Not Extracted',
                        amount: firstEntry.Total ? `$${firstEntry.Total}` : '-',
                        status: 'processed',
                        date: firstEntry['Invoice Date'] || item.date,
                        // Optionally include additional details
                        invoice_number: firstEntry['Invoice Number'] || 'N/A',
                        due_date: firstEntry['Due Date'] || 'N/A',
                        po_number: firstEntry['PO Number'] || 'N/A',
                        line_items: line_items,
                      };
                    }
                    return item;
                  })
                );
                const processedCount = statusData.result.categorized_data.length;
                toast.success(`${processedCount} invoice(s) processed successfully`);
              } else {
                toast.warning('Processing completed but no results returned');
                setProcessedData((prev) =>
                  prev.map((item) => {
                    if (item.status === 'pending' && pendingFileNames.includes(item.fileName)) {
                      return {
                        ...item,
                        status: 'error',
                        description: 'No processing results available',
                      };
                    }
                    return item;
                  })
                );
              }
            }
            setIsUploading(false);
          } else if (statusData.status === 'pending' || statusData.status === 'processing') {
            if (statusData.progress) {
              console.log(`Processing progress: ${statusData.progress}%`);
            }
          }
        } catch (error) {
          console.error('Error checking job status:', error);
          clearInterval(pollInterval);
          toast.error('Error checking processing status');
          setIsUploading(false);
        }
      }, 5000); // Poll every 5 seconds

      // Stop polling after 5 minutes to prevent infinite polling
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isUploading) {
          setIsUploading(false);
          toast.error('Processing timed out. Please check status later.');
        }
      }, 5 * 60 * 1000);
    } catch (error) {
      console.error(error);
      toast.error('Error uploading invoice(s)');
      setIsUploading(false);
    } finally {
      // Reset file state and close the dialog.
      setFiles([]);
      setIsDialogOpen(false);
    }
  };

  const processSelectedInvoices = () => {
    const invoicesToProcess =
      selectedRows.length > 0
        ? selectedRows
        : processedData.filter((item) => item.status === 'unprocessed').map((item) => item.id);

    if (invoicesToProcess.length === 0) {
      toast.error('No unprocessed invoices to process');
      return;
    }

    setIsProcessing(true);

    // Update status to pending for selected invoices
    setProcessedData((prev) =>
      prev.map((item) => {
        if (invoicesToProcess.includes(item.id) && (item.status === 'unprocessed' || item.status === 'error')) {
          return {
            ...item,
            status: 'pending',
          };
        }
        return item;
      })
    );

    // Simulate processing
    setTimeout(() => {
      setProcessedData((prev) =>
        prev.map((item) => {
          if (invoicesToProcess.includes(item.id) && item.status === 'pending') {
            return {
              ...item,
              category: ['Professional Services', 'Office Supplies', 'Travel', 'Software/IT'][
                Math.floor(Math.random() * 4)
              ],
              vendor: ['Acme Corp', 'TechSolutions', 'Global Industries', 'Office Depot'][
                Math.floor(Math.random() * 4)
              ],
              amount: `$${(Math.random() * 1000).toFixed(2)}`,
              status: 'processed' as const,
            };
          }
          return item;
        })
      );

      setIsProcessing(false);
      setSelectedRows([]);
      toast.success(`${invoicesToProcess.length} invoice(s) processed successfully`);
    }, 3000);
  };

  const handleDeleteInvoice = (id: string) => {
    setProcessedData((prev) => prev.filter((item) => item.id !== id));
    setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    toast.success('Invoice removed');
  };

  // Use this function to preview invoice details (opens the modal)
  const handlePreviewInvoice = (invoice: InvoiceData) => {
    setSelectedInvoice(invoice);
    setIsDetailsModalOpen(true);
  };

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const toggleAllRows = () => {
    if (selectedRows.length === processedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(processedData.map((item) => item.id));
    }
  };

  // Count of unprocessed invoices
  const unprocessedCount = processedData.filter(
    (item) => item.status === 'unprocessed' || item.status === 'error'
  ).length;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Invoice Automation Agent</h1>
          <p className="flex items-center cursor-pointer" onClick={() => router.push('/workflows')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workflows
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <h2 className="text-xl font-bold">Invoice List</h2>
                  {unprocessedCount > 0 && (
                    <Badge className="ml-2 bg-blue-100 text-blue-800">
                      {unprocessedCount} unprocessed
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Upload New Invoices
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Invoices</DialogTitle>
                        <DialogDescription>Select PDF invoices to upload</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <input
                            type="file"
                            multiple
                            accept=".pdf"
                            className="hidden"
                            id="invoice-upload"
                            onChange={handleFileSelect}
                          />
                          <label htmlFor="invoice-upload" className="cursor-pointer">
                            <Upload className="h-8 w-8 mx-auto mb-4" />
                            <p>Drop PDF invoices here or click to browse</p>
                          </label>
                        </div>
                        {files.length > 0 && (
                          <div className="mt-4">
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {files.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                >
                                  <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setFiles((prev) => prev.filter((_, i) => i !== index))
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                              {files.length} file(s) selected
                            </p>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpload} disabled={isUploading || files.length === 0}>
                          {isUploading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            'Upload Invoices'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="default"
                    onClick={processSelectedInvoices}
                    disabled={isProcessing || (selectedRows.length === 0 && unprocessedCount === 0)}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Process {selectedRows.length > 0 ? `Selected (${selectedRows.length})` : 'All'}
                      </>
                    )}
                  </Button>

                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
              {processedData.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Processed Invoices</h3>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        setProcessedData([]);
                        setSelectedRows([]);
                      }}
                    >
                      <RefreshCw size={16} />
                      Clear All
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedData.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.fileName}</TableCell>
                          <TableCell>{invoice.vendor}</TableCell>
                          <TableCell>{invoice.category}</TableCell>
                          <TableCell>{invoice.amount}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                invoice.status === 'processed'
                                  ? 'default'
                                  : invoice.status === 'error'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{invoice.date}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {/* Use handlePreviewInvoice to open the details modal */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePreviewInvoice(invoice)}
                              >
                                <Eye size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setProcessedData((prev) =>
                                    prev.filter((item) => item.id !== invoice.id)
                                  )
                                }
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-8 text-center text-muted-foreground">
                  <File size={48} />
                  <div>
                    <p className="text-lg font-medium">No invoices processed</p>
                    <p>Upload some invoices to get started</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        invoice={selectedInvoice}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}
