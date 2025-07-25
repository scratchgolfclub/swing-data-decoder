import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserBadge } from '@/utils/badgeService';
import { X, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeNotificationProps {
  badge: UserBadge;
  onDismiss: () => void;
  className?: string;
}

export function BadgeNotification({ badge, onDismiss, className }: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 transition-all duration-500 ease-out',
      isVisible && !isExiting 
        ? 'transform translate-x-0 opacity-100' 
        : 'transform translate-x-full opacity-0',
      className
    )}>
      <Card className="w-80 border-primary shadow-lg shadow-primary/20 bg-gradient-to-r from-background to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Badge Icon */}
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-2xl animate-bounce">
                {badge.badge.icon_emoji}
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Badge Earned!</span>
              </div>
              
              <h3 className="font-semibold text-foreground mb-1">
                {badge.badge.name}
              </h3>
              
              <p className="text-sm text-muted-foreground">
                {badge.badge.description}
              </p>
            </div>
            
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="flex-shrink-0 h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Confetti Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'absolute w-2 h-2 bg-primary rounded-full animate-ping',
                  'opacity-60'
                )}
                style={{
                  left: `${20 + i * 10}%`,
                  top: `${20 + (i % 3) * 20}%`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface BadgeNotificationManagerProps {
  newBadges: UserBadge[];
  onBadgeDismissed: (badgeId: string) => void;
}

export function BadgeNotificationManager({ 
  newBadges, 
  onBadgeDismissed 
}: BadgeNotificationManagerProps) {
  const [displayedBadges, setDisplayedBadges] = useState<UserBadge[]>([]);

  useEffect(() => {
    if (newBadges.length > 0) {
      // Show badges one by one with a delay
      newBadges.forEach((badge, index) => {
        setTimeout(() => {
          setDisplayedBadges(prev => [...prev, badge]);
        }, index * 2000); // 2 second delay between badges
      });
    }
  }, [newBadges]);

  const handleDismiss = (badgeId: string) => {
    setDisplayedBadges(prev => prev.filter(b => b.id !== badgeId));
    onBadgeDismissed(badgeId);
  };

  return (
    <>
      {displayedBadges.map((badge, index) => (
        <BadgeNotification
          key={badge.id}
          badge={badge}
          onDismiss={() => handleDismiss(badge.id)}
          className={`top-${1 + index * 6}`}
        />
      ))}
    </>
  );
}