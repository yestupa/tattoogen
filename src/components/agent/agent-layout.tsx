import { useEffect, useRef, useState } from 'react';
import { Images, Pencil } from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { usePathname, useRouter } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import {
  AgentHeaderProvider,
  useAgentHeader,
} from '@/components/agent/agent-header-context';
import { ChatsSidebar } from '@/components/agent/chats-sidebar';
import { PreviewPane } from '@/components/agent/preview-pane';
import {
  PreviewPaneProvider,
  usePreviewPane,
} from '@/components/agent/preview-pane-context';
import { Button } from '@/components/ui/button';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export function AgentLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const showPreview =
    pathname.includes('/chat/') ||
    pathname.endsWith('/chat') ||
    pathname.endsWith('/library');
  const signInRedirected = useRef(false);
  const userId = session?.user?.id;

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1280px)');
    const syncSidebar = () => setSidebarOpen(desktop.matches);
    syncSidebar();
    desktop.addEventListener('change', syncSidebar);
    return () => desktop.removeEventListener('change', syncSidebar);
  }, []);

  useEffect(() => {
    if (isPending) return;
    if (userId) {
      signInRedirected.current = false;
      return;
    }
    if (signInRedirected.current) return;
    signInRedirected.current = true;
    router.push('/sign-in');
  }, [isPending, userId, router]);

  if (isPending || !userId) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div
          className="flex flex-col items-center gap-3"
          role="status"
          aria-live="polite"
        >
          <div
            aria-hidden="true"
            className="border-primary size-6 rounded-full border-2 border-t-transparent motion-safe:animate-spin"
          />
          <span className="text-muted-foreground text-sm">
            {m['agent.chats.loading']()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      data-agent-workspace=""
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      className="bg-sidebar [&_a]:focus-visible:outline-ring [&_button]:focus-visible:outline-ring h-dvh min-h-0 overflow-hidden motion-reduce:[&_*]:!transition-none [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_button]:min-h-11 [&_button]:min-w-11 [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2"
    >
      {/* Portal menus live outside the workspace wrapper. Scope their touch
          targets to this mounted workspace without changing shared primitives. */}
      <style>{`
        @media (max-width: 767px) {
          body:has([data-agent-workspace]) :is([data-slot="dialog-content"], [data-slot="sheet-content"], [data-slot="dropdown-menu-content"], [data-slot="dropdown-menu-sub-content"], [data-slot="select-content"]) :is(button, a, [role="menuitem"], [role="option"]) {
            min-height: 44px;
            min-width: 44px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          body:has([data-agent-workspace]) :is([data-slot="sheet-content"], [data-slot="sheet-overlay"], [data-slot="dialog-content"], [data-slot="dropdown-menu-content"], [data-slot="dropdown-menu-sub-content"]) {
            animation: none;
            transition: none;
          }
        }
      `}</style>
      <PreviewPaneProvider>
        <AgentHeaderProvider>
          <ChatsSidebar />
          {/* No fixed h-dvh here: the inset carries `m-2` in inset variant, so
              pinning it to the full viewport height pushes its bottom margin
              off-screen. Stretching inside the h-dvh provider keeps the gap. */}
          <SidebarInset className="bg-background flex min-h-0 min-w-0 flex-1 basis-0 flex-col overflow-hidden md:rounded-3xl md:border md:shadow-none">
            <AgentHeader showGallery={showPreview} />
            <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
              {children}
            </div>
          </SidebarInset>
          {showPreview && <PreviewPane />}
        </AgentHeaderProvider>
      </PreviewPaneProvider>
    </SidebarProvider>
  );
}

function AgentHeader({ showGallery }: { showGallery: boolean }) {
  const { content } = useAgentHeader();
  const { open, images, setOpen, clearImage } = usePreviewPane();

  return (
    <header className="border-border flex min-h-16 shrink-0 items-center gap-2 border-b px-3 sm:px-5">
      <SidebarTrigger
        aria-label={m['agent.chats.title']()}
        className="size-11 rounded-xl"
      />
      {content.title && (
        <div className="ml-2 flex min-w-0 items-center gap-1">
          <h1 className="truncate font-serif text-lg font-normal">
            {content.title}
          </h1>
          {content.onEditClick && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={content.onEditClick}
              aria-label={m['agent.chats.rename']()}
              className="text-muted-foreground hover:text-foreground size-11 rounded-xl"
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
        </div>
      )}

      {/* Page actions sit with the gallery toggle at the right edge. */}
      <div className="ml-auto flex items-center gap-1">
        {content.actions}
        {/* The pane has its own close button, so this only shows while it's
            hidden. */}
        {showGallery && !open && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              clearImage();
              setOpen(true);
            }}
            aria-label={m['agent.preview.open_gallery']()}
            title={m['agent.preview.open_gallery']()}
            className="text-muted-foreground hover:text-foreground size-11 shrink-0 rounded-xl"
          >
            <Images className="size-4" />
            {images.length > 0 && (
              <span className="text-muted-foreground ml-1 text-xs">
                {images.length}
              </span>
            )}
          </Button>
        )}
      </div>
    </header>
  );
}
