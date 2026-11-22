import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileText, Loader2 } from 'lucide-react';

export const PDFExporter = ({ plan }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (!plan || !plan.timetable || plan.timetable.length === 0) {
      alert('No timetable available to export.');
      return;
    }

    setExporting(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Header Banner
      doc.setFillColor(99, 102, 241); // Primary indigo
      doc.rect(0, 0, 210, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('AI-POWERED PERSONALIZED STUDY PLAN', 14, 12);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Official Academic Timetable | Generated using Prompt Engineering & Cognitive Science`, 14, 19);
      doc.text(`Exported: ${new Date().toLocaleDateString()}`, 160, 19);

      // Plan Details Box
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(plan.planName || 'Personalized Study Plan', 14, 38);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Planning Period: ${plan.planningStartDate} to ${plan.planningEndDate}`, 14, 45);
      doc.text(`Daily Study Budget: ${plan.availableHoursPerDay || 4} hours/day`, 14, 50);

      const weakList = plan.weakSubjects && plan.weakSubjects.length > 0 ? plan.weakSubjects.join(', ') : 'None';
      doc.text(`Weak Subjects (Priority): ${weakList}`, 110, 45);

      const totalHours = plan.timetable.reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
      doc.text(`Total Scheduled Study: ${totalHours.toFixed(1)} hours (${plan.timetable.length} sessions)`, 110, 50);

      // Examination Dates Section
      if (plan.examDates && plan.examDates.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Examination Deadlines:', 14, 58);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        const examSummary = plan.examDates.map((e) => `${e.subject}: ${e.examDate}`).join('   |   ');
        doc.text(examSummary, 14, 63);
      }

      // Prepare Timetable Rows
      const tableRows = plan.timetable.map((session, index) => {
        return [
          index + 1,
          session.date,
          session.day,
          session.subject,
          session.topic,
          session.activityType,
          `${session.duration}h`,
          session.completed ? 'Completed' : 'Pending',
        ];
      });

      // Render Timetable via AutoTable
      autoTable(doc, {
        startY: 68,
        head: [['#', 'Date', 'Day', 'Subject', 'Topic & Activity', 'Type', 'Duration', 'Status']],
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255],
          fontSize: 8.5,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [30, 41, 59],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 20 },
          2: { cellWidth: 20 },
          3: { cellWidth: 22, fontStyle: 'bold' },
          4: { cellWidth: 64 },
          5: { cellWidth: 26 },
          6: { cellWidth: 16 },
          7: { cellWidth: 16 },
        },
        margin: { left: 14, right: 14 },
      });

      // Footer Note
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${i} of ${pageCount} - AI-Powered Personalized Study Plan Generator - strictly satisfies all constraint rules`,
          14,
          290
        );
      }

      const fileName = `${(plan.planName || 'Study_Plan').replace(/\s+/g, '_')}_Timetable.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="btn btn-secondary"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '9px 16px',
        fontSize: '0.875rem',
      }}
    >
      {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      {exporting ? 'Generating PDF...' : 'Download PDF Timetable'}
    </button>
  );
};
