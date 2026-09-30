function Register() {
  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Create Account
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Registration functionality will be implemented in Phase 2
        </p>

        {/* Placeholder Form */}
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              disabled
            />
          </div>

          <button
            type="button"
            className="w-full px-6 py-3 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed"
            disabled
          >
            Register (Coming Soon)
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:underline font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
