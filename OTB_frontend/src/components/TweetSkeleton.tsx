
const TweetSkeleton = () => {
  return (
    <div className="w-full max-w-[500px] bg-transparent backdrop-blur-lg text-white h-[100vh] border-l border-[#808080]">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between py-[24px] px-4">
        <div className="h-4 w-32 bg-gray-700 animate-pulse rounded" />
      </div>

      {/* Description Skeleton */}
      <div className="px-4 pb-[24px] border-b border-[#333639]">
        <div className="p-[20px] rounded-[20px] border-[1px] border-[#333639]">
          <div className="h-20 bg-gray-700 animate-pulse rounded" />
        </div>
      </div>

      {/* Trending Topics Skeleton */}
      <div className="p-4 mb-[24px]">
        <div className="h-4 w-40 bg-gray-700 animate-pulse rounded mb-3" />
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-6 w-20 bg-gray-700 animate-pulse rounded" />
          ))}
        </div>
      </div>

      {/* Tweet Skeletons */}
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="p-4 border-b border-[#808080]">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gray-700 animate-pulse rounded-full" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-gray-700 animate-pulse rounded mb-2" />
              <div className="h-12 bg-gray-700 animate-pulse rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TweetSkeleton