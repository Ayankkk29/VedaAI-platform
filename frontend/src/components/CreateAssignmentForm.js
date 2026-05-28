'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAssignmentStore } from '../store/useAssignmentStore';
import { Calendar, Upload, FileText, X, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

// Form validation schema
const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subject: z.string().min(2, 'Subject is required'),
  class: z.string().min(1, 'Class/Grade is required'),
  dueDate: z.string().min(5, 'Due date is required'),
  numQuestions: z.number().min(1, 'At least 1 question').max(30, 'Max 30 questions'),
  marksPerQuestion: z.number().min(1, 'Minimum 1 mark per question'),
  easyDist: z.number().min(0).max(100),
  modDist: z.number().min(0).max(100),
  hardDist: z.number().min(0).max(100),
  questionTypes: z.array(z.string()).min(1, 'Select at least one question type'),
  instructions: z.string().optional(),
});

export default function CreateAssignmentForm() {
  const { createAssignment, setViewMode } = useAssignmentStore();
  const [step, setStep] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      subject: '',
      class: '',
      dueDate: '',
      numQuestions: 10,
      marksPerQuestion: 2,
      easyDist: 30,
      modDist: 40,
      hardDist: 30,
      questionTypes: ['mcq', 'short'],
      instructions: '',
    },
    mode: 'onChange',
  });

  const watchEasy = watch('easyDist');
  const watchMod = watch('modDist');
  const watchHard = watch('hardDist');
  const watchTypes = watch('questionTypes');

  const totalDist = watchEasy + watchMod + watchHard;
  const isDistValid = totalDist === 100;

  const handleNextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = ['title', 'subject', 'class', 'dueDate'];
    } else if (step === 2) {
      fieldsToValidate = ['numQuestions', 'marksPerQuestion', 'questionTypes'];
      if (!isDistValid) {
        alert('Difficulty distribution must sum up to exactly 100%');
        return;
      }
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit');
      return;
    }
    setUploadedFile({
      name: file.name,
      size: file.size,
      url: '#mock-upload-url',
    });
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const toggleQuestionType = (type) => {
    const current = [...watchTypes];
    const index = current.indexOf(type);
    if (index > -1) {
      if (current.length > 1) {
        current.splice(index, 1);
      }
    } else {
      current.push(type);
    }
    setValue('questionTypes', current, { shouldValidate: true });
  };

  const onFormSubmit = async (data) => {
    const payload = {
      ...data,
      difficultyDistribution: {
        easy: data.easyDist,
        moderate: data.modDist,
        hard: data.hardDist,
      },
      uploadedFile: uploadedFile || undefined,
    };
    await createAssignment(payload);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      e.preventDefault();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-3xl mx-auto w-full">
      {/* Back button */}
      <button
        onClick={() => setViewMode('list')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-4 md:mb-6 text-sm font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assignments</span>
      </button>

      {/* Stepper Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] sm:text-[12px] font-bold text-orange-500 tracking-wider uppercase">
            Step {step} of 3
          </span>
          <span className="text-xs sm:text-sm font-semibold text-gray-500">
            {step === 1 && 'Basic Details'}
            {step === 2 && 'Generation Parameters'}
            {step === 3 && 'Material Upload'}
          </span>
        </div>
        <div className="w-full bg-gray-150 h-[4px] sm:h-[6px] rounded-full overflow-hidden">
          <div 
            className="bg-neutral-900 h-full transition-all duration-300 rounded-full" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} onKeyDown={handleKeyDown} className="space-y-5">
        {/* STEP 1: BASIC DETAILS */}
        {step === 1 && (
          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">Assignment Details</h2>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Basic information about your assignment.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">Assignment Title</label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g. Quiz on Electricity"
                      className={`w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm focus:outline-none transition-all ${
                        errors.title ? 'border-red-300 focus:border-red-400 bg-red-50/20' : 'border-gray-200 focus:border-gray-300'
                      }`}
                    />
                  )}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1.5">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">Subject</label>
                  <Controller
                    name="subject"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="e.g. Science"
                        className={`w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm focus:outline-none transition-all ${
                          errors.subject ? 'border-red-300 focus:border-red-400 bg-red-50/20' : 'border-gray-200 focus:border-gray-300'
                        }`}
                      />
                    )}
                  />
                  {errors.subject && <p className="text-xs text-red-500 mt-1.5">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">Class / Grade</label>
                  <Controller
                    name="class"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="e.g. 8th"
                        className={`w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm focus:outline-none transition-all ${
                          errors.class ? 'border-red-300 focus:border-red-400 bg-red-50/20' : 'border-gray-200 focus:border-gray-300'
                        }`}
                      />
                    )}
                  />
                  {errors.class && <p className="text-xs text-red-500 mt-1.5">{errors.class.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">Due Date</label>
                <div className="relative">
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="DD-MM-YYYY"
                        className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-xs sm:text-sm focus:outline-none transition-all ${
                          errors.dueDate ? 'border-red-300 focus:border-red-400 bg-red-50/20' : 'border-gray-200 focus:border-gray-300'
                        }`}
                      />
                    )}
                  />
                  <Calendar className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
                {errors.dueDate && <p className="text-xs text-red-500 mt-1.5">{errors.dueDate.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: GENERATION PARAMETERS */}
        {step === 2 && (
          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">Generation Parameters</h2>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Configure layout, question limits, and difficulty distribution.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">Number of Questions</label>
                <Controller
                  name="numQuestions"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-gray-300"
                    />
                  )}
                />
                {errors.numQuestions && <p className="text-xs text-red-500 mt-1">{errors.numQuestions.message}</p>}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">Marks Per Question</label>
                <Controller
                  name="marksPerQuestion"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-gray-300"
                    />
                  )}
                />
                {errors.marksPerQuestion && <p className="text-xs text-red-500 mt-1">{errors.marksPerQuestion.message}</p>}
              </div>
            </div>

            {/* Difficulty Slider block */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
                <label className="block text-xs sm:text-sm font-bold text-gray-700">Difficulty Distribution</label>
                <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold w-fit ${isDistValid ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                  Sum: {totalDist}% {isDistValid ? '(Valid)' : '(Must equal 100%)'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-neutral-50/50 p-3 sm:p-4 rounded-2xl border border-neutral-100/50">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Easy (%)</label>
                  <Controller
                    name="easyDist"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none"
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Moderate (%)</label>
                  <Controller
                    name="modDist"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none"
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Hard (%)</label>
                  <Controller
                    name="hardDist"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Question Types block */}
            <div className="space-y-2.5">
              <label className="block text-xs sm:text-sm font-bold text-gray-700">Question Types</label>
              <div className="grid grid-cols-2 gap-2">
                {['mcq', 'short', 'long', 'true_false'].map((type) => {
                  const isChecked = watchTypes.includes(type);
                  const labels = {
                    mcq: 'MCQ',
                    short: 'Short Answer',
                    long: 'Long Answer',
                    true_false: 'True / False',
                  };

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleQuestionType(type)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        isChecked
                          ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {labels[type]}
                    </button>
                  );
                })}
              </div>
              {errors.questionTypes && <p className="text-xs text-red-500 mt-1">{errors.questionTypes.message}</p>}
            </div>
          </div>
        )}

        {/* STEP 3: SOURCE MATERIALS & CONTEXT */}
        {step === 3 && (
          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">Source Material & Scope</h2>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Upload files or write context to guide the question generation.</p>
            </div>

            {/* File Upload drag-and-drop */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-700">Optional Reference Document</label>
              
              {!uploadedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center transition-all ${
                    dragOver 
                      ? 'border-orange-500 bg-orange-50/20' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center border border-gray-100 mb-2">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-gray-700 text-center">Choose a file or drag & drop it here</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 mb-3 text-center">JPEG, PNG, PDF up to 10MB</p>
                  
                  <label className="cursor-pointer bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-semibold py-2 px-4 rounded-full border border-neutral-800 transition-colors">
                    Browse Files
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".jpg,.jpeg,.png,.pdf" 
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3.5 bg-orange-50/30 border border-orange-100 rounded-2xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{uploadedFile.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 rounded-full hover:bg-orange-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Additional Instructions */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold text-gray-700">Additional Context / Instructions</label>
              <Controller
                name="instructions"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    placeholder="e.g. Focus on Chapter 3 & 4 of NCERT textbook, include conceptual definitions and chemical equations."
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-gray-300 resize-none"
                  />
                )}
              />
            </div>
          </div>
        )}

        {/* Action Controls - Mobile layout optimized matching Screen 3 */}
        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <button
              key="btn-prev"
              type="button"
              onClick={handlePrevStep}
              className="flex items-center gap-1 px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs sm:text-sm font-semibold text-gray-600 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          ) : (
            <div key="empty-prev" />
          )}

          {step < 3 ? (
            <button
              key="btn-next"
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-2.5 px-6 rounded-full transition-colors text-xs sm:text-sm shadow-md"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5 text-orange-500" />
            </button>
          ) : (
            <button
              key="btn-submit"
              type="submit"
              disabled={!isValid || !isDistValid}
              className={`flex items-center gap-1.5 font-semibold py-2.5 px-6 rounded-full transition-all text-xs sm:text-sm ${
                isValid && isDistValid
                  ? 'bg-neutral-900 hover:bg-neutral-800 text-white cursor-pointer shadow-md'
                  : 'bg-gray-150 text-gray-400 border border-gray-200 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Generate</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
