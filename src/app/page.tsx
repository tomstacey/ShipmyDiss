import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Ship My Dissertation
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          AI-powered project management for your dissertation.
          Plan it. Track it. Ship it.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signin"
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Get started
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 font-medium rounded-lg transition-colors"
          >
            How it works
          </a>
        </div>
      </div>
    </div>
  );
}
