// src/components/workflows/invoice-workflow.tsx
'use client';

import React, {useState} from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
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
    RefreshCw
} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {Badge} from "@/components/ui/badge";
import {toast} from "sonner";

interface InvoiceData {
    id: string;
    category: string;
    description: string;
    vendor: string;
    amount: string;
    status: 'processed' | 'pending' | 'error' | 'unprocessed';
    date: string;
    fileName: string;
}

export default function InvoiceWorkflow() {
    const router = useRouter();
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [processedData, setProcessedData] = useState<InvoiceData[]>([
        {
            id: '1',
            category: 'Professional Services',
            description: 'Consulting Services',
            vendor: 'Acme Corp',
            amount: '$1,000.00',
            status: 'processed',
            date: '2023-04-15',
            fileName: 'invoice-acme-001.pdf'
        },
        {
            id: '2',
            category: 'Office Supplies',
            description: 'Monthly Office Supplies',
            vendor: 'Office Depot',
            amount: '$243.50',
            status: 'processed',
            date: '2023-04-10',
            fileName: 'invoice-office-depot-123.pdf'
        },
        {
            id: '3',
            category: 'Software/IT',
            description: 'Cloud Services Subscription',
            vendor: 'AWS',
            amount: '$520.75',
            status: 'unprocessed',
            date: '2023-04-18',
            fileName: 'aws-april-2023.pdf'
        }
    ]);
    const [previewInvoice, setPreviewInvoice] = useState<string | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(Array.from(event.target.files));
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error("Please select at least one invoice to upload");
            return;
        }

        setIsUploading(true);

        try {
            // For each selected file, send it to the API
            for (let file of files) {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("https://api.know360.io/finance_agent/process-invoice/", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Failed to upload ${file.name}`);
                }

                // The API returns the extracted invoice data (JSON)
                const data = await response.json();
                console.log("API Response:", data);

                // Construct a new invoice entry from the response
                const newInvoice: InvoiceData = {
                    id: `new-${Date.now()}-${Math.random()}`, // or a more robust unique ID
                    category: data?.line_items?.length
                        ? data.line_items[0].description // Just an example
                        : "Not Extracted",
                    description: `Invoice #${data?.invoice_details?.invoice_number ?? "N/A"}`,
                    vendor: data?.vendor_information?.name || "Not Extracted",
                    amount: data?.financial_summary?.total
                        ? `$${data.financial_summary.total}`
                        : "-",
                    status: "processed", // Mark as processed once the API returns
                    date: data?.invoice_details?.invoice_date || new Date().toISOString().split("T")[0],
                    fileName: data?.filename || file.name,
                };

                // Append new invoice to our state
                setProcessedData((prev) => [...prev, newInvoice]);
            }

            toast.success(`${files.length} invoice(s) uploaded & processed`);
        } catch (error) {
            console.error(error);
            toast.error("Error uploading invoice(s)");
        } finally {
            // Reset file state and close the dialog
            setFiles([]);
            setIsUploading(false);
            setIsDialogOpen(false);
        }
    };


    const processSelectedInvoices = () => {
        const invoicesToProcess = selectedRows.length > 0
            ? selectedRows
            : processedData.filter(item => item.status === 'unprocessed').map(item => item.id);

        if (invoicesToProcess.length === 0) {
            toast.error("No unprocessed invoices to process");
            return;
        }

        setIsProcessing(true);

        // Update status to pending for selected invoices
        setProcessedData(prev =>
            prev.map(item => {
                if (invoicesToProcess.includes(item.id) && (item.status === 'unprocessed' || item.status === 'error')) {
                    return {
                        ...item,
                        status: 'pending'
                    };
                }
                return item;
            })
        );

        // Simulate processing
        setTimeout(() => {
            // Update with results
            setProcessedData(prev =>
                prev.map(item => {
                    if (invoicesToProcess.includes(item.id) && item.status === 'pending') {
                        return {
                            ...item,
                            category: ['Professional Services', 'Office Supplies', 'Travel', 'Software/IT'][Math.floor(Math.random() * 4)],
                            vendor: ['Acme Corp', 'TechSolutions', 'Global Industries', 'Office Depot'][Math.floor(Math.random() * 4)],
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
        setProcessedData(prev => prev.filter(item => item.id !== id));
        setSelectedRows(prev => prev.filter(rowId => rowId !== id));
        toast.success("Invoice removed");
    };

    const handlePreviewInvoice = (invoice: InvoiceData) => {
        setSelectedInvoice(invoice);
        setIsPreviewOpen(true);

        // In a real implementation, you would load the actual PDF
        // For this demo, we're just simulating the PDF preview
        setPreviewInvoice(invoice.fileName);
    };

    const toggleRowSelection = (id: string) => {
        setSelectedRows(prev =>
            prev.includes(id)
                ? prev.filter(rowId => rowId !== id)
                : [...prev, id]
        );
    };

    const toggleAllRows = () => {
        if (selectedRows.length === processedData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(processedData.map(item => item.id));
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'processed':
                return <Badge className="bg-green-100 text-green-800">Processed</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
            case 'error':
                return <Badge className="bg-red-100 text-red-800">Error</Badge>;
            case 'unprocessed':
                return <Badge className="bg-gray-100 text-gray-800">Unprocessed</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    // Count of unprocessed invoices
    const unprocessedCount = processedData.filter(item =>
        item.status === 'unprocessed' || item.status === 'error'
    ).length;

    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold">Invoice Automation Agent</h1>
                    <p
                        className="flex items-center cursor-pointer"
                        onClick={() => router.push("/workflows")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2"/>
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
                                        <Badge
                                            className="ml-2 bg-blue-100 text-blue-800">{unprocessedCount} unprocessed</Badge>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button>
                                                <Plus className="h-4 w-4 mr-2"/>
                                                Upload New Invoices
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Upload Invoices</DialogTitle>
                                                <DialogDescription>
                                                    Select PDF invoices to upload
                                                </DialogDescription>
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
                                                        <Upload className="h-8 w-8 mx-auto mb-4"/>
                                                        <p>Drop PDF invoices here or click to browse</p>
                                                    </label>
                                                </div>
                                                {files.length > 0 && (
                                                    <div className="mt-4">
                                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                                            {files.map((file, index) => (
                                                                <div key={index}
                                                                     className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                                    <div className="flex items-center">
                                                                        <FileText
                                                                            className="h-4 w-4 mr-2 text-blue-500"/>
                                                                        <span
                                                                            className="text-sm truncate max-w-[200px]">{file.name}</span>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-red-500"/>
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
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsDialogOpen(false)}
                                                    disabled={isUploading}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleUpload}
                                                    disabled={isUploading || files.length === 0}
                                                >
                                                    {isUploading ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
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
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2"/>
                                                Process {selectedRows.length > 0 ? `Selected (${selectedRows.length})` : 'All'}
                                            </>
                                        )}
                                    </Button>

                                    <Button variant="outline">
                                        <Download className="h-4 w-4 mr-2"/>
                                        Export CSV
                                    </Button>
                                </div>
                            </div>
                            {processedData.length > 0 ? (
                                <ScrollArea className="h-[500px] rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.length === processedData.length && processedData.length > 0}
                                                        onChange={toggleAllRows}
                                                        className="h-4 w-4"
                                                    />
                                                </TableHead>
                                                <TableHead>File Name</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Vendor</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {processedData.map((item) => (
                                                <TableRow
                                                    key={item.id}
                                                    className={`${
                                                        item.status === 'pending' ? 'animate-pulse bg-blue-50' : ''
                                                    }`}
                                                >
                                                    <TableCell>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRows.includes(item.id)}
                                                            onChange={() => toggleRowSelection(item.id)}
                                                            className="h-4 w-4"
                                                            disabled={item.status === 'pending' || item.status === 'processed'}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">{item.fileName}</TableCell>
                                                    <TableCell>{item.category}</TableCell>
                                                    <TableCell>{item.vendor}</TableCell>
                                                    <TableCell>{item.date}</TableCell>
                                                    <TableCell>{item.amount}</TableCell>
                                                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handlePreviewInvoice(item)}
                                                            >
                                                                <Eye className="h-4 w-4"/>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteInvoice(item.id)}
                                                                disabled={item.status === 'pending'}
                                                            >
                                                                <Trash2 className="h-4 w-4"/>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-md border">
                                    <File className="h-12 w-12 mx-auto text-gray-400 mb-4"/>
                                    <h3 className="text-lg font-medium text-gray-900">No invoices yet</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Upload some invoices to get started
                                    </p>
                                    <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2"/>
                                        Upload Invoices
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* PDF Preview Sheet */}
            <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <SheetContent side="right" className="w-[90%] sm:w-[600px] p-0 flex flex-col">
                    <SheetHeader className="p-6 border-b">
                        <SheetTitle>
                            {selectedInvoice?.fileName}
                        </SheetTitle>
                        <SheetDescription>
                            {selectedInvoice?.vendor} - {selectedInvoice?.date}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 p-6 overflow-auto bg-gray-50 flex flex-col">
                        <div className="mb-4 bg-white p-4 rounded shadow-sm">
                            <h3 className="font-medium text-lg mb-2">Invoice Details</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="font-medium">Category:</span>
                                </div>
                                <div>{selectedInvoice?.category}</div>

                                <div>
                                    <span className="font-medium">Description:</span>
                                </div>
                                <div>{selectedInvoice?.description}</div>

                                <div>
                                    <span className="font-medium">Amount:</span>
                                </div>
                                <div className="font-medium">{selectedInvoice?.amount}</div>

                                <div>
                                    <span className="font-medium">Status:</span>
                                </div>
                                <div>{getStatusBadge(selectedInvoice?.status || '')}</div>
                            </div>
                        </div>

                        {/* PDF Preview */}
                        <div className="flex-1 bg-white rounded shadow-sm overflow-hidden flex flex-col">
                            <div className="p-4 border-b flex justify-between items-center">
                                <h3 className="font-medium">Document Preview</h3>
                                <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2"/>
                                    Download
                                </Button>
                            </div>
                            <div className="flex-1 p-4 flex items-center justify-center bg-gray-100">
                                {/* This would be replaced with an actual PDF viewer */}
                                <div className="text-center">
                                    <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4"/>
                                    <p className="text-gray-500">PDF Preview not available in demo</p>
                                    <p className="text-sm text-gray-400 mt-2">Filename: {previewInvoice}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t flex justify-end">
                        <Button onClick={() => setIsPreviewOpen(false)}>
                            Close
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}