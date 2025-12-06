'use client';

export default function DebugEnv() {
  const envVars = {
    EIA_API_KEY: process.env.EIA_API_KEY,
    UTILITY_API_KEY: process.env.UTILITY_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      <div className="space-y-2">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex">
            <span className="font-mono w-48">{key}:</span>
            <span className="font-mono">
              {value ? `${value.substring(0, 20)}...` : 'NOT SET'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
