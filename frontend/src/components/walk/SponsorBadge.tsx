'use client';
import { Diamond, Award, Medal, Star } from 'lucide-react';

const tierConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  DIAMOND: { label: 'Diamante', color: 'text-violet-600', bg: 'bg-violet-100', icon: Diamond },
  PLATINUM: { label: 'Platino', color: 'text-slate-600', bg: 'bg-slate-100', icon: Award },
  GOLD: { label: 'Oro', color: 'text-amber-600', bg: 'bg-amber-100', icon: Medal },
  SILVER: { label: 'Plata', color: 'text-gray-500', bg: 'bg-gray-100', icon: Star },
};

export default function SponsorBadge({ tier }: { tier: string }) {
  const config = tierConfig[tier] || tierConfig.SILVER;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wide ${config.color} ${config.bg}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}
