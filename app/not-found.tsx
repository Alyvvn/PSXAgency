import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-2xl mt-4">Page Not Found</p>
      <p className="mt-2 text-zinc-400">Sorry, the page you are looking for does not exist.</p>
      <Link href="/" className="mt-8 px-6 py-3 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
        Return Home
      </Link>
    </div>
  );
}
