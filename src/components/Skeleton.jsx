// Reusable skeleton components untuk loading states

const shimmer = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

// Base skeleton block
export const SkeletonBlock = ({ className = '' }) => (
  <div className={`${shimmer} ${className}`} />
);

// Skeleton untuk ProductCard
export const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
    <SkeletonBlock className="h-64 w-full rounded-none" />
    <div className="p-6 space-y-3">
      <div className="flex justify-between">
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="h-5 w-10" />
      </div>
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-3/4" />
      <div className="flex justify-between items-center pt-2">
        <div className="space-y-1">
          <SkeletonBlock className="h-7 w-24" />
          <SkeletonBlock className="h-3 w-16" />
        </div>
        <SkeletonBlock className="h-10 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

// Skeleton untuk TestimoniCard
export const TestimoniCardSkeleton = () => (
  <div className="bg-cream dark:bg-gray-800 rounded-2xl p-6 shadow-lg space-y-4">
    <SkeletonBlock className="h-8 w-8 rounded-lg" />
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => <SkeletonBlock key={i} className="h-5 w-5 rounded" />)}
    </div>
    <div className="space-y-2">
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-2/3" />
    </div>
    <div className="flex items-center space-x-3 pt-2">
      <SkeletonBlock className="h-12 w-12 rounded-full" />
      <div className="space-y-1.5">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-3 w-16" />
      </div>
    </div>
  </div>
);

// Skeleton untuk halaman produk (grid 4 kolom)
export const ProductGridSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
    {[...Array(count)].map((_, i) => <ProductCardSkeleton key={i} />)}
  </div>
);

// Skeleton untuk testimoni grid
export const TestimoniGridSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
    {[...Array(count)].map((_, i) => <TestimoniCardSkeleton key={i} />)}
  </div>
);

// Skeleton untuk admin list item
export const AdminListSkeleton = ({ count = 5 }) => (
  <div className="divide-y divide-gray-50">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="px-6 py-4 flex items-center space-x-4">
        <SkeletonBlock className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-2/3" />
        </div>
        <SkeletonBlock className="w-8 h-8 rounded-full flex-shrink-0" />
      </div>
    ))}
  </div>
);
