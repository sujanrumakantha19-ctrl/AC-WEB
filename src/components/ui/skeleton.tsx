import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-container-low rounded-lg ${className}`} />;
}

export function SkeletonText({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-3.5 ${className}`} />;
}

export function SkeletonAvatar({ className = "" }: { className?: string }) {
  return <Skeleton className={`rounded-full ${className}`} />;
}

export function SkeletonBadge({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-6 w-20 rounded-full ${className}`} />;
}

export function AuctionCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xs flex flex-col">
      <div className="relative h-44 w-full bg-black/5">
        <Skeleton className="absolute inset-0 rounded-none h-full w-full bg-surface-container-low/60" />
        <div className="absolute top-2.5 left-2.5">
          <SkeletonBadge className="h-6 w-20" />
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <SkeletonText className="w-3/4" />
        <div className="flex items-center justify-between mt-2.5">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <SkeletonText className="w-full mt-2.5" />
        <SkeletonText className="w-2/3 mt-1.5" />
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-outline-variant/30">
          <div className="space-y-1.5">
            <SkeletonText className="w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function AuctionGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <AuctionCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4, className = "" }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-xs p-4 flex items-center gap-3">
          <SkeletonAvatar className="w-9 h-9 shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonText className="w-1/3" />
            <SkeletonText className="w-1/2" />
          </div>
          <Skeleton className="h-6 w-14 rounded-md shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function AuctionDetailSkeleton() {
  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-unit-lg w-full space-y-unit-lg">
      <div className="flex items-center gap-2">
        <SkeletonText className="w-12" />
        <SkeletonText className="w-16" />
        <SkeletonText className="w-32" />
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/20 pb-unit-md">
        <div className="space-y-2">
          <Skeleton className="h-7 w-20 rounded-lg" />
          <SkeletonText className="w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-4">
          <div className="relative h-80 bg-surface-container-low rounded-2xl overflow-hidden">
            <Skeleton className="absolute inset-0 bg-surface-container-low/60" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-20 h-20 rounded-xl shrink-0" />
            ))}
          </div>
          <div className="space-y-4">
            <SkeletonText className="w-40" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-xs space-y-4 h-fit sticky top-24">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <div className="space-y-3">
            <SkeletonText className="w-16" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProfileFormSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <SkeletonBadge className="w-28" />
        <SkeletonText className="w-20" />
      </div>
      <Skeleton className="h-8 w-32" />
      <div className="bg-white rounded-3xl overflow-hidden shadow-xs">
        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-4">
            <SkeletonAvatar className="w-16 h-16" />
            <div className="space-y-1.5">
              <SkeletonText className="w-28" />
              <SkeletonText className="w-40" />
              <SkeletonText className="w-24" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <SkeletonText className="w-20" />
                <Skeleton className="h-10 rounded-xl" />
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4 border-t border-outline-variant/20">
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuctionFormSkeleton() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-outline-variant/30">
        <div className="space-y-1">
          <Skeleton className="h-7 w-56" />
          <SkeletonText className="w-72" />
        </div>
      </div>
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xs space-y-6">
        <Skeleton className="h-6 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <SkeletonText className="w-20" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-32 w-32 rounded-xl" />
          <Skeleton className="h-32 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <SkeletonText className="w-20" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
