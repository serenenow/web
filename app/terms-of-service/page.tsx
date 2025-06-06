import { Footer } from '@/components/footer'

export default function TermsOfService() {
  return (
    <div>
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-center mb-8">Terms of Service</h1>

          <div className="prose prose-gray max-w-none">
            <p>Welcome to <strong>SereneNow</strong>! By using our platform (website and mobile apps), you agree to the following terms. Please read them carefully.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Who Can Use SereneNow</h2>
            <p>You must be at least 18 years old to use SereneNow. If you're an expert, you must have valid professional credentials and follow all local regulations related to mental health services.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. What SereneNow Does</h2>
            <p>SereneNow connects mental health professionals (Experts) with clients seeking therapy. We provide tools for scheduling, communication, and secure payments.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Experts</strong> are solely responsible for the quality, legality, and accuracy of the services they provide.</li>
              <li><strong>Clients</strong> are responsible for the information they provide and for engaging with experts respectfully.</li>
              <li>All users must keep their login details safe and must not share accounts.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Payments</h2>
            <p>Experts may charge for their sessions. SereneNow may collect a platform or subscription fee to keep the service running. Clients will see full prices (including applicable taxes and convenience fees) before making payments.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Confidentiality</h2>
            <p>We take data privacy seriously. Experts must maintain client confidentiality. SereneNow stores your data securely and never shares it with third parties without consent.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that misuse the platform or violate these terms.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Liability</h2>
            <p>SereneNow is a technology platform. We do not provide therapy ourselves and are not responsible for the quality or outcomes of services delivered by experts.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Disputes</h2>
            <p>Any disputes between clients and experts must be resolved between them. SereneNow may assist in limited cases, but we are not liable for resolving such issues.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to Terms</h2>
            <p>We may update these terms occasionally. We'll notify users of major changes through email or in-app alerts.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes will be subject to the jurisdiction of courts in Bengaluru, Karnataka.</p>

            <p>By using SereneNow, you agree to these Terms of Service. Thanks for being part of our mission to make therapy more accessible and seamless!</p>

            <p className="text-gray-600 italic mt-8">Last updated: April 3, 2025</p>
          </div>
        </div>
      </main>

    </div>
  )
}
