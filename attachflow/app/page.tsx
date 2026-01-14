'use client';

import { useState } from 'react';

export default function Home() {
  const [siteKey, setSiteKey] = useState('demo-site-key');
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AttachFlow
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Add file uploads to any Webflow form with a simple script. 
              No expensive Business plan required.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setShowDashboard(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
              >
                Get Started Free
              </button>
              <p className="text-gray-500">No credit card required</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Add Our Script</h3>
              <p className="text-gray-600">
                Copy and paste our script into your Webflow site settings
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Automatic Detection</h3>
              <p className="text-gray-600">
                AttachFlow automatically adds upload buttons to your forms
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Files by Email</h3>
              <p className="text-gray-600">
                Receive form submissions with attached files in your inbox
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Dashboard */}
      {showDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold mb-6">Your Dashboard</h2>
            
            {/* Installation Instructions */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Installation</h3>
              <p className="text-gray-600 mb-4">
                Add this code to your Webflow site's custom code section:
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                <pre className="text-sm">
{`<script>
  window.ATTACHFLOW_SITE_KEY = '${siteKey}';
  window.ATTACHFLOW_API_URL = '${typeof window !== 'undefined' ? window.location.origin : ''}/api';
</script>
<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js"></script>`}
                </pre>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`<script>
  window.ATTACHFLOW_SITE_KEY = '${siteKey}';
  window.ATTACHFLOW_API_URL = '${window.location.origin}/api';
</script>
<script src="${window.location.origin}/widget.js"></script>`);
                  alert('Copied to clipboard!');
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Copy Code
              </button>
            </div>

            {/* Recent Uploads */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Recent Uploads</h3>
              <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                No uploads yet. Install the widget on your site to start receiving files.
              </div>
            </div>

            {/* Settings */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Key
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    value={siteKey}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDashboard(false)}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Demo Form */}
      <div className="py-16 bg-white">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Try It Out</h2>
          <form className="space-y-4 bg-gray-50 p-8 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                placeholder="Your message..."
              />
            </div>
            <div id="attachflow-demo"></div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* Load widget for demo */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.ATTACHFLOW_SITE_KEY = 'demo-site-key';
            window.ATTACHFLOW_API_URL = '${typeof window !== 'undefined' ? window.location.origin : ''}/api';
          `
        }}
      />
      <script src="/widget.js" async />
    </div>
  );
}