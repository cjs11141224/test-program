import { Skeleton } from '@/components/ui/skeleton';

const ModelCardSkeleton = () => {
  return (
    <div className="h-full rounded-xl overflow-hidden bg-white border">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
};

export default ModelCardSkeleton;
