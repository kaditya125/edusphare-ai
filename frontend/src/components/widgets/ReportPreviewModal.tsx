import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { ReportCardTemplate } from './ReportCardTemplate';
import { apiCall } from '../../lib/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportPreviewModal({ isOpen, onClose }: ReportPreviewModalProps) {
  const [reportData, setReportData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsGenerating(true);
      setReportData(null);
      setEmailSuccess(false);
      
      // Fetch the formal AI report
      apiCall('/dashboard/formal-report')
        .then(res => {
          setReportData(res);
          setIsGenerating(false);
        })
        .catch(err => {
          console.error("Failed to generate report", err);
          setIsGenerating(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const generatePDF = async (): Promise<jsPDF | null> => {
    if (!reportRef.current) return null;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    return pdf;
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const pdf = await generatePDF();
      if (pdf) {
        pdf.save('Jamia_Hamdard_Official_Transcript.pdf');
      }
    } catch (e) {
      console.error('Error saving PDF', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmail = async () => {
    try {
      setIsEmailing(true);
      // We would normally generate the PDF and send it as Base64 here,
      // but we will just simulate the API call to the backend.
      
      const res = await apiCall('/dashboard/email-report', {
        method: 'POST',
        body: JSON.stringify({ email: 'student@university.edu' })
      });
      
      if (res.success) {
        setEmailSuccess(true);
        setTimeout(() => setEmailSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Error emailing PDF', e);
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Dialog */}
      <div className="relative w-full max-w-5xl bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Official Report Preview</h2>
            <p className="text-sm text-slate-500 mt-1">Review your AI-generated transcript before downloading</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100/50 dark:bg-slate-950 flex justify-center items-start">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="absolute inset-0 bg-[#004a8f]/20 blur-xl rounded-full" />
                <Loader2 className="w-12 h-12 text-[#004a8f] animate-spin relative z-10" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">AI is writing your evaluation...</h3>
              <p className="text-slate-500 mt-2 text-sm">Please wait while the Dean's assessment is generated.</p>
            </div>
          ) : reportData ? (
            <div className="shadow-2xl ring-1 ring-slate-900/5 overflow-hidden origin-top transform scale-[0.85] sm:scale-100">
              {/* This is the visible Report Template that will be screenshotted! */}
              <ReportCardTemplate ref={reportRef} data={reportData} />
            </div>
          ) : (
            <div className="text-red-500 font-bold">Failed to load report. Please try again.</div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-end items-center gap-4 z-10">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handleEmail}
              disabled={isGenerating || isEmailing || emailSuccess}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                emailSuccess 
                  ? 'bg-emerald-500 text-white shadow-emerald-500/25' 
                  : 'bg-[#5b58ed]/10 text-[#5b58ed] hover:bg-[#5b58ed]/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {emailSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Mail className={`w-4 h-4 ${isEmailing ? 'animate-pulse' : ''}`} />}
              <span>{emailSuccess ? 'Sent!' : isEmailing ? 'Sending...' : 'Send to Email'}</span>
            </button>
            
            <button 
              onClick={handleDownload}
              disabled={isGenerating || isDownloading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#004a8f] text-white rounded-xl font-bold shadow-lg shadow-[#004a8f]/20 hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Saving...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
