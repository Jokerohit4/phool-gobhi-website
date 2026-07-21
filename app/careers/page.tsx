'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { PosterFill, PosterOutline, StickerBadge } from '@/components/Poster';
import type { JobOpening } from '@/lib/types';

const EMPLOYMENT_TYPE_LABELS: Record<JobOpening['employmentType'], string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  internship: 'Internship',
  contract: 'Contract',
};

function JobApplyForm({ job }: { job: JobOpening }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not submit your application');
      setSubmitted(true);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (submitted) {
    return (
      <p className="text-emerald-600 dark:text-emerald-400">
        Thanks, {name} — we&apos;ve got your application for {job.title} and will reach out if it&apos;s a fit.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
      <input
        required
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-lg border border-cream-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <input
        required
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-lg border border-cream-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <textarea
        required
        rows={4}
        placeholder="Tell us about yourself — resume link, portfolio, why this role"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="rounded-lg border border-cream-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={status === 'submitting'} className="btn-primary w-fit disabled:opacity-50">
        {status === 'submitting' ? 'Submitting…' : 'Submit application'}
      </button>
    </form>
  );
}

function JobCard({ job }: { job: JobOpening }) {
  const [applying, setApplying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="card-premium p-6 flex flex-col gap-3"
    >
      <div>
        <h3 className="font-display text-2xl">{job.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {job.department} · {job.location} · {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
        </p>
      </div>
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{job.description}</p>
      {applying ? (
        <JobApplyForm job={job} />
      ) : (
        <button onClick={() => setApplying(true)} className="btn-primary inline-block w-fit">
          Apply for this role
        </button>
      )}
    </motion.div>
  );
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<JobOpening[] | null>(null);

  useEffect(() => {
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((body) => setJobs(body?.data ?? []))
      .catch(() => setJobs([]));
  }, []);

  const hasOpenRoles = !!jobs && jobs.length > 0;

  return (
    <section className="relative min-h-screen section-padding dot-grid bg-cream-50 dark:bg-gray-950 overflow-hidden">
      <StickerBadge color="mustard" size={54} rotate={-10} delay={0} motion="wiggle" className="absolute top-24 left-[7%] hidden md:flex">🚀</StickerBadge>
      <StickerBadge color="emerald" size={46} rotate={12} delay={0.5} motion="pulse" className="absolute bottom-20 right-[6%] hidden lg:flex">💼</StickerBadge>

      <div className="container-custom max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-6xl md:text-7xl mb-4">
            <PosterOutline>Build</PosterOutline> <PosterFill color="mustard">With Gobhi</PosterFill>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We&apos;re small, scrappy, and pre-launch — which means whoever joins next shapes a lot more than a job description.
          </p>
        </motion.div>

        {hasOpenRoles && (
          <div className="space-y-6 mb-12">
            {jobs!.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        )}

        {!hasOpenRoles && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed mb-12"
          >
            <p>
              We don&apos;t have a fixed list of open roles right now — we&apos;re a tiny team building the product,
              gym network, and everything in between. If you&apos;re excited about pay-per-session fitness in India and
              think you can help us move faster (engineering, growth, operations, whatever you&apos;re good at), we want
              to hear from you.
            </p>
            <p>
              Tell us what you&apos;d want to work on and why — a resume helps, but a good pitch for yourself matters
              more at this stage.
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="sticker !rounded-3xl bg-cream-100 dark:bg-gray-900 p-10 text-center"
        >
          <h2 className="font-display text-3xl md:text-4xl mb-3">
            {hasOpenRoles ? "Don't see the right role?" : 'No open roles listed? Doesn’t matter.'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            Send us what you&apos;ve got — a resume, a portfolio, a one-line pitch, whatever gets the point across.
          </p>
          <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="inline-block">
            <a href="mailto:career@phoolgobhi.com" className="btn-primary inline-block">
              career@phoolgobhi.com
            </a>
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
