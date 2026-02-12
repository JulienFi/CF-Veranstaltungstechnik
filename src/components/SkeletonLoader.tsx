export function ProductCardSkeleton() {
  return (
    <div className="bg-card-bg border border-gray-800 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-card-hover"></div>
      <div className="p-6">
        <div className="flex gap-2 mb-3">
          <div className="h-6 w-20 bg-card-hover rounded"></div>
          <div className="h-6 w-16 bg-card-hover rounded"></div>
        </div>
        <div className="h-6 bg-card-hover rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-card-hover rounded mb-4 w-full"></div>
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-card-hover rounded"></div>
          <div className="h-10 w-10 bg-card-hover rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="bg-app-bg min-h-screen">
      <section className="py-12 bg-card-bg/50">
        <div className="container mx-auto px-4">
          <div className="h-6 w-32 bg-card-hover rounded mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-card-hover rounded-xl animate-pulse"></div>
            <div className="space-y-4 animate-pulse">
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-card-hover rounded"></div>
                <div className="h-8 w-20 bg-card-hover rounded"></div>
              </div>
              <div className="h-10 bg-card-hover rounded w-3/4"></div>
              <div className="h-6 bg-card-hover rounded"></div>
              <div className="h-12 bg-card-hover rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-card-hover rounded"></div>
                <div className="h-4 bg-card-hover rounded"></div>
                <div className="h-4 bg-card-hover rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function CategoryFilterSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-10 w-32 bg-card-hover rounded-lg"></div>
      ))}
    </div>
  );
}
