import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useSession } from '@/core/auth/client';
import { usePathname, useRouter } from '@/core/i18n/navigation';
import { apiGet } from '@/lib/api-client';
import { useUserPermissions } from '@/hooks/use-user-permissions';
import { AppSidebar, type NavItem } from '@/components/app-sidebar';
import { BrandArtwork } from '@/components/brand-artwork';
import { PageState } from '@/components/page-state';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenu } from '@/components/user-menu';

export function AppLayout({
  children,
  navItems,
  footerNavItems,
  backNav,
  brand,
  brandHref = '/',
  mobileBrand,
  loadingTitle,
  mobileNavLabel,
  fallbackUserName,
  headerExtra,
  profileHref,
  requirePermission,
  unauthorizedRedirect = '/settings',
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  footerNavItems?: NavItem[];
  backNav?: NavItem;
  brand: React.ReactNode;
  brandHref?: string;
  mobileBrand?: React.ReactNode;
  loadingTitle: string;
  mobileNavLabel: string;
  fallbackUserName: string;
  headerExtra?: React.ReactNode;
  profileHref?: string;
  requirePermission?: string;
  unauthorizedRedirect?: string;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  // Guard against a double redirect: useLocation() flips to "/sign-in" the moment
  // we navigate (while this layout is still mounted), which would otherwise re-fire
  // the effect and overwrite callbackUrl with the sign-in path itself.
  const redirectingRef = useRef(false);

  // Invite-only gate: needs the user's membership status (also covers social
  // logins). `needsInvite` is computed server-side in /api/user/info.
  const userInfoQuery = useQuery({
    queryKey: ['user-info'],
    queryFn: () => apiGet<{ needsInvite?: boolean }>('/api/user/info'),
    staleTime: 60_000,
    enabled: !!session?.user,
  });
  const needsInvite = userInfoQuery.data?.needsInvite === true;
  const membershipResolved =
    !session?.user || userInfoQuery.isSuccess || userInfoQuery.isError;

  // Only query permissions once we have a session and a permission gate.
  const permissionsEnabled = !!session?.user && !!requirePermission;
  const permissionsQuery = useUserPermissions(permissionsEnabled);
  const isAdmin = permissionsQuery.data?.isAdmin === true;

  // Authorization resolution mirrors the original imperative flow:
  // - no permission gate → authorized once a session exists + membership ok
  // - permission gate → authorized only when the query resolves with isAdmin
  const authorized =
    !!session?.user &&
    membershipResolved &&
    !needsInvite &&
    (!requirePermission || isAdmin);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      if (redirectingRef.current) return;
      redirectingRef.current = true;
      // Remember where the user was headed so sign-in can send them back.
      // pathname is already locale-free; append the live query string.
      const search =
        typeof window !== 'undefined' ? window.location.search : '';
      const callbackUrl = `${pathname}${search}`;
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    // Invite-only gate: wait for membership status, then bounce unredeemed
    // (incl. social) users to the redeem page. Admins are exempt server-side.
    if (userInfoQuery.isPending) return;
    if (needsInvite) {
      if (!redirectingRef.current) {
        redirectingRef.current = true;
        router.push('/redeem-invite');
      }
      return;
    }

    if (!requirePermission) return;

    // Wait for the permissions query to resolve before deciding.
    if (permissionsQuery.isPending) return;

    if (permissionsQuery.isError || !isAdmin) {
      router.push(unauthorizedRedirect);
    }
  }, [
    isPending,
    session,
    router,
    pathname,
    requirePermission,
    unauthorizedRedirect,
    userInfoQuery.isPending,
    needsInvite,
    permissionsQuery.isPending,
    permissionsQuery.isError,
    isAdmin,
  ]);

  if (isPending || !authorized || !session?.user) {
    return (
      <div className="section-ink paper-texture flex min-h-svh items-center justify-center p-4">
        <PageState
          variant="loading"
          title={loadingTitle}
          description={brand}
          artwork={<BrandArtwork className="text-primary mx-auto max-w-24" />}
        />
      </div>
    );
  }

  return (
    <SidebarProvider
      data-app-workspace
      className="bg-sidebar h-svh min-h-0 overflow-hidden"
    >
      {/* Dialog portals live outside this subtree. Scope their touch targets to
          a mounted workspace so public, auth and agent surfaces stay unchanged. */}
      <style>{`
        body:has([data-app-workspace]) [data-slot="dialog-content"] {
          border-radius: 1rem;
        }
        body:has([data-app-workspace]) [data-slot="dialog-content"] :is(button, a) {
          min-height: 44px;
          min-width: 44px;
        }
        body:has([data-app-workspace]) [data-slot="dialog-content"] a {
          display: inline-flex;
          align-items: center;
        }
        body:has([data-app-workspace]) [data-slot="dialog-content"] :is(button, a):focus-visible {
          outline: 2px solid var(--ring);
          outline-offset: 2px;
        }
      `}</style>
      <AppSidebar
        brand={brand}
        brandHref={brandHref}
        navItems={navItems}
        footerNavItems={footerNavItems}
        backNav={backNav}
        footer={
          <UserMenu
            name={session.user.name || fallbackUserName}
            email={session.user.email}
            image={session.user.image}
            profileHref={profileHref}
          />
        }
      />
      {/* min-w-0: let the inset shrink below its content's min-content width —
          otherwise wide tables stretch the page and force horizontal scroll
          instead of scrolling inside their own overflow-x-auto wrappers */}
      <main className="paper-ui border-paper-line bg-paper-bg paper-texture relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:m-2 md:ml-0 md:rounded-[1.4rem] md:border">
        <header className="border-paper-line bg-paper-panel/95 flex min-h-16 shrink-0 items-center gap-2 border-b backdrop-blur">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger
              aria-label={mobileNavLabel}
              className="text-primary size-11 rounded-xl focus-visible:ring-2"
            />
          </div>
          <span className="font-display min-w-0 truncate text-lg font-semibold tracking-[-0.025em] md:hidden">
            {mobileBrand || brand}
          </span>
          <div className="flex-1" />
          {headerExtra && (
            <div className="flex items-center gap-1 px-4">{headerExtra}</div>
          )}
        </header>
        <div className="[&_input]:focus-visible:ring-vermilion/30 [&_textarea]:focus-visible:ring-vermilion/30 [&_[data-slot=card]]:border-paper-line [&_[data-slot=card]]:bg-paper-panel min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [&_[data-slot=card]]:min-w-0 [&_[data-slot=card]]:rounded-2xl [&_[data-slot=card]]:shadow-none [&_button]:min-h-11 [&_button]:min-w-11 [&_input]:min-h-11 [&_textarea]:min-h-11">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
