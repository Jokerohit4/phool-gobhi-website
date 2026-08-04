'use client';

import { useSession } from '@/components/auth/SessionProvider';
import ProfileForm from '@/components/profile/ProfileForm';

export default function ProfilePage() {
  const { user, loading } = useSession();

  if (loading) return <div className="section-padding container-custom">Loading…</div>;
  if (!user) return <div className="section-padding container-custom">Please log in to view your profile.</div>;

  return (
    <div className="section-padding container-custom space-y-6">
      <h1 className="text-3xl font-bold">My profile</h1>
      <div className="card-premium p-6 max-w-lg space-y-2 text-sm">
        <p className="text-gray-500 dark:text-gray-400">Phone</p>
        <p className="font-medium">{user.phone}</p>
        {user.email && (
          <>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Email</p>
            <p className="font-medium">{user.email}</p>
          </>
        )}
      </div>
      <ProfileForm />
    </div>
  );
}
