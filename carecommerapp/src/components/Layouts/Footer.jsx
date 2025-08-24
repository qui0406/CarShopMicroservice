import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const FooterSection = ({ title, items }) => {
  return (
    <div>
      <h3 className="font-bold mb-2 text-base">{title}</h3>
      <ul className="space-y-1 text-sm">
        {items.map((item, index) => (
          <li key={index}>
            {item.isExternal ? (
              <a
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-400"
              >
                {item.label}
              </a>
            ) : (
              <Link to={item.path} className="text-white hover:text-blue-400">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Footer = () => {
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
      title: 'Our Mobile App',
      items: [
        { label: 'Download on the Apple Store', path: 'https://apple.com/app-store', isExternal: true },
        { label: 'Get it on Google Play', path: 'https://play.google.com/store', isExternal: true },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-6">
          {sections.map((section, index) => (
            <FooterSection key={index} title={section.title} items={section.items} />
          ))}
          <div>
            <h3 className="font-bold mb-2 text-base">Connect With Us</h3>
            <div className="flex justify-start space-x-4 text-sm">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400">
                <FaFacebookF />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4 text-sm text-center">
          <p>&copy; 2023 Boxcars.com. All rights reserved.</p>
          <div className="mt-2">
            <Link to="/terms" className="text-white hover:text-blue-400">Terms & Conditions</Link> •
            <Link to="/privacy" className="text-white hover:text-blue-400 ml-2">Privacy Notice</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;