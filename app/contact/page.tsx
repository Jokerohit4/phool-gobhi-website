'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('https://formspree.io/f/mwpeyqzv', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <section className="min-h-screen section-padding bg-white">
      <div className="container-custom max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600">Have questions? We'd love to hear from you.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} onSubmit={handleSubmit} className="space-y-6">
            {submitted && <div className="p-4 bg-green-100 text-green-800 rounded-lg">Thanks for reaching out! We'll get back to you soon.</div>}
            <div>
              <label className="block text-sm font-semibold mb-2">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-emerald-600" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-emerald-600" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Message</label>
              <textarea name="message" value={formData.message} onChange={handleChange} required rows={6} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-emerald-600" />
            </div>
            <button type="submit" className="btn-primary w-full">
              Send Message
            </button>
          </motion.form>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <div className="space-y-3">
                <a href="https://wa.me/919354859197" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-emerald-600">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="font-semibold">WhatsApp</p>
                    <p className="text-sm text-gray-600">+91 9354859197</p>
                  </div>
                </a>
                <a href="mailto:hello@phoolGobhi.in" className="flex items-center gap-3 text-gray-700 hover:text-emerald-600">
                  <span className="text-2xl">📧</span>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-sm text-gray-600">hello@phoolGobhi.in</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 text-gray-700">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-sm text-gray-600">Gurugram, India</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-xl">
              <h3 className="text-xl font-bold mb-4">Response Time</h3>
              <p className="text-gray-700">We typically respond to all inquiries within 24 hours. For urgent matters, reach out on WhatsApp.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
