import React from 'react';
import { cn } from '@/lib/utils';


interface SkeletonProps {
  className?: any; // TODO: Define proper type for className
   // TODO: Define proper type for ...props
}

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };
