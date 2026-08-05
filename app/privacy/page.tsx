import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-brand-500 hover:underline mb-8 block">
          &larr; Back to home
        </Link>
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-6">Last updated: June 27, 2026</p>

        <div className="prose prose-sm max-w-none space-y-6">
          <p>
            <strong>Ledgera Global Inc.</strong> (&ldquo;Ledgera,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
            is committed to protecting the privacy of our users (&ldquo;you&rdquo; or &ldquo;your&rdquo;). This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when you visit our website and use our financial
            intelligence platform.
          </p>

          <h2 className="text-xl font-semibold mt-8">1. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Account Information:</strong> name, email address, company name, and password when you create an account.</li>
            <li><strong>Financial Data:</strong> invoices, payments, job costs, payroll data, and other operational financial information from third-party services you authorize (e.g., QuickBooks, ServiceTitan).</li>
            <li><strong>Usage Data:</strong> pages visited, features used, and interactions with the platform.</li>
            <li><strong>Device Information:</strong> browser type, IP address, and operating system.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">2. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide, maintain, and improve our financial intelligence platform</li>
            <li>Analyze financial data to generate insights, reports, and recommendations</li>
            <li>Communicate with you about your account, updates, and support</li>
            <li>Detect and prevent fraud, abuse, or security incidents</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">3. Data Sharing and Disclosure</h2>
          <p>We do not sell your personal information. We may share data with:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Third-party service providers</strong> who help us operate the platform (e.g., cloud hosting, data processing)</li>
            <li><strong>Your authorized integrations</strong> (e.g., QuickBooks, ServiceTitan) at your direction</li>
            <li><strong>Legal authorities</strong> when required by law or to protect our rights</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">4. Data Security</h2>
          <p>
            We implement industry-standard security measures, including encryption at rest and in transit, access controls, and
            regular security audits. However, no method of transmission or storage is 100% secure.
          </p>

          <h2 className="text-xl font-semibold mt-8">5. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active or as needed to provide the service. Upon account deletion,
            we delete or anonymize your data within 90 days, except where legal obligations require longer retention.
          </p>

          <h2 className="text-xl font-semibold mt-8">6. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access, correct, or delete your personal data</li>
            <li>Restrict or object to processing</li>
            <li>Data portability</li>
            <li>Withdraw consent at any time</li>
            <li>Lodge a complaint with a data protection authority</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">7. Third-Party Services</h2>
          <p>
            Our platform integrates with third-party services (e.g., QuickBooks, ServiceTitan). When you connect these services,
            their privacy policies govern the data they collect. We encourage you to review their policies.
          </p>

          <h2 className="text-xl font-semibold mt-8">8. Cookies</h2>
          <p>
            We use essential cookies for authentication and security. We may also use analytics cookies to improve our platform.
            You can control cookie preferences through your browser settings.
          </p>

          <h2 className="text-xl font-semibold mt-8">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be notified via email or a notice on our
            website. Your continued use after changes constitutes acceptance.
          </p>

          <h2 className="text-xl font-semibold mt-8">10. Contact</h2>
          <p>
            For questions or concerns about this Privacy Policy, please contact us at <strong>privacy@ledgerahq.com</strong> or
            write to:
          </p>
          <p>
            Ledgera Global Inc.<br />
            Attn: Privacy<br />
            <span className="text-gray-400">[Address]</span>
          </p>
        </div>
      </div>
    </div>
  );
}
