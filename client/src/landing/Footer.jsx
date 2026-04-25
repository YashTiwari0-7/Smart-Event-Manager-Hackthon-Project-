import React from "react";

const Footer = () => (
  <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        
        {/* Brand */}
        <div className="text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
            <span className="text-2xl font-bold text-primary-500">⚡</span>
            <span className="text-xl font-bold text-white tracking-tight">
              Smart<span className="text-primary-500">Event</span>
            </span>
          </div>
          <p className="text-sm max-w-xs">
            The all-in-one platform for managing college events, coordinators, and registrations without the chaos.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-12 text-sm text-center md:text-left">
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#roles" className="hover:text-white transition-colors">For Teams</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-slate-800 text-sm text-center">
        <p>&copy; {new Date().getFullYear()} SmartEvent Platform. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
