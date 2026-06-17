import React from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { Database, RefreshCw, Activity, CheckCircle, XCircle } from 'lucide-react';

const queryClient = new QueryClient();

function Dashboard() {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['knowledgeStats'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/admin/knowledge-sync');
      return res.json();
    },
    refetchInterval: 5000, // auto refresh every 5s
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('http://localhost:5000/api/admin/knowledge-sync/trigger', {
        method: 'POST',
      });
      return res.json();
    },
    onSuccess: () => {
      alert('Sync Job Queued Successfully!');
      refetch();
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Database className="text-blue-600" /> AI Knowledge Management
            </h1>
            <p className="text-slate-500 mt-1">Monitor and manage the centralized AI Knowledge base for EduSphere.</p>
          </div>
          <button 
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Queueing Sync...' : 'Trigger Manual Sync'}
          </button>
        </header>

        {isLoading ? (
          <div className="flex justify-center p-12"><Activity className="animate-pulse text-blue-500 w-8 h-8" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="text-sm font-semibold text-slate-500 mb-1">Status</div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {stats?.status === 'success' ? (
                  <><CheckCircle className="text-green-500" /> Healthy</>
                ) : stats?.status === 'failed' ? (
                  <><XCircle className="text-red-500" /> Failed</>
                ) : (
                  <><Activity className="text-amber-500" /> {stats?.status}</>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="text-sm font-semibold text-slate-500 mb-1">Last Sync Time</div>
              <div className="text-xl font-bold text-slate-800">
                {stats?.lastSyncTime !== 'Never' ? new Date(stats.lastSyncTime).toLocaleString() : 'Never'}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="text-sm font-semibold text-slate-500 mb-1">Records Indexed (Last Sync)</div>
              <div className="text-3xl font-bold text-slate-800">
                {stats?.recordsProcessed || 0}
              </div>
            </div>
            
            {stats?.lastError && (
              <div className="col-span-1 md:col-span-3 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm font-mono">
                <strong>Last Error:</strong> {stats.lastError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
