function Home() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Amazing Travel Stories
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Share your adventures and explore destinations through the experiences
          of fellow travelers from around the world.
        </p>
        <div className="mt-8">
          <a
            href="/register"
            className="inline-block px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-md"
          >
            Start Sharing Your Story
          </a>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
          >
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Story Title {item}
            </h3>
            <p className="text-gray-600 text-sm">
              Placeholder for travel story content. Stories will appear here
              once created.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
