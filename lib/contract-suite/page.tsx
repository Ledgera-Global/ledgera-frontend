"use client";
import { useState } from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const DOC_LABELS: Record<string, string> = {
  msa: "Master Service Agreement",
  nda: "Non-Disclosure Agreement",
  loi: "Letter of Intent",
  iou: "Institutional Understanding",
};

const ROLES: Record<string, string> = {
  msa: "Client",
  nda: "Recipient",
  loi: "Prospective Client",
  iou: "Institution",
};

export default function ContractSuitePage() {
  const [activeDoc, setActiveDoc] = useState("msa");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("Delaware");
  const [locations, setLocations] = useState(1);
  const [sending, setSending] = useState(false);
  const [signingUrl, setSigningUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContact, setModalContact] = useState("");
  const [today] = useState(() =>
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  );

  const totalSetup = 2500 * locations;
  const totalMonthly = 1250 * locations;

  const docLabel = DOC_LABELS[activeDoc];
  const role = ROLES[activeDoc];

  function openModal() {
    if (!company) { setError("Please enter the client company name."); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid client email address."); return; }
    setModalContact("");
    setStatus(null);
    setError(null);
    setModalOpen(true);
  }

  async function handleSend() {
    if (!company || !email || !modalContact) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/contracts/firma/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: company,
          clientContact: modalContact,
          clientEmail: email,
          state,
          locationCount: locations,
          monthlyFee: totalMonthly,
          setupFee: totalSetup,
          documentType: activeDoc,
          documentLabel: docLabel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setStatus(`Document sent to ${email} via Firma.dev.`);
      if (data.signingUrl) setSigningUrl(data.signingUrl);
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#0a0a0a] font-sans">
      {/* Top bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between bg-[#0a0a0a] px-12 py-4 border-b-2 border-[#c9a800]">
        <span className="font-serif text-lg text-white tracking-wider">
          Ledgera <em className="text-[#c9a800] not-italic">Global</em>
        </span>
        <span className="bg-[#4f46e5] text-white text-[9.5px] font-bold px-3.5 py-1.5 tracking-widest uppercase rounded">
          ● Firma.dev E-Signature
        </span>
      </div>

      {/* Setup panel */}
      <div className="bg-[#111] text-white px-12 py-8 border-b-4 border-[#c9a800]">
        <h2 className="font-serif text-xs tracking-[0.3em] uppercase text-[#c9a800] mb-4">Configure Agreement</h2>
        <div className="grid grid-cols-[1.4fr_1.2fr_0.8fr_0.6fr_auto] gap-3.5 items-end">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="contract-company" className="text-[9.5px] font-semibold tracking-widest uppercase text-gray-500">Client Company</label>
            <input id="contract-company" className="bg-white/5 border border-white/10 text-white text-sm px-3.5 py-2.5 outline-none focus:border-[#c9a800] transition-colors" placeholder="Company name" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="contract-email" className="text-[9.5px] font-semibold tracking-widest uppercase text-gray-500">Client Email</label>
            <input id="contract-email" className="bg-white/5 border border-white/10 text-white text-sm px-3.5 py-2.5 outline-none focus:border-[#c9a800] transition-colors" placeholder="client@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="contract-state" className="text-[9.5px] font-semibold tracking-widest uppercase text-gray-500">State</label>
            <select id="contract-state" className="bg-white/5 border border-white/10 text-white text-sm px-3.5 py-2.5 outline-none focus:border-[#c9a800]" value={state} onChange={e => setState(e.target.value)}>
              {["Delaware","Texas","California","Florida","New York","Illinois","Georgia","Ohio","Pennsylvania","North Carolina","Arizona","Washington"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="contract-locations" className="text-[9.5px] font-semibold tracking-widest uppercase text-gray-500">Locations</label>
            <input id="contract-locations" type="number" min={1} max={50} className="bg-white/5 border border-white/10 text-white text-sm px-3.5 py-2.5 outline-none focus:border-[#c9a800]" value={locations} onChange={e => setLocations(Math.max(1, parseInt(e.target.value) || 1))} />
          </div>
        </div>
      </div>

      {/* Doc tabs */}
      <div className="bg-[#0a0a0a] flex border-b-4 border-[#c9a800] overflow-x-auto">
        {Object.entries(DOC_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => { setActiveDoc(key); setSigningUrl(null); setStatus(null); setError(null); }}
            className={`px-7 py-3.5 text-xs font-semibold tracking-widest uppercase whitespace-nowrap border-b-4 transition-colors ${
              activeDoc === key ? "text-[#c9a800] border-[#c9a800]" : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            <span className="block">{key.toUpperCase()}</span>
            <span className="block text-[9px] font-normal tracking-normal mt-0.5">{label}</span>
          </button>
        ))}
      </div>

      {/* Contract content */}
      <div className="max-w-[920px] mx-auto my-9 bg-white shadow-lg border-t-4 border-[#c9a800]">
        <div className="bg-[#0a0a0a] text-white text-center px-16 py-10">
          <p className="font-mono text-[9.5px] tracking-widest uppercase text-[#c9a800] mb-2">Document</p>
          <h1 className="font-serif text-2xl tracking-widest uppercase mb-2">{docLabel}</h1>
          <p className="text-xs text-gray-500 tracking-widest uppercase">{role}</p>
          <p className="mt-3 text-sm text-[#c9a800]">Effective Date: {today}</p>
        </div>

        <div className="px-16 py-12 text-sm leading-relaxed text-gray-800">
          {activeDoc === "msa" && <MSAContent company={company} state={state} locations={locations} totalMonthly={totalMonthly} totalSetup={totalSetup} today={today} />}
          {activeDoc === "nda" && <NDAContent company={company} state={state} today={today} />}
          {activeDoc === "loi" && <LOIContent company={company} state={state} today={today} />}
          {activeDoc === "iou" && <IOUContent company={company} today={today} />}
        </div>

        <div className="px-16 py-8 text-center border-t-2 border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            A PDF will be generated and sent to the client via <strong>Firma.dev</strong> for legally binding e-signature.
          </p>
          <button
            onClick={() => openModal()}
            disabled={!company || !email}
            className="w-full py-4 text-sm font-semibold tracking-widest uppercase text-white bg-[#0a0a0a] border-2 border-[#0a0a0a] cursor-pointer relative overflow-hidden transition-colors hover:bg-[#4f46e5] hover:border-[#4f46e5] disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed"
          >
            ✍ Send {activeDoc.toUpperCase()} via Firma.dev
          </button>
          {status && <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-800 text-sm text-center">{status}</div>}
          {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm text-center">{error}</div>}
          {signingUrl && (
            <div className="mt-4 text-center">
              <a href={signingUrl} target="_blank" className="inline-block bg-[#4f46e5] text-white text-sm font-semibold px-7 py-3 rounded no-underline hover:bg-[#6366f1]">
                🔗 Open Signing Link in Firma.dev
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="bg-white max-w-lg w-[92%] p-10 shadow-2xl border-t-4 border-[#4f46e5] animate-slide-up">
            <h2 className="font-serif text-lg mb-1">Send via Firma.dev</h2>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              A PDF will be generated and sent to the client. {"They'll receive a signing link by email and can sign from any device."}
            </p>
            <div className="flex items-center gap-2.5 bg-indigo-50 border border-indigo-200 p-2.5 mb-5 text-xs text-indigo-700 font-semibold rounded">
              <div className="w-2 h-2 rounded-full bg-indigo-700 shrink-0"></div>
              Sending via Firma.dev API · ESIGN & UETA Compliant
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label htmlFor="modal-company" className="text-[9.5px] font-semibold tracking-widest uppercase text-gray-500">Client Company</label>
              <input id="modal-company" className="border border-gray-300 p-2.5 text-sm outline-none focus:border-[#4f46e5]" value={company} readOnly />
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label htmlFor="modal-contact" className="text-[9.5px] font-semibold tracking-widest uppercase text-gray-500">Client Full Name</label>
              <input id="modal-contact" className="border border-gray-300 p-2.5 text-sm outline-none focus:border-[#4f46e5]" placeholder="First Last (for signature line)" value={modalContact} onChange={e => setModalContact(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label htmlFor="modal-email" className="text-[9.5px] font-semibold tracking-widest uppercase text-gray-500">Client Email</label>
              <input id="modal-email" className="border border-gray-300 p-2.5 text-sm outline-none focus:border-[#4f46e5]" value={email} readOnly />
            </div>
            <div className="flex gap-2.5 mt-2">
              <button onClick={handleSend} disabled={sending || !modalContact}
                className="flex-1 bg-[#4f46e5] text-white text-sm font-semibold tracking-widest uppercase py-3 border-none cursor-pointer transition-colors hover:bg-[#6366f1] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "Send via Firma.dev"}
              </button>
              <button onClick={() => setModalOpen(false)}
                className="px-4 bg-none border border-gray-300 text-sm text-gray-500 cursor-pointer hover:border-black hover:text-black transition-colors"
              >
                Cancel
              </button>
            </div>
            {error && <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Document components ─────────────────────────────────────────────────────

function SigLine({ label }: { label: string }) {
  return <div className="border-t border-gray-400 pt-1.5 text-[9px] text-gray-500 mb-4">{label}</div>;
}

function SigSection({ company, role, today, partyLabel }: { company: string; role: string; today: string; partyLabel: string }) {
  return (
    <div className="mt-10 pt-8 border-t-2 border-gray-200 grid grid-cols-2 gap-12">
      <div>
        <h3 className="font-serif text-sm mb-1">Ledgera Global, Inc.</h3>
        <p className="text-[9px] text-gray-500 mb-6">Service Provider · Delaware C-Corp</p>
        <SigLine label="Authorized Signature" />
        <SigLine label="Printed Name" />
        <SigLine label="Title" />
        <SigLine label={`Date: ${today}`} />
      </div>
      <div>
        <h3 className="font-serif text-sm mb-1">{company || role}</h3>
        <p className="text-[9px] text-gray-500 mb-6">{partyLabel}</p>
        <SigLine label="Client Signature" />
        <SigLine label="Printed Name" />
        <SigLine label="Title" />
        <SigLine label="Date" />
      </div>
    </div>
  );
}

function MSAContent({ company, state, locations, totalMonthly, totalSetup, today }: { company: string; state: string; locations: number; totalMonthly: number; totalSetup: number; today: string }) {
  return (
    <>
      <p className="mb-8 leading-relaxed">
        This Master Service Agreement (&ldquo;<strong>Agreement</strong>&rdquo;) is entered into as of <strong>{today}</strong> by and between <strong>Ledgera Global, Inc.</strong>, a Delaware C-Corporation (&ldquo;<strong>Service Provider</strong>&rdquo;), and <strong>{company || "Client"}</strong>, a <strong>{state}</strong> corporation (&ldquo;<strong>Client</strong>&rdquo;).
      </p>
      <Section title="1. Scope of Services" body="Service Provider shall provide accounting, reporting, financial management, and margin/recovery intelligence services to Client across all Locations in Exhibit A. Additional Locations incur a Setup Fee of $2,500 and Monthly Fee of $1,250 per Location." />
      <Section title="2. Term" body="Initial Term: 12 months from Effective Date. Automatically renews month-to-month unless either party provides 30 days' written notice of non-renewal." />
      <Section title="3. Fees & Payment (Net 15)">
        <table className="w-full border-collapse text-sm my-3">
          <thead><tr className="bg-[#0a0a0a] text-white"><th className="p-2.5 text-left text-[9.5px] font-semibold">Fee Type</th><th className="p-2.5 text-left text-[9.5px] font-semibold">Per Location</th><th className="p-2.5 text-left text-[9.5px] font-semibold">{locations} Location{locations > 1 ? "s" : ""} Total</th></tr></thead>
          <tbody>
            <tr className="border-b border-gray-200"><td className="p-2.5 text-gray-700">Setup Fee (due at execution)</td><td className="p-2.5 text-gray-700">$2,500</td><td className="p-2.5 text-gray-700">${totalSetup.toLocaleString()}</td></tr>
            <tr className="border-b border-gray-200 even:bg-gray-50"><td className="p-2.5 text-gray-700">Monthly Fee (invoiced in advance)</td><td className="p-2.5 text-gray-700">$1,250</td><td className="p-2.5 text-gray-700">${totalMonthly.toLocaleString()}/mo</td></tr>
          </tbody>
        </table>
      </Section>
      <Section title="4. Early Termination" body="Early termination without cause: greater of 50% of remaining Monthly Fees or $5,000 minimum." />
      <Section title="5. Confidentiality & Data Security" body="Both parties maintain strict confidentiality. Service Provider employs encrypted databases, role-based access controls, and full transaction logging." />
      <Section title="6. Limitation of Liability" body="Limited to direct damages not exceeding total fees paid in the 12 months preceding the claim. No liability for indirect, consequential, or punitive damages." />
      <Section title="7. Indemnification" body="Each party indemnifies the other from third-party claims arising from its own breach or negligence." />
      <Section title="8. Force Majeure" body="Neither party liable for delays caused by events beyond reasonable control. Affected party must provide prompt written notice." />
      <Section title={`9. Governing Law & Dispute Resolution`} body={`Governed by the laws of the State of ${state}. Good-faith mediation required before litigation.`} />
      <Section title="10. Amendments & Miscellaneous" body="Amendments must be in writing and signed by both parties. Client may not assign without prior written consent. Severability applies." />
      <Section title="Exhibit A - Locations">
        <table className="w-full border-collapse text-sm my-3">
          <thead><tr className="bg-[#0a0a0a] text-white"><th className="p-2.5 text-left text-[9.5px] font-semibold">Location</th><th className="p-2.5 text-left text-[9.5px] font-semibold">Setup Fee</th><th className="p-2.5 text-left text-[9.5px] font-semibold">Monthly Fee</th></tr></thead>
          <tbody>
            {Array.from({ length: locations }).map((_, i) => (
              <tr key={i} className="border-b border-gray-200 even:bg-gray-50"><td className="p-2.5 text-gray-700">Location {i + 1}</td><td className="p-2.5 text-gray-700">$2,500</td><td className="p-2.5 text-gray-700">$1,250</td></tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="Exhibit B - SLA">
        <table className="w-full border-collapse text-sm my-3">
          <thead><tr className="bg-[#0a0a0a] text-white"><th className="p-2.5 text-left text-[9.5px] font-semibold">Metric</th><th className="p-2.5 text-left text-[9.5px] font-semibold">Target</th></tr></thead>
          <tbody>
            {[["Response Time","<24 hours (critical)"],["Reporting","Monthly"],["Uptime","99%"],["Recovery Reporting","All recovered $ tracked monthly"],["Margin Leakage Alerts","Within 48 hours"],["EBITDA / KPI Tracking","Monthly, SEC-grade audit trail"],["Security","SOC 2 / ISO readiness; logs retained"]].map(([m, t]) => (
              <tr key={m} className="border-b border-gray-200 even:bg-gray-50"><td className="p-2.5 text-gray-700">{m}</td><td className="p-2.5 text-gray-700">{t}</td></tr>
            ))}
          </tbody>
        </table>
      </Section>
      <SigSection company={company} role="Client" today={today} partyLabel={`Client · ${state} Corporation`} />
    </>
  );
}

function NDAContent({ company, state, today }: { company: string; state: string; today: string }) {
  return (
    <>
      <p className="mb-8 leading-relaxed">
        This Mutual Non-Disclosure Agreement (&ldquo;<strong>NDA</strong>&rdquo;) is entered into as of <strong>{today}</strong> between <strong>Ledgera Global, Inc.</strong> (&ldquo;<strong>Ledgera</strong>&rdquo;) and <strong>{company || "Recipient"}</strong> (&ldquo;<strong>Recipient</strong>&rdquo;).
      </p>
      <HighlightBox body="The Parties wish to explore a potential business relationship. Each Party may disclose confidential and proprietary information to the other." />
      <Section title="1. Confidential Information" body="Includes business plans, financial data, proprietary software, client lists, trade secrets, and all non-public information shared between the Parties." />
      <Section title="2. Obligations" body="Each Party shall hold all Confidential Information in strict confidence and use it solely for evaluating a potential business relationship." />
      <Section title="3. Term" body="Three (3) years from Effective Date. Trade secret obligations survive indefinitely." />
      <Section title="4. Return or Destruction" body="Upon request, each Party shall return or certifiably destroy all Confidential Information within 10 business days." />
      <Section title="5. Remedies" body="Breach may cause irreparable harm. Either Party may seek injunctive relief without posting bond." />
      <Section title={`6. Governing Law`} body={`Governed by the laws of the State of ${state}.`} />
      <SigSection company={company} role="Recipient" today={today} partyLabel={`Recipient · ${state} Corporation`} />
    </>
  );
}

function LOIContent({ company, state, today }: { company: string; state: string; today: string }) {
  return (
    <>
      <p className="mb-8 leading-relaxed">
        This Letter of Intent (&ldquo;<strong>LOI</strong>&rdquo;) is submitted as of <strong>{today}</strong> by <strong>Ledgera Global, Inc.</strong> to <strong>{company || "Prospective Client"}</strong> (&ldquo;<strong>Prospective Client</strong>&rdquo;).
      </p>
      <div className="bg-yellow-50 border-l-4 border-[#c9a800] p-3.5 my-2.5 text-sm leading-relaxed text-gray-800"><strong>Note:</strong> This LOI is non-binding except Sections 4 (Confidentiality), 5 (Exclusivity), and 6 (Governing Law).</div>
      <Section title="1. Proposed Services" body="Real-time financial reporting, cash recovery tracking, EBITDA analysis, SEC-grade audit trail, multi-location financial consolidation." />
      <Section title="2. Proposed Commercial Terms">
        <table className="w-full border-collapse text-sm my-3">
          <thead><tr className="bg-[#0a0a0a] text-white"><th className="p-2.5 text-left text-[9.5px] font-semibold">Item</th><th className="p-2.5 text-left text-[9.5px] font-semibold">Proposed Term</th></tr></thead>
          <tbody>
            {[["Setup Fee","$2,500/location"],["Monthly Fee","$1,250/location"],["Initial Term","12 months"],["Payment Terms","Net 15"],["Performance Kicker (optional)","5% of verified recovered cash, quarterly"]].map(([item, term]) => (
              <tr key={item} className="border-b border-gray-200 even:bg-gray-50"><td className="p-2.5 text-gray-700">{item}</td><td className="p-2.5 text-gray-700">{term}</td></tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="3. Confidentiality (Binding)" body="All discussions and proposed terms shall be kept strictly confidential for two (2) years." />
      <Section title="4. Exclusivity (Binding)" body="For 30 days from this LOI, Prospective Client shall not negotiate with competing platforms without prior written consent from Ledgera." />
      <Section title={`5. Governing Law (Binding)`} body={`Binding provisions governed by the laws of the State of ${state}.`} />
      <Section title="6. No Obligation" body="Except as stated in Sections 4-6, this LOI creates no binding obligation. Either party may withdraw at any time." />
      <SigSection company={company} role="Prospective Client" today={today} partyLabel={`Prospective Client · ${state} Corporation`} />
    </>
  );
}

function IOUContent({ company, today }: { company: string; today: string }) {
  return (
    <>
      <p className="mb-8 leading-relaxed">
        This Institutional Understanding (&ldquo;<strong>IU</strong>&rdquo;) is established as of <strong>{today}</strong> between <strong>Ledgera Global, Inc.</strong> and <strong>{company || "Institution"}</strong> (&ldquo;<strong>Institution</strong>&rdquo;).
      </p>
      <NoticeBox body="This IU supplements the MSA and establishes the shared values, operational protocols, and governance framework governing day-to-day collaboration." />
      <Section title="1. Shared Values">
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>Transparency:</strong> All data and communications shall be accurate and timely.</li>
          <li><strong>Integrity:</strong> Neither Party shall misrepresent data or act in bad faith.</li>
          <li><strong>Accountability:</strong> Each Party accepts responsibility for its obligations.</li>
          <li><strong>Collaboration:</strong> Parties will work cooperatively to optimize outcomes.</li>
          <li><strong>Compliance:</strong> Both Parties operate in accordance with applicable laws.</li>
        </ul>
      </Section>
      <Section title="2. Data Governance">
        <ul className="list-disc ml-5 space-y-1">
          <li>All data processed per CCPA/GDPR where applicable</li>
          <li>Encrypted, access-controlled environments</li>
          <li>Financial records retained for 7 years minimum</li>
          <li>Data breach notification within 72 hours</li>
          <li>Client data never sold or monetized</li>
        </ul>
      </Section>
      <Section title="3. Reporting Standards">
        <table className="w-full border-collapse text-sm my-3">
          <thead><tr className="bg-[#0a0a0a] text-white"><th className="p-2.5 text-left text-[9.5px] font-semibold">Report</th><th className="p-2.5 text-left text-[9.5px] font-semibold">Frequency</th><th className="p-2.5 text-left text-[9.5px] font-semibold">Delivery</th></tr></thead>
          <tbody>
            {[["Cash Flow & Recovery","Monthly","Dashboard + Email"],["EBITDA & Margin","Monthly","Dashboard"],["KPI Summary","Monthly","Email"],["Audit Trail Export","On Request","Secure Download"],["Executive Summary","Quarterly","Meeting + Report"]].map(([r, f, d]) => (
              <tr key={r} className="border-b border-gray-200 even:bg-gray-50"><td className="p-2.5 text-gray-700">{r}</td><td className="p-2.5 text-gray-700">{f}</td><td className="p-2.5 text-gray-700">{d}</td></tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="4. Escalation Protocol">
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>Level 1:</strong> Direct contacts - 3 business days</li>
          <li><strong>Level 2:</strong> Financial/Operations leads - 7 business days</li>
          <li><strong>Level 3:</strong> Executive escalation - 14 business days</li>
          <li><strong>Level 4:</strong> Formal mediation per MSA</li>
        </ul>
      </Section>
      <Section title="5. Review & Amendment" body="Reviewed annually. Amendments effective upon written agreement. In conflict with MSA, the MSA governs." />
      <SigSection company={company} role="Institution" today={today} partyLabel={`Institution · Corporation`} />
    </>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Section({ title, body, children }: { title: string; body?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-[9pt] font-bold uppercase tracking-widest text-[#0a0a0a] border-b-2 border-[#c9a800] pb-1.5 mb-3">{title}</h2>
      {body && <p className="text-[10.5pt] leading-relaxed text-gray-700 mb-2">{body}</p>}
      {children}
    </div>
  );
}

function HighlightBox({ body }: { body: string }) {
  return <div className="bg-yellow-50 border-l-4 border-[#c9a800] p-3.5 my-2.5 text-sm leading-relaxed text-gray-800">{body}</div>;
}

function NoticeBox({ body }: { body: string }) {
  return <div className="bg-blue-50 border-l-4 border-blue-600 p-3.5 my-2.5 text-sm leading-relaxed text-gray-800">{body}</div>;
}
