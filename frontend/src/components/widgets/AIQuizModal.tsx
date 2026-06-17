import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, BrainCircuit, CheckCircle, AlertCircle } from 'lucide-react';
import { apiCall } from '../../lib/api';

interface AIQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
}

export function AIQuizModal({ isOpen, onClose, course }: AIQuizModalProps) {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  React.useEffect(() => {
    if (isOpen && course && !quiz) {
      setLoading(true);
      // Hack: we might not have course._id if we are using mock courses in ILearn,
      // but in the previous step we populated `img` with `seed=${courseId}`.
      // So let's extract it or fallback to a dummy ID if it's purely mock.
      const courseId = course.img?.split('=')[1] || '654321'; 
      
      apiCall(`/courses/${courseId}/generate-quiz`, { method: 'POST' })
        .then(res => setQuiz(res))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, course]);

  if (!isOpen || !course) return null;

  const handleSelectOption = (qIndex: number, oIndex: number) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
  };

  const calculateScore = () => {
    if (!quiz?.questions) return 0;
    let score = 0;
    quiz.questions.forEach((q: any, i: number) => {
      if (answers[i] === q.correctAnswer) score++;
    });
    return score;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50 dark:from-emerald-900/20 to-white dark:to-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  AI Generated Quiz
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </h3>
                <p className="text-[12px] font-medium text-slate-500">{course.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-500 animate-pulse">Generating your personalized quiz...</p>
              </div>
            ) : quiz?.questions ? (
              <div className="space-y-8">
                {showResults && (
                  <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex flex-col items-center text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mb-2" />
                    <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      You scored {calculateScore()} / {quiz.questions.length}
                    </h3>
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mt-1">
                      Review your answers below.
                    </p>
                  </div>
                )}

                {quiz.questions.map((q: any, qIndex: number) => {
                  const isCorrect = answers[qIndex] === q.correctAnswer;
                  const isAnswered = answers[qIndex] !== undefined;

                  return (
                    <div key={qIndex} className="space-y-4">
                      <h4 className="text-[15px] font-bold text-slate-900 dark:text-white flex gap-3">
                        <span className="text-emerald-500 shrink-0">{qIndex + 1}.</span>
                        {q.question}
                      </h4>
                      <div className="space-y-2 pl-6">
                        {q.options.map((opt: string, oIndex: number) => {
                          const isSelected = answers[qIndex] === oIndex;
                          const isActuallyCorrect = showResults && oIndex === q.correctAnswer;
                          const isWrongSelection = showResults && isSelected && !isCorrect;

                          let btnClass = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-300 text-slate-700 dark:text-slate-300";
                          if (isSelected && !showResults) btnClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500";
                          if (isActuallyCorrect) btnClass = "border-emerald-500 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-200";
                          if (isWrongSelection) btnClass = "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300";

                          return (
                            <button
                              key={oIndex}
                              onClick={() => handleSelectOption(qIndex, oIndex)}
                              disabled={showResults}
                              className={`w-full text-left p-3 rounded-xl border text-[14px] font-medium transition-all ${btnClass}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {showResults && (
                        <div className={`mt-3 pl-6 p-4 rounded-xl flex gap-3 ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                          {isCorrect ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" /> : <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />}
                          <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                            <span className="font-bold">Explanation:</span> {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-10">Failed to generate quiz.</p>
            )}
          </div>

          {/* Footer */}
          {!loading && quiz && !showResults && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-900/50">
              <button
                onClick={() => setShowResults(true)}
                disabled={Object.keys(answers).length !== quiz.questions.length}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all"
              >
                Submit Quiz
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
