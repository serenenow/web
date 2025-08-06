'use client';

import { useEffect, useState } from 'react';
import { logEnvironmentVariables, getEnv } from '@/lib/utils/env-debug';

export default function EnvironmentDebugPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Log all NEXT_PUBLIC_ environment variables to console
    logEnvironmentVariables('NEXT_PUBLIC_');
    
    // Collect environment variables for display
    const publicEnvVars: Record<string, string> = {};
    
    // We can only access NEXT_PUBLIC_ prefixed env vars on the client
    publicEnvVars['NEXT_PUBLIC_API_BASE_URL'] = getEnv('NEXT_PUBLIC_API_BASE_URL', 'Not set');
    publicEnvVars['NEXT_PUBLIC_API_DEBUG'] = getEnv('NEXT_PUBLIC_API_DEBUG', 'Not set');
    publicEnvVars['NODE_ENV'] = getEnv('NODE_ENV', 'Not set');
    
    setEnvVars(publicEnvVars);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      
      {!isClient && (
        <p className="text-amber-600">Loading client-side environment...</p>
      )}
      
      <div className="bg-gray-100 p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Public Environment Variables</h2>
        <p className="text-sm text-gray-500 mb-4">
          Note: Only variables prefixed with NEXT_PUBLIC_ are accessible on the client side
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 text-left">Variable</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(envVars).map(([key, value]) => (
                <tr key={key} className="hover:bg-gray-200">
                  <td className="border border-gray-300 px-4 py-2 font-mono">{key}</td>
                  <td className="border border-gray-300 px-4 py-2 font-mono">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">API Environment Settings</h3>
          <p className="mb-2">Check the browser console for more detailed environment logs.</p>
          <p className="text-sm text-gray-600">
            Remember that environment variables are embedded at build time. 
            Changes require rebuilding the application.
          </p>
        </div>
      </div>
    </div>
  );
}
