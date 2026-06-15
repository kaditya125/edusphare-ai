import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '../../lib/api';
import { Plus, Check, Trash2, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';

export function TodoWidget() {
  const [newTask, setNewTask] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const queryClient = useQueryClient();

  const { data: todos, isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: () => apiCall('/todos')
  });

  const addMutation = useMutation({
    mutationFn: ({ text, dueDate }: { text: string, dueDate?: string }) => 
      apiCall('/todos', { method: 'POST', body: JSON.stringify({ text, dueDate: dueDate || undefined }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setNewTask('');
      setNewDueDate('');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string, isCompleted: boolean }) => 
      apiCall(`/todos/${id}`, { method: 'PUT', body: JSON.stringify({ isCompleted }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiCall(`/todos/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      addMutation.mutate({ text: newTask.trim(), dueDate: newDueDate });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white text-[15px]">My Tasks</h3>
        <span className="text-xs font-bold bg-[#5b58ed]/10 text-[#5b58ed] px-2 py-1 rounded-md">
          {todos?.filter((t: any) => !t.isCompleted).length || 0} Pending
        </span>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..." 
          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#5b58ed]/20 min-w-0"
        />
        <input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          className="w-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#5b58ed]/20"
        />
        <button 
          type="submit"
          disabled={!newTask.trim() || addMutation.isPending}
          className="bg-[#5b58ed] text-white p-2 rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-colors shrink-0"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {isLoading ? (
          <div className="text-center text-sm text-slate-400 py-4">Loading tasks...</div>
        ) : todos?.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-4">All caught up! 🎉</div>
        ) : (
          todos?.map((todo: any) => (
            <div 
              key={todo._id} 
              className={cn(
                "group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50",
                todo.isCompleted 
                  ? "bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800" 
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              )}
              onClick={() => toggleMutation.mutate({ id: todo._id, isCompleted: !todo.isCompleted })}
            >
              <div className="flex items-center gap-3">
                <button 
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center border transition-colors",
                    todo.isCompleted 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : "border-slate-300 dark:border-slate-600 text-transparent hover:border-[#5b58ed]"
                  )}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <span className={cn(
                  "text-sm font-medium transition-all",
                  todo.isCompleted ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"
                )}>
                  {todo.text}
                </span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMutation.mutate(todo._id);
                }}
                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
