import Link from "next/link";

export default function EulaPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-brand-500 hover:underline mb-8 block">
          &larr; Back to home
        </Link>
        <h1 className="text-3xl font-bold mb-8">End-User License Agreement</h1>
        <p className="text-sm text-gray-500 mb-6">Last updated: June 26, 2026</p>

        <div className="prose prose-sm max-w-none space-y-6">
          <p>
            This End-User License Agreement (&ldquo;EULA&rdquo;) is a legal agreement between you (&ldquo;Licensee&rdquo; or &ldquo;you&rdquo;) and
            <strong> Ledgera Global Inc.</strong> (&ldquo;Ledgera,&rdquo; &ldquo;we,&rdquo; or &ldquo;us&rdquo;) governing your use of the Ledgera
            financial intelligence platform, including all associated web applications, APIs, and services (collectively, the
            &ldquo;Software&rdquo;).
          </p>

          <h2 className="text-xl font-semibold mt-8">1. License Grant</h2>
          <p>
            Subject to the terms of this EULA, Ledgera grants you a non-exclusive, non-transferable, revocable license to access
            and use the Software for your internal business purposes in accordance with your subscription plan.
          </p>

          <h2 className="text-xl font-semibold mt-8">2. Restrictions</h2>
          <p>You shall not:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Copy, modify, or create derivative works of the Software</li>
            <li>Reverse engineer, decompile, or disassemble the Software</li>
            <li>Rent, lease, lend, sell, or sublicense the Software to any third party</li>
            <li>Use the Software in violation of any applicable laws or regulations</li>
            <li>Remove or alter any proprietary notices on the Software</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">3. Intellectual Property</h2>
          <p>
            All rights, title, and interest in and to the Software, including all intellectual property rights, remain the sole
            property of Ledgera. This EULA does not transfer any ownership rights to you.
          </p>

          <h2 className="text-xl font-semibold mt-8">4. Data Handling</h2>
          <p>
            The Software processes financial and operational data from third-party services you authorize us to access. Your use
            of the Software constitutes authorization for Ledgera to retrieve, store, and process such data in accordance with our
            Privacy Policy.
          </p>

          <h2 className="text-xl font-semibold mt-8">5. Disclaimer of Warranties</h2>
          <p>
            The Software is provided &ldquo;as is&rdquo; without warranty of any kind, either express or implied, including but not
            limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
          </p>

          <h2 className="text-xl font-semibold mt-8">6. Limitation of Liability</h2>
          <p>
            In no event shall Ledgera be liable for any indirect, incidental, special, consequential, or punitive damages arising
            out of or relating to this EULA or your use of the Software, whether based on contract, tort, or any other legal theory.
          </p>

          <h2 className="text-xl font-semibold mt-8">7. Termination</h2>
          <p>
            Ledgera may terminate this EULA and your access to the Software at any time if you breach any provision. Upon
            termination, you must cease all use of the Software and destroy any copies in your possession.
          </p>

          <h2 className="text-xl font-semibold mt-8">8. Governing Law</h2>
          <p>
            This EULA shall be governed by the laws of the State of Delaware, without regard to its conflict of laws provisions.
          </p>

          <h2 className="text-xl font-semibold mt-8">9. Contact</h2>
          <p>
            For questions about this EULA, please contact us at <strong>legal@ledgerahq.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
