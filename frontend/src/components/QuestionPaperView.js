'use client';

import React, { useState } from 'react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import { ArrowLeft, Download, FileText, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  pdf 
} from '@react-pdf/renderer';

// --- REACT-PDF EXAM STYLING REGISTER ---
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textTransform: 'uppercase',
  },
  metaLabel: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingBottom: 8,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 10,
    color: '#374151',
  },
  studentLines: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
    marginBottom: 15,
  },
  studentLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  studentLineText: {
    fontSize: 10,
    color: '#4B5563',
    width: '45%',
  },
  compulsoryText: {
    fontSize: 9,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 4,
    color: '#111827',
  },
  sectionInstruction: {
    fontSize: 9,
    textAlign: 'center',
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  questionBlock: {
    marginBottom: 10,
    paddingLeft: 10,
    flexDirection: 'column',
  },
  questionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  questionNum: {
    fontSize: 10,
    width: 20,
    color: '#111827',
  },
  questionBodyContainer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
    paddingRight: 10,
  },
  questionBody: {
    fontSize: 10,
    color: '#1F2937',
  },
  optionsGrid: {
    paddingLeft: 20,
    marginTop: 4,
    marginBottom: 4,
    flexDirection: 'column',
  },
  optionText: {
    fontSize: 9,
    color: '#4B5563',
    marginBottom: 2,
  },
  marksText: {
    fontSize: 9,
    color: '#4B5563',
    width: 50,
    textAlign: 'right',
  },
  footer: {
    textAlign: 'center',
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 25,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  answerKeyHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 10,
    color: '#111827',
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF',
    paddingTop: 15,
  },
  answerRow: {
    marginBottom: 8,
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
  }
});

// --- PDF Document Definition ---
const ExamPDFDocument = ({ paper }) => {
  let qCounter = 1;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.schoolName}>Delhi Public School</Text>
          <Text style={[styles.metaLabel, { fontWeight: 'bold' }]}>
            Subject: {paper.subject} | Class: {paper.class}
          </Text>
          <Text style={styles.metaLabel}>{paper.title}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Time Allowed: 45 minutes</Text>
          <Text style={styles.infoText}>Maximum Marks: 20</Text>
        </View>

        <View style={styles.studentLines}>
          <View style={styles.studentLineRow}>
            <Text style={styles.studentLineText}>Name: _______________________________</Text>
            <Text style={styles.studentLineText}>Roll Number: ________________________</Text>
          </View>
          <View style={styles.studentLineRow}>
            <Text style={styles.studentLineText}>Class: {paper.class} Section: _________________</Text>
          </View>
        </View>

        <Text style={styles.compulsoryText}>All questions are compulsory unless stated otherwise.</Text>

        {paper.sections.map((section, sIdx) => (
          <View key={sIdx}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
            <Text style={styles.sectionInstruction}>{section.instruction}</Text>

            {section.questions.map((q, qIdx) => {
              const currentNum = qCounter++;
              return (
                <View key={qIdx} style={styles.questionBlock}>
                  <View style={styles.questionHeaderRow}>
                    <Text style={styles.questionNum}>{currentNum}.</Text>
                    <View style={styles.questionBodyContainer}>
                      <Text style={styles.questionBody}>
                        [{q.difficulty.toUpperCase()}] {q.question}
                      </Text>
                    </View>
                    <Text style={styles.marksText}>[{q.marks} Marks]</Text>
                  </View>
                  {q.type === 'mcq' && q.options && (
                    <View style={styles.optionsGrid}>
                      {q.options.map((opt, oIdx) => (
                        <Text key={oIdx} style={styles.optionText}>
                          {String.fromCharCode(97 + oIdx)}) {opt}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        <Text style={styles.footer}>End of Question Paper</Text>

        {paper.answerKey && paper.answerKey.length > 0 && (
          <View style={{ break: true }}>
            <Text style={styles.answerKeyHeader}>Answer Key</Text>
            {paper.sections.flatMap(s => s.questions).map((q, idx) => (
              <View key={idx} style={styles.answerRow}>
                <Text style={{ fontWeight: 'bold' }}>Q{idx + 1}. [{q.difficulty.toUpperCase()}] Model Answer:</Text>
                <Text style={{ marginTop: 2 }}>{q.answer || 'Refer to text answer key.'}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default function QuestionPaperView() {
  const { assignments, selectedAssignmentId, setViewMode } = useAssignmentStore();
  const [keyOpen, setKeyOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const assignment = assignments.find((a) => a._id === selectedAssignmentId);

  if (!assignment || !assignment.generatedPaper) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No question paper available.</p>
        <button onClick={() => setViewMode('list')} className="mt-4 text-orange-500 font-bold hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const paper = assignment.generatedPaper;
  let qNum = 1;

  const triggerPDFDownload = async () => {
    setDownloading(true);
    try {
      const doc = <ExamPDFDocument paper={paper} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${paper.title.replace(/\s+/g, '_')}_Exam_Paper.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Could not export PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'moderate':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'hard':
      case 'challenging':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full">
      {/* Back button */}
      <button
        onClick={() => setViewMode('list')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-4 md:mb-6 text-sm font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assignments</span>
      </button>

      {/* Alert Banner / Download Actions */}
      <div className="bg-neutral-900 text-white rounded-3xl p-4 sm:p-5 mb-6 shadow-md border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-gray-300 font-medium">
            Certainly, Lakshya! Here is the customized Question Paper for your CBSE Grade {paper.class} classes:
          </p>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-orange-400">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Structured JSON compiled successfully by AI.</span>
          </div>
        </div>

        <button
          onClick={triggerPDFDownload}
          disabled={downloading}
          className="flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold py-2.5 px-4 sm:px-5 rounded-full shadow transition-all duration-200 shrink-0 text-xs sm:text-sm disabled:opacity-75"
        >
          <Download className="w-4 h-4 text-orange-500" />
          <span>{downloading ? 'Downloading...' : 'Download as PDF'}</span>
        </button>
      </div>

      {/* Exam Sheet Layout - Responsive Padding */}
      <div className="bg-white border border-gray-150 rounded-3xl p-5 sm:p-8 shadow-sm space-y-5 sm:space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600" />

        {/* Header centered */}
        <div className="text-center space-y-1.5 pb-4 border-b border-gray-100">
          <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight uppercase">Delhi Public School</h1>
          <p className="text-xs sm:text-sm font-bold text-gray-500 uppercase">Subject: {paper.subject} | Class: {paper.class}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 font-semibold">{paper.title}</p>
        </div>

        {/* School Info Metadata Block */}
        <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold text-gray-500 bg-neutral-50 px-4 py-2.5 rounded-2xl border border-neutral-100/50">
          <div>Time Allowed: 45 minutes</div>
          <div>Maximum Marks: 20</div>
        </div>

        {/* Student identification fields - Grid wraps layout on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-gray-100 pb-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-semibold shrink-0">Name:</span>
            <div className="w-full border-b border-dashed border-gray-300 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-semibold shrink-0">Roll Number:</span>
            <div className="w-full border-b border-dashed border-gray-300 h-5" />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
            <span className="text-gray-400 font-semibold shrink-0">Class & Section:</span>
            <div className="w-24 sm:w-48 border-b border-dashed border-gray-300 h-5 mr-4" />
            <span className="text-[10px] text-gray-300">(All questions are compulsory unless stated otherwise)</span>
          </div>
        </div>

        {/* Paper Sections */}
        <div className="space-y-6 sm:space-y-8">
          {paper.sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-4">
              {/* Section Header */}
              <div className="text-center space-y-1">
                <h3 className="text-sm sm:text-md font-extrabold text-neutral-800 uppercase tracking-wider">{section.title}</h3>
                <p className="text-[10px] sm:text-xs text-gray-400 italic">{section.instruction}</p>
              </div>

              {/* Questions list */}
              <div className="space-y-3 sm:space-y-4">
                {section.questions.map((q, qIdx) => {
                  const currentNum = qNum++;
                  return (
                    <div key={qIdx} className="flex gap-2 sm:gap-4 p-2 sm:p-3 rounded-2xl hover:bg-neutral-50/50 transition-colors border border-transparent hover:border-neutral-100/50">
                      {/* Index */}
                      <span className="font-extrabold text-gray-700 text-xs sm:text-sm w-4 text-right mt-0.5">{currentNum}.</span>
                      
                      {/* Body */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-start gap-1.5">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase border shrink-0 mt-0.5 ${getDifficultyColor(q.difficulty)}`}>
                            {q.difficulty}
                          </span>
                          <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-relaxed">
                            {q.question}
                          </p>
                        </div>

                        {/* MCQ Options list */}
                        {q.type === 'mcq' && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {String.fromCharCode(97 + oIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Marks Badge */}
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 mt-1 shrink-0 bg-neutral-50 px-2 py-0.5 sm:py-1 rounded-lg border border-neutral-100 h-fit">
                        {q.marks}M
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-xs font-bold text-gray-300 border-t border-gray-100 pt-5 uppercase tracking-widest">
          End of Question Paper
        </div>
      </div>

      {/* Answer Key Collapsible Toggle */}
      <div className="mt-4 sm:mt-6 bg-white border border-gray-150 rounded-3xl p-5 sm:p-6 shadow-sm">
        <button
          onClick={() => setKeyOpen(!keyOpen)}
          className="w-full flex items-center justify-between font-bold text-neutral-800 text-xs sm:text-[15px]"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            <span>Answer Key & Solutions</span>
          </div>
          {keyOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {keyOpen && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-3.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
            {paper.sections.flatMap(s => s.questions).map((q, idx) => (
              <div key={idx} className="space-y-1">
                <p className="font-bold text-neutral-700">Q{idx + 1}. [{q.difficulty.toUpperCase()}] Model Answer:</p>
                <p className="text-gray-500 pl-4">{q.answer || 'No solution key provided.'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
