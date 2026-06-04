// Reusable skeleton components untuk loading states

// Enhanced shimmer with gradient animation
const shimmer = 'relative overflow-hidden bg-gray-200 dark:bg-gray-700 rounded before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 dark:before:via-gray-600/20 before:to-transparent';

// Base skeleton block
export const SkeletonBlock = ({ className = '' }) => (
  <div className={`${shimmer} ${className}`} />
);

// Skeleton untuk ProductCard
export const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
    <SkeletonBlock className="h-64 w-full rounded-none" />
    <div className="p-6 space-y-3">
      <div className="flex justify-between">
        <SkeletonBlock className="h-6 w-32" />
        <SkeletonBlock className="h-6 w-12 rounded-full" />
      </div>
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-3/4" />
      <div className="flex justify-between items-center pt-2">
        <div className="space-y-1">
          <SkeletonBlock className="h-8 w-28" />
          <SkeletonBlock className="h-3 w-20" />
        </div>
        <SkeletonBlock className="h-12 w-24 rounded-full" />
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

// Skeleton untuk Cart Item
export const CartItemSkeleton = ({ count = 3 }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-start space-x-3 py-4 border-b border-gray-100 dark:border-gray-700">
        <SkeletonBlock className="w-16 h-16 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-3 w-24" />
          <div className="flex items-center justify-between mt-2">
            <SkeletonBlock className="h-6 w-20" />
            <SkeletonBlock className="h-4 w-16" />
          </div>
        </div>
      </div>
    ))}
  </>
);

// Skeleton untuk Stats Card (Admin Dashboard)
export const StatsCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <SkeletonBlock className="h-10 w-10 rounded-xl" />
      <SkeletonBlock className="h-4 w-16 rounded-full" />
    </div>
    <SkeletonBlock className="h-8 w-24 mb-2" />
    <SkeletonBlock className="h-3 w-32" />
  </div>
);

// Skeleton untuk Table Row
export const TableRowSkeleton = ({ count = 5, columns = 4 }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
        {[...Array(columns)].map((_, j) => (
          <td key={j} className="px-4 py-3">
            <SkeletonBlock className="h-4 w-full" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

// Skeleton untuk Chart (Admin Dashboard)
export const ChartSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
    <SkeletonBlock className="h-6 w-32 mb-6" />
    <div className="flex items-end justify-between space-x-2 h-48">
      {[...Array(7)].map((_, i) => (
        <SkeletonBlock
          key={i}
          className="w-full rounded-t-lg"
          style={{ height: `${Math.random() * 60 + 40}%` }}
        />
      ))}
    </div>
  </div>
);

// Skeleton untuk Loading Button
export const ButtonLoader = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

// Skeleton untuk Full Page Loading
export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-warm-cream to-peach dark:from-gray-900 dark:to-gray-800">
    <div className="relative">
      <div className="w-20 h-20 border-4 border-chocolate/20 dark:border-pastel-pink/20 border-t-chocolate dark:border-t-pastel-pink rounded-full animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl animate-bounce">🍩</span>
      </div>
    </div>
    <p className="mt-6 text-chocolate dark:text-pastel-pink font-semibold text-lg animate-pulse">
      Memuat...
    </p>
  </div>
);

// Skeleton untuk Image Loading
export const ImageSkeleton = ({ className = '' }) => (
  <div className={`${shimmer} ${className}`}>
    <div className="flex items-center justify-center h-full">
      <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
    </div>
  </div>
);
