import Link from 'next/link';

const BUILDING = [
  {
    title: 'A plan for today',
    body: 'A daily plan shaped around your routine and the history you choose to track.',
  },
  {
    title: 'A health picture over time',
    body: 'A clearer view of how your measurements are changing, with context around the trend rather than one reading on its own.',
  },
  {
    title: 'Useful early signals',
    body: 'When something drifts from your usual pattern, a practical next step to consider that week.',
  },
  {
    title: 'Regular check-ins',
    body: 'Planned lab tests and doctor reviews, so you can check in on your health even when you feel well.',
  },
  {
    title: 'Movement that fits your life',
    body: 'Gym and trainer access through partner gyms, brought together under one membership.',
  },
];

const SAFETY_NOTES = [
  'Phool Gobhi does not diagnose conditions or estimate your odds of getting a disease.',
  'It is a health companion for everyday choices and a way to organize information for a conversation with your doctor. It is not a doctor and does not replace one.',
  'If you have an emergency, call your local emergency number. Do not wait for an app signal.',
];

export default function AboutPage() {
  const androidUrl = process.env.NEXT_PUBLIC_PLAY_STORE_URL ||
    'https://play.google.com/store/apps/details?id=in.phoolgobi.customer';
  const iosUrl = process.env.NEXT_PUBLIC_APP_STORE_URL ||
    'https://apps.apple.com/app/id6804278072';

  return (
    <div className="bg-cream-50 dark:bg-gray-950">
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            A health companion for everyday life
          </p>
          <h1 className="mb-6 max-w-3xl text-4xl font-semibold leading-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            Know how healthy you really are.
          </h1>
          <div className="max-w-3xl space-y-5 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            <p>
              You can work out, eat reasonably well, and still not know whether your health is changing. A lower
              weight, a bigger lift, or a new diet can feel like progress, but each shows only one part of the
              picture. Blood pressure, blood sugar, and sleep tell you other things; one reading still needs
              context. Some health concerns may not be obvious until later.
            </p>
            <p>
              We&apos;re Phool Gobhi. We&apos;re building one place to track health over time, see the picture
              more clearly, and find a useful next step.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-cream-100 dark:bg-gray-900">
        <div className="container-custom max-w-5xl">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
              Our direction
            </p>
            <h2 className="mb-4 text-3xl font-semibold text-gray-900 dark:text-white sm:text-4xl">
              What we&apos;re building
            </h2>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              These are the pieces we want to bring together in one membership:
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {BUILDING.map((item, index) => (
              <li key={item.title} className="card-premium p-6 sm:p-7">
                <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-300">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom grid max-w-5xl gap-12 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
              Clear boundaries
            </p>
            <h2 className="mb-5 text-3xl font-semibold text-gray-900 dark:text-white">What we are not</h2>
            <ul className="space-y-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">
              {SAFETY_NOTES.map((note) => <li key={note}>{note}</li>)}
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Phool Gobhi does not provide medical advice, diagnosis, or treatment. Talk to a doctor about any
              health concern.
            </p>
          </div>

          <div className="rounded-3xl border border-cream-200 bg-cream-100 p-7 dark:border-gray-800 dark:bg-gray-900 sm:p-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
              Your information
            </p>
            <h2 className="mb-4 text-3xl font-semibold text-gray-900 dark:text-white">How we handle your data</h2>
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              We&apos;ll ask for clear consent before collecting health information and work to protect it. You can
              withdraw consent or request deletion. Our{' '}
              <Link href="/policies/privacy" className="font-semibold text-emerald-700 underline underline-offset-4 dark:text-emerald-300">
                Privacy Policy
              </Link>{' '}
              explains your rights and the data practices of the current service. Health-specific details are still
              being finalized and will be shared before those features launch. Some records may need to be retained
              where the law requires it.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-cream-100 dark:bg-gray-900">
        <div className="container-custom grid max-w-5xl gap-10 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
              Why we started here
            </p>
            <h2 className="mb-4 text-3xl font-semibold text-gray-900 dark:text-white">Make it easier to keep going</h2>
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              We started with people who are new to exercise. A few weeks into a new routine, it can be hard to know
              what progress looks like or what to focus on next. We want to help people stay on track and understand
              what their numbers may be telling them, while there&apos;s still time to make informed choices.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
              Who we&apos;re for
            </p>
            <h2 className="mb-4 text-3xl font-semibold text-gray-900 dark:text-white">For adults who want the full picture</h2>
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              Adults who train, want to know whether it&apos;s working, and want a clearer view of their health.
              We&apos;re starting in Bengaluru and Delhi NCR.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="card-premium flex flex-col gap-5 p-7 sm:flex-row sm:items-center sm:p-9">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" aria-hidden="true">
              RS
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">
                A note from our founder
              </p>
              <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">Rohitashwa Singh</h2>
              <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                We began by making gym access more flexible. I&apos;m building Phool Gobhi toward a more connected
                way to understand everyday health, with useful context and a practical next step.
              </p>
              <Link href="/team" className="mt-3 inline-flex font-semibold text-emerald-700 underline underline-offset-4 dark:text-emerald-300">
                Meet the founder
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-cream-100 dark:bg-gray-900">
        <div className="container-custom max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            Get started
          </p>
          <h2 className="mb-4 text-3xl font-semibold text-gray-900 dark:text-white sm:text-4xl">Get the Phool Gobhi app</h2>
          <p className="mx-auto mb-7 max-w-2xl leading-relaxed text-gray-700 dark:text-gray-300">
            We&apos;re opening access in stages. Download the app to explore Phool Gobhi and see what&apos;s available
            in your area.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <a href={androidUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex justify-center">
              Get it on Google Play
            </a>
            <a href={iosUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex justify-center">
              Download on the App Store
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
