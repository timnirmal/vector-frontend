'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

interface InvoiceDetailsModalProps {
    invoice: any; // Replace with proper type once API response structure is finalized
    isOpen: boolean;
    onClose: () => void;
}

// Helper function to format currency values
const formatCurrency = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null || value === '' || value === 'Not Extracted') {
        return 'N/A';
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return value.toString();
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'GBP', // Default to GBP, could be made dynamic based on invoice.Currency
        minimumFractionDigits: 2
    }).format(numValue);
};

export default function InvoiceDetailsModal({ invoice, isOpen, onClose }: InvoiceDetailsModalProps) {
    if (!invoice) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Invoice Details</DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 h-full pr-4">
                    <div className="space-y-6 pb-6">
                        {/* Invoice Summary */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Invoice Summary</h3>
                                <Badge
                                    className={`${invoice.status === 'processed' ? 'bg-green-100 text-green-800' : 
                                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                        invoice.status === 'error' ? 'bg-red-100 text-red-800' : 
                                        'bg-gray-100 text-gray-800'}`}
                                >
                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                <div>
                                    <p className="text-sm text-gray-500">Invoice Number</p>
                                    <p className="font-medium">{invoice.invoice_number || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Invoice Date</p>
                                    <p className="font-medium">{invoice.date || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Due Date</p>
                                    <p className="font-medium">{invoice.due_date || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">PO Number</p>
                                    <p className="font-medium">{invoice.po_number || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Currency</p>
                                    <p className="font-medium">{invoice.currency || 'GBP'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">File Name</p>
                                    <p className="font-medium">{invoice.fileName || 'N/A'}</p>
                                </div>
                            </div>
                        </section>
                        
                        <Separator />
                        
                        {/* Vendor Information */}
                        <section>
                            <h3 className="text-lg font-semibold mb-4">Vendor Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Vendor Name</p>
                                    <p className="font-medium">{invoice.vendor || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Vendor Address</p>
                                    <p className="font-medium">{invoice.vendor_address || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Vendor Phone</p>
                                    <p className="font-medium">{invoice.vendor_phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">VAT Number</p>
                                    <p className="font-medium">{invoice.vat_number || 'N/A'}</p>
                                </div>
                            </div>
                        </section>
                        
                        <Separator />
                        
                        {/* Financial Details */}
                        <section>
                            <h3 className="text-lg font-semibold mb-4">Financial Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Subtotal</p>
                                    <p className="font-medium">{formatCurrency(invoice.subtotal)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Discount</p>
                                    <p className="font-medium">{formatCurrency(invoice.discount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="font-medium font-bold">{invoice.amount || formatCurrency(invoice.total)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Amount Paid</p>
                                    <p className="font-medium">{formatCurrency(invoice.amount_paid)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Amount Due</p>
                                    <p className="font-medium">{formatCurrency(invoice.amount_due)}</p>
                                </div>
                            </div>
                        </section>
                        
                        <Separator />
                        
                        {/* Payment Information */}
                        <section>
                            <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Payment Details</p>
                                    <p className="font-medium">{invoice.payment_details || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Terms</p>
                                    <p className="font-medium">{invoice.payment_terms || 'N/A'}</p>
                                </div>
                            </div>
                        </section>
                        
                        <Separator />
                        
                        {/* Line Items */}
                        <section>
                            <h3 className="text-lg font-semibold mb-4">Line Items</h3>
                            {invoice.line_items && invoice.line_items.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Unit Price</TableHead>
                                            <TableHead>Debit Account</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoice.line_items.map((item: any, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.description}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                                                <TableCell>{item.debit_account || 'N/A'}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-gray-500">No line items available</p>
                            )}
                        </section>
                    </div>
                </ScrollArea>

                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={onClose}>Close</Button>
                </div>
                    

                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}