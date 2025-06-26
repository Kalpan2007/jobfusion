import React from 'react';
import { BriefcaseIcon, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white pt-16 pb-8 px-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BriefcaseIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">JOB FUSION</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <span>555-437-2766</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <span>info@jobfusion.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>555 Country Ave, Meriden, CT 06450</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">About</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-blue-600">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Press</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Contact Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Online Chat</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Whatsapp</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Telegram</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Ticketing</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">FAQ</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Account</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Manage Deliveries</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Orders</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Payments</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Returns</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-6">
              <a href="#" className="text-gray-600 hover:text-blue-600">About us</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">Contact</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">Privacy policy</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">Sitemap</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">Terms of Use</a>
            </div>
            <p className="text-gray-600">&copy; Copyright 2024. All Rights Reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;