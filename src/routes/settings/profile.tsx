import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { apiGet } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { PageState } from '@/components/page-state';

import { SettingsForm } from './-settings-form';

function SettingsPage() {
  const {
    data: user,
    isError,
    error,
  } = useQuery({
    queryKey: ['user-info'],
    queryFn: async () => {
      const data = await apiGet<{
        name?: string;
        email?: string;
        image?: string;
      }>('/api/user/info');
      return {
        name: data.name || '',
        email: data.email || '',
        image: data.image || '',
      };
    },
  });

  if (!user) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <PageState
          variant={isError ? 'error' : 'loading'}
          title={m['settings.profile.title']()}
          description={
            isError ? error.message : m['settings.profile.loading']()
          }
        />
      </div>
    );
  }

  return (
    <SettingsForm name={user.name} email={user.email} image={user.image} />
  );
}

export const Route = createFileRoute('/settings/profile')({
  component: SettingsPage,
});
