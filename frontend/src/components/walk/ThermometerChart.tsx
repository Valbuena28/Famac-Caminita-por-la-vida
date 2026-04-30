'use client';
import { motion } from 'framer-motion';

interface ThermometerChartProps {
  current: number;
  goal: number;
  label?: string;
}

export default function ThermometerChart({ current, goal, label = 'Recaudado' }: ThermometerChartProps) {
  const percent = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const formattedCurrent = current.toLocaleString('es-VE', { minimumFractionDigits: 2 });
  const formattedGoal = goal.toLocaleString('es-VE', { minimumFractionDigits: 2 });

  // Color gradient based on progress
  const getColor = () => {
    if (percent >= 80) return { bar: '#10b981', bg: 'rgba(16,185,129,0.15)' };
    if (percent >= 50) return { bar: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
    return { bar: '#e04bd6', bg: 'rgba(224,75,214,0.15)' };
  };
  const colors = getColor();

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Circular Progress */}
      <div className="relative w-44 h-44">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Background circle */}
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" strokeWidth="8" />
          {/* Progress arc */}
          <motion.circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke={colors.bar}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - percent / 100) }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-black text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {percent.toFixed(0)}%
          </motion.span>
          <span className="text-xs font-semibold text-text-secondary">{label}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="text-center space-y-1">
        <p className="text-lg font-black text-foreground">Bs {formattedCurrent}</p>
        <p className="text-xs font-medium text-text-secondary">Meta: Bs {formattedGoal}</p>
      </div>

      {/* Progress bar fallback */}
      <div className="w-full h-3 rounded-full bg-border/50 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${colors.bar}, ${colors.bar}dd)` }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
