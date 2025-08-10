export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-light via-white to-lavender-light flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-dark mx-auto mb-4"></div>
        <p className="text-charcoal/70">Loading booking page...</p>
      </div>
    </div>
  )
}
