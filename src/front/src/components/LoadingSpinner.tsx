'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({ message = 'Carregando...', className = '' }: LoadingSpinnerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col items-center justify-center gap-4 py-12 ${className}`}
    >
      <Loader2 className="h-10 w-10 text-sigac-accent animate-spin" strokeWidth={2} />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </motion.div>
  );
}

/** Skeleton para cards do dashboard (valores e gráficos) */
export function DashboardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card overflow-hidden">
            <div className="skeleton h-4 w-24 mb-3" />
            <div className="skeleton h-8 w-32 mb-2" />
            <div className="skeleton h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="card h-80">
        <div className="skeleton h-6 w-48 mb-4" />
        <div className="skeleton h-56 w-full rounded-xl" />
      </div>
      <div className="card">
        <div className="skeleton h-6 w-64 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/** Skeleton para tabelas (listas) */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card overflow-hidden p-0"
    >
      <div className="border-b border-slate-200 bg-slate-50/50 px-4 py-3">
        <div className="flex gap-4">
          <div className="skeleton h-5 w-24" />
          <div className="skeleton h-5 w-32" />
          <div className="skeleton h-5 w-20" />
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="skeleton h-4 flex-1 max-w-[200px]" />
            <div className="skeleton h-4 flex-1 max-w-[120px]" />
            <div className="skeleton h-4 w-16" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
