interface ProductSkeletonProps {
  count?: number;
}

export function ProductSkeleton({ count = 10 }: ProductSkeletonProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-fade-in-up"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="skeleton w-full aspect-square" />
            <div className="p-3 space-y-2">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
              <div className="skeleton h-5 w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
