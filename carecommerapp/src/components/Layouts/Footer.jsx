import React from 'react';

const FooterSection = ({ title, items }) => {
  // Mock Link component for demo
  const Link = ({ to, children, className }) => (
    <a href="#" className={className} onClick={(e) => {e.preventDefault(); console.log('Navigate to:', to);}}>
      {children}
    </a>
  );

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-white text-lg mb-4 relative">
        {title}
        <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      </h3>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index}>
            {item.isExternal ? (
              <a
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block group"
              >
                <span className="group-hover:text-blue-400">{item.label}</span>
                <span className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </a>
            ) : (
              <Link to={item.path} className="text-gray-300 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block group">
                <span className="group-hover:text-blue-400">{item.label}</span>
                <span className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Footer = () => {
  // Mock Link component for demo
  const Link = ({ to, children, className }) => (
    <a href="#" className={className} onClick={(e) => {e.preventDefault(); console.log('Navigate to:', to);}}>
      {children}
    </a>
  );

  const sections = [
    {
      title: 'Company',
      items: [
        { label: 'About Us', path: '/about' },
        { label: 'Blog', path: '/blog' },
        { label: 'Services', path: '/services' },
        { label: 'FAQs', path: '/faqs' },
        { label: 'Terms', path: '/terms' },
        { label: 'Contact Us', path: '/contact' },
      ],
    },
    {
      title: 'Quick Links',
      items: [
        { label: 'Get in Touch', path: '/get-in-touch' },
        { label: 'Help Center', path: '/help-center' },
        { label: 'Live Chat', path: '/live-chat' },
        { label: 'How it Works', path: '/how-it-works' },
      ],
    },
    {
      title: 'Our Brands',
      items: [
        { label: 'Toyota', path: '/toyota' },
        { label: 'Porsche', path: '/porsche' },
        { label: 'Audi', path: '/audi' },
        { label: 'BMW', path: '/bmw' },
        { label: 'Ford', path: '/ford' },
        { label: 'Nissan', path: '/nissan' },
        { label: 'Peugeot', path: '/peugeot' },
        { label: 'Volkswagen', path: '/volkswagen' },
      ],
    },
    {
      title: 'Vehicle Types',
      items: [
        { label: 'Sedan', path: '/sedan' },
        { label: 'Hatchback', path: '/hatchback' },
        { label: 'SUV', path: '/suv' },
        { label: 'Hybrid', path: '/hybrid' },
        { label: 'Electric', path: '/electric' },
        { label: 'Coupe', path: '/coupe' },
        { label: 'Truck', path: '/truck' },
        { label: 'Convertible', path: '/convertible' },
      ],
    },
    {
      title: 'Mobile App',
      items: [
        { label: 'Download for iOS', path: 'https://apple.com/app-store', isExternal: true },
        { label: 'Download for Android', path: 'https://play.google.com/store', isExternal: true },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
      <div className="absolute top-4 right-4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-4 left-4 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Top section with logo and description */}
          <div className="mb-16">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
              <div className="flex-1 max-w-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">B</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white">BoxCars</h2>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  Your trusted partner in finding the perfect vehicle. We connect you with quality cars and exceptional service, making your car buying journey smooth and enjoyable.
                </p>
                
                {/* Newsletter signup */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-white font-semibold mb-3">Stay Updated</h3>
                  <p className="text-gray-400 text-sm mb-4">Get the latest car deals and news directly to your inbox</p>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Contact info */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 min-w-80">
                <h3 className="text-white font-bold text-lg mb-4">Get in Touch</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 text-lg">📍</span>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Address</p>
                      <p className="text-white">123 Car Street, Auto City</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-green-400 text-lg">📞</span>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Phone</p>
                      <p className="text-white">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-purple-400 text-lg">✉️</span>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Email</p>
                      <p className="text-white">hello@boxcars.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {sections.map((section, index) => (
              <FooterSection key={index} title={section.title} items={section.items} />
            ))}
          </div>

          {/* Social media section */}
          <div className="mb-12">
            <h3 className="text-white font-bold text-lg mb-6 text-center">Connect With Us</h3>
            <div className="flex justify-center space-x-4">
              {[
                { icon: '📘', name: 'Facebook', href: 'https://facebook.com', color: 'from-blue-600 to-blue-500' },
                { icon: '🐦', name: 'Twitter', href: 'https://twitter.com', color: 'from-sky-500 to-sky-400' },
                { icon: '📷', name: 'Instagram', href: 'https://instagram.com', color: 'from-pink-500 to-purple-500' },
                { icon: '💼', name: 'LinkedIn', href: 'https://linkedin.com', color: 'from-blue-700 to-blue-600' },
                { icon: '🎵', name: 'TikTok', href: 'https://tiktok.com', color: 'from-gray-800 to-gray-700' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-12 h-12 bg-gradient-to-r ${social.color} rounded-xl flex items-center justify-center text-white hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl group`}
                  title={social.name}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-gray-400">
                  © 2024 BoxCars.com. All rights reserved.
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Made with ❤️ for car enthusiasts worldwide
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
                <Link to="/sitemap" className="text-gray-400 hover:text-white transition-colors">
                  Sitemap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;