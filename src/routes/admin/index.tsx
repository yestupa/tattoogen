import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Shield, Users } from 'lucide-react';

import { apiGet } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { PageHeading } from '@/components/page-heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function AdminPage() {
  const usersQuery = useQuery({
    queryKey: ['admin-users-total'],
    queryFn: () => apiGet<{ total: number }>('/api/admin/users'),
  });
  const rolesQuery = useQuery({
    queryKey: ['admin-roles-total'],
    queryFn: () => apiGet<{ total: number }>('/api/admin/roles'),
  });

  const stats = {
    users: usersQuery.data?.total ?? 0,
    roles: rolesQuery.data?.total ?? 0,
  };

  return (
    <div className="mx-auto max-w-7xl min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        className="[&_h1]:text-3xl [&_h1]:sm:text-3xl"
        title={m['admin.title']()}
        description={m['admin.description']()}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {m['admin.stats.total_users']()}
            </CardTitle>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {m['admin.stats.roles']()}
            </CardTitle>
            <Shield className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.roles}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
});
