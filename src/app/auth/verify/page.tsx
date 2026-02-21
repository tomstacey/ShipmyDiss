export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 text-5xl">📬</div>
        <h1 className="text-2xl font-bold text-white mb-4">Check your email</h1>
        <p className="text-gray-400 mb-2">
          A sign-in link has been sent to your email address.
        </p>
        <p className="text-gray-500 text-sm">
          If you don&apos;t see it, check your spam folder.
        </p>
      </div>
    </div>
  );
}
