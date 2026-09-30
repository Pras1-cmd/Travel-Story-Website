function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">TravelStory</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Share your travel experiences and discover amazing destinations
              through the stories of fellow travelers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Login
                </a>
              </li>
              <li>
                <a href="/register" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Sign Up
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-400 text-sm">
              Have questions or feedback?
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Reach out to us anytime.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} TravelStory. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
