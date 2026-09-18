'use client';

interface Disclaimer {
  title: string;
  body: string[];
  acceptLabel: string;
}

/**
 * Blocking, non-dismissible consent gate shown before the first message.
 *
 * Modelled on NamePromptModal: no backdrop-click handler, no close button, no
 * Escape. That is deliberate here for a different reason than it was there —
 * this is the point at which someone agrees that an AI may read their training
 * history and answer questions about their body, and a gate you can dismiss by
 * tapping beside it is not a record of anyone agreeing to anything.
 *
 * `stale` distinguishes "you've never agreed" from "the terms changed". Showing
 * a returning user a first-run screen would misrepresent what happened.
 */
export default function DisclaimerGate({
  disclaimer,
  stale,
  busy,
  error,
  onAccept,
}: {
  disclaimer: Disclaimer;
  stale: boolean;
  busy: boolean;
  error: string | null;
  onAccept: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="coach-disclaimer-title"
        className="card-premium w-full max-w-md p-6"
      >
        <h2 id="coach-disclaimer-title" className="text-xl font-bold">
          {stale ? 'We’ve updated these terms' : disclaimer.title}
        </h2>

        {stale && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            You agreed to an earlier version. Please read these again before carrying on.
          </p>
        )}

        <ul className="mt-4 space-y-3">
          {disclaimer.body.map((line) => (
            <li
              key={line}
              className="flex gap-2 text-sm text-gray-700 dark:text-gray-200"
            >
              <span aria-hidden="true" className="text-emerald-600">
                •
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <button
          type="button"
          onClick={onAccept}
          disabled={busy}
          className="btn-primary mt-6 w-full disabled:opacity-60"
        >
          {busy ? 'Saving…' : disclaimer.acceptLabel}
        </button>

        <p className="mt-3 text-center text-xs text-gray-500">
          You can withdraw this at any time from your profile.
        </p>
      </div>
    </div>
  );
}
