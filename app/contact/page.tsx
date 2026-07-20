'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { PosterFill, PosterOutline, StickerBadge } from '@/components/Poster';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      // First-party: stored via auth-service's ContactMessage table, viewed
      // in the admin portal. Replaces the previous Formspree integration,
      // whose form id had gone stale (every submission 404'd silently).
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        setSubmitError("Couldn't send that — please email us directly at hello@phoolgobhi.com instead.");
        return;
      }
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError("Couldn't send that — please email us directly at hello@phoolgobhi.com instead.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen section-padding dot-grid bg-cream-50 dark:bg-gray-950 overflow-hidden">
      <StickerBadge color="terracotta" size={50} rotate={-10} delay={0.3} motion="pulse" className="absolute top-24 left-[6%] hidden lg:flex">💬</StickerBadge>
      <StickerBadge color="emerald" size={44} rotate={14} delay={0.9} motion="wiggle" className="absolute bottom-16 right-[5%] hidden md:flex">📩</StickerBadge>
      <div className="container-custom max-w-4xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <h1 className="font-display text-6xl md:text-7xl mb-4">
            <PosterOutline>Get in</PosterOutline> <PosterFill color="terracotta">Touch</PosterFill>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Questions, feedback, or you just want to argue with Gobhi about broccoli. We&apos;re listening.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} onSubmit={handleSubmit} className="space-y-6">
            {submitted && <div className="p-4 bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 rounded-lg">Thanks for reaching out! Gobhi&apos;s typing back — he&apos;s got florets for hands, give him a minute.</div>}
            {submitError && <div className="p-4 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 rounded-lg">{submitError}</div>}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Message</label>
              <textarea name="message" value={formData.message} onChange={handleChange} required rows={6} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500" />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
              {submitting ? 'Sending…' : 'Send Message'}
            </button>
          </motion.form>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Fastest Ways To Bother Gobhi</h3>
              <div className="space-y-3">
                <a href="https://wa.me/919354859197" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="font-semibold">WhatsApp</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">+91 9354859197</p>
                  </div>
                </a>
                <a href="mailto:hello@phoolgobhi.com" className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                  <span className="text-2xl">📧</span>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">hello@phoolgobhi.com</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Gurugram, India</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-8 rounded-xl">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Response Time (Ish)</h3>
              <p className="text-gray-700 dark:text-gray-300">We reply within 24 hours. If it&apos;s urgent — like, your-gym-is-on-fire urgent — message us on WhatsApp instead.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
