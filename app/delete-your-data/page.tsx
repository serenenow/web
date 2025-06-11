import Image from 'next/image';
import Link from 'next/link';

export default function DeleteYourData() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/favicon.png" alt="SereneNow Logo" width={30} height={30} />
            <span className="text-xl font-semibold text-gray-900">SereneNow</span>
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/#features" className="text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="/#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/#about" className="text-gray-600 hover:text-gray-900">About</Link>
            <Link href="/#faq" className="text-gray-600 hover:text-gray-900">FAQ</Link>
            <Link href="/#contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-8">Delete Your Data</h1>

        <p className="text-lg text-gray-700 mb-8 leading-relaxed text-center max-w-2xl mx-auto">
          At SereneNow, we respect your right to control your personal data. You can delete your account and associated data through the following methods:
        </p>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Method 1: Through the App</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Open the SereneNow app</li>
            <li>Navigate to Profile &gt; Settings &gt; Delete Account</li>
            <li>Follow the on-screen prompts to confirm deletion</li>
          </ol>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Method 2: Contact Us</h2>
          <p className="mb-2">If you prefer, you can request account deletion by contacting us directly:</p>
          <p>Email: <a href="mailto:admin@serenenow.in" className="text-blue-600 hover:underline">admin@serenenow.in</a></p>
        </div>

        <div className="border-t border-gray-200 pt-8 mt-8">
          <h2 className="text-xl font-semibold mb-4">What Happens When You Delete Your Account?</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>All your personal information will be permanently deleted within 90 days of your request</li>
            <li>Your appointment history and related data will be removed within 90 days</li>
            <li>Any active subscriptions will be cancelled immediately</li>
            <li>You will no longer be able to access your account after deletion</li>
          </ul>
        </div>

        <p className="mt-8 text-gray-600 italic">
          Note: Some data may be retained for legal or regulatory purposes as required by law. Complete data deletion will occur within 90 days of your request.
        </p>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Image src="/images/favicon.png" alt="SereneNow Logo" width={24} height={24} className="footer-logo" />
              <span className="text-lg font-semibold text-gray-900">SereneNow</span>
            </div>
            <div className="space-x-6">
              <Link href="/terms-of-service" className="text-sm text-gray-600 hover:text-gray-900">Terms of Service</Link>
              <Link href="/privacy-policy" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</Link>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-8">&copy; {new Date().getFullYear()} SereneNow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
