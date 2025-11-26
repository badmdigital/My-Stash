import React from 'react';
import { StrainType } from '../types';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'indica' | 'sativa' | 'hybrid' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', className = '' }) => {
  const getColors = () => {
    switch (variant) {
      case 'indica': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'sativa': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'hybrid': return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200';
      case 'outline': return 'bg-transparent border-slate-300 text-slate-600';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColors()} ${className}`}>
      {label}
    </span>
  );
};

export const StrainBadge: React.FC<{ type: StrainType }> = ({ type }) => {
  let variant: BadgeProps['variant'] = 'default';
  if (type === StrainType.INDICA) variant = 'indica';
  if (type === StrainType.SATIVA) variant = 'sativa';
  if (type === StrainType.HYBRID) variant = 'hybrid';

  return <Badge label={type} variant={variant} />;
};
