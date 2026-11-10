import { notFound } from 'next/navigation';
import { gatewayFetch, GatewayError } from '@/lib/gateway-client';
import OpenBuddyApp from './OpenBuddyApp';

export const metadata = { title: 'Buddy profile | Phool Gobhi', robots: { index: false, follow: false } };

type RecordEntry = { id: number; exerciseName: string; weight: number; unit: string; reps: number; mediaUrl?: string; mediaType?: string };
type Profile = { name: string; bio: string; publicCode: string; profileImageUrl: string; followers: number; records: RecordEntry[] };

export default async function BuddyPage({ params, searchParams }: {
  params: Promise<{ code: string }>; searchParams: Promise<{ env?: string }>;
}) {
  const { code: rawCode } = await params;
  const { env } = await searchParams;
  const code = rawCode.toUpperCase();
  if (!/^[A-F0-9]{12}$/.test(code)) notFound();
  // The public website uses its configured gateway only. A dev code remains
  // an app-only preview, so it can never accidentally resolve on production.
  if (env === 'dev') return <main className="container-custom section-padding max-w-xl space-y-6">
    <h1 className="text-3xl font-bold">Development buddy profile</h1>
    <p>Open this profile in the development app.</p><OpenBuddyApp code={code} development />
  </main>;
  let profile: Profile | null = null;
  let unavailable = false;
  try { profile = (await gatewayFetch<{ data: Profile }>(`/api/buddy/public/${code}`)).data; }
  catch (err) { if (err instanceof GatewayError && [403,404].includes(err.status)) unavailable = true; else throw err; }
  if (unavailable || !profile) return <main className="container-custom section-padding max-w-xl space-y-6">
    <h1 className="text-3xl font-bold">Profile unavailable</h1>
    <p>This profile may be private or require an eligible account. Open it in the app to check.</p>
    <OpenBuddyApp code={code} />
  </main>;
  return <main className="container-custom section-padding max-w-xl space-y-6">
    {profile.profileImageUrl && <img src={profile.profileImageUrl} alt="Buddy profile" className="w-full max-h-80 rounded-2xl object-cover" />}
    <h1 className="text-3xl font-bold">{profile.name}</h1>
    <p className="font-mono">{profile.publicCode}</p><p>{profile.followers} followers</p>
    <p className="whitespace-pre-wrap">{profile.bio}</p><OpenBuddyApp code={code} />
    <h2 className="text-2xl font-bold">Personal records</h2>
    {profile.records.length === 0 && <p>No personal records added yet.</p>}
    {profile.records.map(record => <article key={record.id} className="card-premium p-5 space-y-3">
      <h3 className="text-xl font-semibold">{record.exerciseName}</h3>
      <p>{record.weight} {record.unit} × {record.reps} reps</p>
      {record.mediaUrl && (record.mediaType === 'video'
        ? <video src={record.mediaUrl} controls preload="metadata" className="w-full rounded-xl" />
        : <img src={record.mediaUrl} alt={`${record.exerciseName} personal record`} className="w-full rounded-xl" />)}
    </article>)}
  </main>;
}
