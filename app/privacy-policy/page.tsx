import { Footer } from '@/components/footer'

export default function PrivacyPolicy() {
  return (
    <div>
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-center mb-8">Privacy Policy</h1>

          <div className="prose prose-gray max-w-none">
            <p>At SereneNow, we prioritize the privacy and security of our users - both mental health professionals and their clients. This Privacy Policy outlines how we collect, use, and protect your information when you use our mobile applications and services.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
            <p>We collect different types of information depending on whether you're using our Expert app or Client app:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Expert App Users:</strong> Professional credentials, contact information, and bank account information (for payments)</li>
              <li><strong>Client App Users:</strong> Basic profile information, contact details, emergency contact details, and appointment history</li>
              <li><strong>Usage Data:</strong> App interaction data, device information, and analytics to improve our service</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
            <p>Your information is used to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Facilitate appointments between experts and clients</li>
              <li>Process payments and handle payouts</li>
              <li>Improve our platform and user experience</li>
              <li>Send important updates about our services</li>
              <li>Comply with legal obligations</li>
              <li>Schedule and manage therapy appointments through calendar integration</li>
              <li>Facilitate secure video therapy sessions</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Payment Processing</h2>
            <p>We use secure payment gateways (Cashfree) to process payments. While we store transaction records, we do not store complete payment information. All payment processing is handled through our authorized payment partners.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
            <p>We implement various security measures to protect your information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Secure data transmission using encryption</li>
              <li>Regular security audits and updates</li>
              <li>Strict access controls for user data</li>
              <li>Secure data storage practices</li>
              <li>Secure OAuth 2.0 implementation for third-party integrations</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Sharing</h2>
            <p>We share information only in these limited circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Between experts and their clients (limited to necessary appointment information)</li>
              <li>With payment processors to facilitate transactions</li>
              <li>When required by law or to protect rights</li>
              <li>With your explicit consent</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Cookies and Tracking</h2>
            <p>Our apps and website use cookies and similar technologies to enhance user experience and collect usage data. You can control cookie settings through your device or browser settings.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Children's Privacy</h2>
            <p>Our services are not intended for users under 18 years of age. We do not knowingly collect information from children.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to Privacy Policy</h2>
            <p>We may update this privacy policy periodically. Users will be notified of significant changes through the app or email.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Calendar and Video Integration</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">Calendar Data Collection and Usage</h3>
            <p>We collect and process calendar data solely for the purpose of scheduling and managing therapy appointments. This includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Calendar Event Data:</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Appointment date and time</li>
                  <li>Duration of the session</li>
                  <li>Participant email addresses (expert and client only)</li>
                  <li>Basic event description (without sensitive medical information)</li>
                </ul>
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Video Conferencing Privacy</h3>
            <p>We utilize Google Meet for secure video therapy sessions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Video Session Security:</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>All sessions require participant authentication</li>
                  <li>End-to-end encryption for video communications</li>
                  <li>No third-party access to session content</li>
                  <li>No persistent storage of video data</li>
                </ul>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
            <p>For privacy-related questions or concerns, please contact us at:</p>
            <p>
              Email: <a href="mailto:admin@serenenow.in" className="text-blue-600 hover:text-blue-800">admin@serenenow.in</a><br />
              Address: Pune, Maharashtra, India
            </p>

            <p className="text-gray-600 italic mt-8">Last updated: April 5, 2024</p>
          </div>
        </div>
      </main>

    </div>
  )
}
