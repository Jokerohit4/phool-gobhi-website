'use client';

import { useState, type FormEvent } from 'react';
import { useSession } from '@/components/auth/SessionProvider';
import { dateOfBirthError, maxDateOfBirth } from '@/lib/age';

const GENDER_OPTIONS: { value: string; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

// Order + labels must match backend auth-service constants/userEnums.js
// FITNESS_GOALS so submitted values always pass server-side validation.
const GOAL_OPTIONS: { value: string; label: string }[] = [
  { value: 'weight_loss', label: 'Weight loss' },
  { value: 'muscle_gain', label: 'Muscle gain' },
  { value: 'general_fitness', label: 'General fitness' },
  { value: 'flexibility_yoga', label: 'Flexibility & yoga' },
  { value: 'sports_training', label: 'Sports training' },
  { value: 'rehabilitation', label: 'Rehabilitation' },
];

// getMe returns the Date as an ISO string (or "YYYY-MM-DD"); the date input
// needs local "YYYY-MM-DD". Strip the time part rather than round-tripping
// through the Date constructor (which can shift a day across timezones).
function toDateInputValue(value: string | null | undefined): string {
  if (!value) return '';
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  if (m) return m[1];
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

export default function ProfileForm() {
  const { user, refresh } = useSession();
  const [name, setName] = useState(user?.name ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(() => toDateInputValue(user?.dateOfBirth));
  const [gender, setGender] = useState(user?.gender ?? '');
  const [fitnessGoals, setFitnessGoals] = useState<string[]>(user?.fitnessGoals ?? []);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleGoal = (goal: string) => {
    setFitnessGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const dobError = dateOfBirthError(dateOfBirth);
    if (dobError) {
      setError(dobError);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          dateOfBirth,
          gender: gender || null,
          fitnessGoals,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not save profile');
        return;
      }
      await refresh();
      setSuccess('Profile saved');
    } catch {
      setError('Network error — please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'mt-1 w-full rounded-lg border border-cream-200 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500';

  return (
    <form onSubmit={submit} className="card-premium p-6 max-w-lg space-y-6">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Full name
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Date of birth
          <input
            type="date"
            required
            max={maxDateOfBirth()}
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className={inputClass}
          />
          <span className="mt-1 block text-xs font-normal text-gray-500 dark:text-gray-400">
            You must be at least 11 years old to use Phool Gobhi.
          </span>
        </label>

        <fieldset className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <legend className="mb-1">Gender</legend>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className={inputClass}
          >
            <option value="">Prefer not to say</option>
            {GENDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <legend className="mb-2">Fitness goals</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {GOAL_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 rounded-lg border border-cream-200 dark:border-gray-700 px-3 py-2 cursor-pointer text-gray-700 dark:text-gray-300 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/20"
              >
                <input
                  type="checkbox"
                  checked={fitnessGoals.includes(opt.value)}
                  onChange={() => toggleGoal(opt.value)}
                  className="accent-emerald-600"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold disabled:opacity-60"
      >
        {submitting ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
