import React, { useState } from 'react';

export type PolicyType = 'privacy' | 'customs' | 'terms' | 'legal' | 'refund' | 'contact' | null;

interface PolicyModalProps {
  type: PolicyType;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ type, onClose }) => {
  const [contactSent, setContactSent] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  if (!type) return null;

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
  };

  const getPolicyContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Choices & Data Policy',
          content: (
            <div className="space-y-4 text-xs text-neutral-600 leading-relaxed">
              <p>
                At <strong>Kavere Car</strong>, we respect your privacy and are committed to protecting personal data
                under the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018.
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">1. Data We Collect</h4>
              <p>
                We only collect information necessary to process your custom mat order: your name, shipping address,
                email, telephone number, and vehicle specification (make, model, year).
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">2. Payment Security</h4>
              <p>
                All payment transactions are encrypted using 256-bit SSL protocols. We do not store raw payment card
                numbers on our servers.
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">3. Your Rights</h4>
              <p>
                You may request access to, correction of, or deletion of your personal data at any time by contacting{' '}
                <a href="mailto:support@kavere-uk.com" className="text-black underline font-semibold">
                  support@kavere-uk.com
                </a>
                .
              </p>
            </div>
          ),
        };
      case 'customs':
        return {
          title: 'Customs & Import Policy',
          content: (
            <div className="space-y-4 text-xs text-neutral-600 leading-relaxed">
              <p>
                <strong>UK Domestic Fulfillment:</strong> All domestic orders placed on Kavere Car within the United
                Kingdom are dispatched directly from our regional UK warehouse facilities.
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">No Hidden Duties or VAT Fees</h4>
              <p>
                All prices displayed on kavere-uk include UK VAT where applicable. There are no additional customs fees,
                clearance tariffs, or unexpected courier surcharges on UK deliveries.
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">Dispatch Times</h4>
              <p>
                Orders placed before 2:00 PM GMT Monday to Friday are prepared and dispatched within 24–48 hours with
                tracked courier service (Royal Mail / DPD).
              </p>
            </div>
          ),
        };
      case 'terms':
        return {
          title: 'Terms of Service',
          content: (
            <div className="space-y-4 text-xs text-neutral-600 leading-relaxed">
              <p>
                By placing an order on Kavere Car, you agree to these Terms of Service. Please review your selected vehicle
                parameters carefully before checkout.
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">Custom Vehicle Fitment</h4>
              <p>
                Each mat set is manufactured using 3D laser-scanned specifications for the specific make, model, and year
                selected. If you chose "Other make" or "Other model", our support team will contact you to verify exact
                measurements prior to production.
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">Warranty</h4>
              <p>
                Kavere mats come with a comprehensive 2-year warranty against cracking, curling, and material defects under
                normal consumer use.
              </p>
            </div>
          ),
        };
      case 'legal':
        return {
          title: 'Legal Notice & Company Information',
          content: (
            <div className="space-y-4 text-xs text-neutral-600 leading-relaxed">
              <p>
                <strong>Kavere Car UK Ltd.</strong>
                <br />
                Registered in England and Wales.
                <br />
                Registered Office: 24 Holborn Viaduct, London, EC1A 2BN, United Kingdom.
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">Intellectual Property</h4>
              <p>
                Kavere Car is a registered trademark. Vehicle brand names and models (e.g. BYD, Audi, BMW, Tesla) are
                referenced solely to identify the intended compatibility and laser fitment of the floor protection products.
              </p>
              <p>For corporate and legal enquiries: legal@kavere-uk.com</p>
            </div>
          ),
        };
      case 'refund':
        return {
          title: 'Return & Refund Policy',
          content: (
            <div className="space-y-4 text-xs text-neutral-600 leading-relaxed">
              <p>
                We stand behind our mats with a <strong>30-Day Money-Back Guarantee</strong>.
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">Fitment Guarantee</h4>
              <p>
                If your mat set does not fit your chosen vehicle model precisely, contact us with photos of your floor
                anchors within 30 days and we will either send an updated tailored replacement free of charge or issue a full refund.
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">Easy Returns Process</h4>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Email support@kavere-uk.com with your Order Number (#KAV-XXXXX).</li>
                <li>Receive a pre-paid UK returns shipping label.</li>
                <li>Drop off the package at any local Post Office branch.</li>
                <li>Refund is issued to your original payment method within 3–5 working days of receipt.</li>
              </ol>
            </div>
          ),
        };
      case 'contact':
        return {
          title: 'Contact Kavere Car Customer Care',
          content: contactSent ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-neutral-900">Message Received!</h4>
              <p className="text-xs text-neutral-500">
                Thank you, {contactName}. A customer specialist will reply to <strong>{contactEmail}</strong> within 12–24 hours.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 bg-black text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-neutral-600">
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                <p className="font-semibold text-neutral-900">Direct Support Team:</p>
                <p>
                  E-mail:{' '}
                  <a href="mailto:support@kavere-uk.com" className="text-black font-bold underline">
                    support@kavere-uk.com
                  </a>
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">Available Mon–Sat: 8:00 AM – 7:00 PM GMT</p>
              </div>

              <form onSubmit={handleSendContact} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Alex Smith"
                    className="w-full rounded-lg border-neutral-200 py-2 px-2.5 text-xs bg-neutral-50/50 focus:border-black focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="alex@example.co.uk"
                    className="w-full rounded-lg border-neutral-200 py-2 px-2.5 text-xs bg-neutral-50/50 focus:border-black focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Vehicle Details or Question</label>
                  <textarea
                    rows={3}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="I have a 2024 BYD Dolphin Mini and would like to confirm..."
                    className="w-full rounded-lg border-neutral-200 py-2 px-2.5 text-xs bg-neutral-50/50 focus:border-black focus:ring-black"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider transition"
                >
                  Send Enquiry
                </button>
              </form>
            </div>
          ),
        };
      default:
        return { title: '', content: null };
    }
  };

  const { title, content } = getPolicyContent();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="min-h-full flex items-center justify-center p-4 text-center sm:p-0">
        <div className="relative bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-neutral-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-black p-1 rounded-md transition"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 max-h-[75vh] overflow-y-auto">{content}</div>

          <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100 text-right">
            <button
              onClick={onClose}
              className="text-xs font-bold text-neutral-900 hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
