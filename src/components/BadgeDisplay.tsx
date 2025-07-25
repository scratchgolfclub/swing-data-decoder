import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Badge as BadgeType, BadgeProgress } from '@/utils/badgeService';
import { cn } from '@/lib/utils';

interface BadgeDisplayProps {
  badgeProgress: BadgeProgress;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
  onInteraction?: () => void;
}

export function BadgeDisplay({ 
  badgeProgress, 
  size = 'md', 
  showProgress = false,
  className,
  onInteraction 
}: BadgeDisplayProps) {
  const { badge, earned, progress, total, is_new } = badgeProgress;
  
  const sizeClasses = {
    sm: 'h-8 w-8 text-lg',
    md: 'h-12 w-12 text-2xl',
    lg: 'h-16 w-16 text-3xl'
  };

  const progressPercentage = total > 0 ? (progress / total) * 100 : 0;

  const handleClick = () => {
    if (earned && is_new && onInteraction) {
      onInteraction();
    }
  };

  const handleMouseEnter = () => {
    if (earned && is_new && onInteraction) {
      onInteraction();
    }
  };

  return (
    <div className={cn('relative group', className)}>
      {/* Badge Circle */}
      <div
        className={cn(
          'rounded-full border-2 flex items-center justify-center transition-all duration-300',
          sizeClasses[size],
          earned 
            ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20' 
            : 'border-muted bg-muted/20 text-muted-foreground grayscale',
          earned && 'hover:scale-110 hover:shadow-xl hover:shadow-primary/30',
          is_new && 'animate-pulse ring-2 ring-primary ring-offset-2',
          (earned && is_new) && 'cursor-pointer'
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
      >
        <span className="font-medium">{badge.icon_emoji}</span>
        
        {/* New Badge Indicator */}
        {is_new && (
          <div className="absolute -top-1 -right-1">
            <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
              NEW
            </Badge>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && !earned && total > 0 && (
        <div className="mt-2 w-full">
          <Progress value={progressPercentage} className="h-1" />
          <div className="text-xs text-muted-foreground mt-1 text-center">
            {progress}/{total}
          </div>
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 min-w-max">
        <div className="font-semibold text-sm">{badge.name}</div>
        <div className="text-xs text-muted-foreground mt-1">{badge.description}</div>
        {!earned && showProgress && total > 0 && (
          <div className="text-xs text-primary mt-1">
            Progress: {progress}/{total} ({Math.round(progressPercentage)}%)
          </div>
        )}
        {earned && (
          <div className="text-xs text-primary mt-1">✓ Earned!</div>
        )}
      </div>
    </div>
  );
}