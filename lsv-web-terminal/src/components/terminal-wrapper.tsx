'use client';

import dynamic from 'next/dynamic';

const TerminalComponent = dynamic(
  () =>
    import('./terminal').then((mod) => ({ default: mod.TerminalComponent })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-green-400 font-mono">Loading terminal...</div>
      </div>
    ),
  },
);

export function TerminalWrapper() {
  return <TerminalComponent />;
}
