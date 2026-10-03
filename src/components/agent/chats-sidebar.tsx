import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Images,
  Loader2,
  MessagesSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link, usePathname } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { stopRun, useRunningSessions } from '@/lib/agent-runs';
import { apiDelete, apiGet, apiPatch } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { useChatActions } from '@/components/agent/chat-actions';
import { ChatCover } from '@/components/agent/chat-cover';
import { PlanCard } from '@/components/agent/plan-card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { UserMenu } from '@/components/user-menu';

interface ChatItem {
  id: string;
  title: string;
  preview: string;
  cover: string;
  updatedAt: number;
}

interface ChatListData {
  chats?: Array<{
    id: string;
    title: string;
    preview: string;
    cover: string;
    updatedAt: string;
  }>;
  total?: number;
}

// Other views (the chat page after a turn completes, the rename dialog)
// fire this event so the sidebar refetches without threading a callback
// through props.
const CHATS_CHANGED_EVENT = 'image-agent:chats-changed';

/** Recent chats shown inline; the rest live on /chats. */
const SIDEBAR_CHAT_LIMIT = 10;

export function notifyChatsChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CHATS_CHANGED_EVENT));
}

export function ChatsSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { isMobile, setOpenMobile, setOpen } = useSidebar();

  const { openRename, openDelete, dialogs } = useChatActions();

  // Only the inline slice is fetched here; `total` tells us whether the
  // "more" entry is needed.
  const listQuery = useQuery({
    queryKey: ['agent-chats', 1, SIDEBAR_CHAT_LIMIT],
    queryFn: () =>
      apiGet<ChatListData>(
        `/api/agent/chats?page=1&pageSize=${SIDEBAR_CHAT_LIMIT}`
      ),
    enabled: !!session?.user,
  });

  const chats: ChatItem[] = useMemo(
    () =>
      (listQuery.data?.chats ?? []).map((c) => ({
        id: c.id,
        title: c.title,
        preview: c.preview,
        cover: c.cover,
        updatedAt: new Date(c.updatedAt).getTime(),
      })),
    [listQuery.data]
  );

  useEffect(() => {
    const handler = () =>
      queryClient.invalidateQueries({ queryKey: ['agent-chats'] });
    window.addEventListener(CHATS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(CHATS_CHANGED_EVENT, handler);
  }, [queryClient]);

  const derivedActiveId = pathname.match(/\/chat\/([^/]+)/)?.[1];
  const runningSessions = useRunningSessions();
  const user = session?.user;

  return (
    <Sidebar
      variant="inset"
      aria-label={m['agent.chats.title']()}
      className="[&_a]:min-h-11 [&_button]:min-h-11 [&_button]:min-w-11 [&_svg]:shrink-0"
    >
      <SidebarHeader className="relative px-3 pt-5 pb-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={m['agent.preview.close']()}
          onClick={() => (isMobile ? setOpenMobile(false) : setOpen(false))}
          className="absolute top-2 right-2 z-10 size-11 rounded-xl xl:hidden"
        >
          <X />
        </Button>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/chat"
              className="focus-visible:outline-ring flex min-h-11 w-full items-center gap-3 rounded-xl px-2 pr-11 text-left text-sm focus-visible:outline-2"
            >
              <img
                src={envConfigs.app_logo}
                alt={envConfigs.app_name}
                className="size-6 shrink-0"
              />
              <span className="flex flex-1 items-center font-serif text-lg italic">
                {envConfigs.app_name}
              </span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="[&_[data-slot=sidebar-menu-button][data-active=true]]:bg-primary/10 [&_[data-slot=sidebar-menu-button][data-active=true]]:text-primary gap-5 px-1 [&_[data-slot=sidebar-menu-button]]:rounded-xl [&_[data-slot=sidebar-menu-button]]:px-3 [&_[data-slot=sidebar-menu-button][data-active=true]]:font-semibold">
        <nav
          aria-label={m['agent.chats.title']()}
          className="space-y-5 [&_a]:min-h-11 [&_button]:min-h-11 [&_button]:min-w-11"
        >
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/chat">
                    <SidebarMenuButton
                      tooltip={m['agent.nav.new_chat']()}
                      isActive={pathname.endsWith('/chat')}
                    >
                      <Plus />
                      <span>{m['agent.nav.new_chat']()}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/library">
                    <SidebarMenuButton
                      tooltip={m['agent.nav.library']()}
                      isActive={pathname.endsWith('/library')}
                    >
                      <Images />
                      <span>{m['agent.nav.library']()}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/chats">
                    <SidebarMenuButton
                      tooltip={m['agent.nav.chats']()}
                      isActive={pathname.endsWith('/chats')}
                    >
                      <MessagesSquare />
                      <span>{m['agent.nav.chats']()}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>{m['agent.chats.title']()}</SidebarGroupLabel>
            <SidebarGroupContent>
              {chats.length === 0 ? (
                <div className="px-2 py-4 text-center">
                  <p className="text-muted-foreground text-xs">
                    {m['agent.chats.empty']()}
                  </p>
                </div>
              ) : (
                <>
                  <ChatList
                    items={chats}
                    activeId={derivedActiveId}
                    runningIds={runningSessions}
                    onRename={openRename}
                    onDelete={openDelete}
                  />
                  {(listQuery.data?.total ?? 0) > SIDEBAR_CHAT_LIMIT && (
                    <SidebarMenu>
                      <SidebarMenuItem>
                        {/* Everything past the inline slice lives on the
                          full chats page. */}
                        <Link href="/chats">
                          <SidebarMenuButton className="text-muted-foreground">
                            <MoreHorizontal />
                            <span>{m['agent.chats.view_all']()}</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  )}
                </>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border gap-3 border-t p-3 [&_a]:min-h-11 [&_button]:min-h-11 [&_button]:min-w-11">
        {user && <PlanCard />}
        {user && (
          <UserMenu
            name={user.name || m['common.user.fallback_name']()}
            email={user.email}
            image={user.image}
            profileHref="/settings"
          />
        )}
      </SidebarFooter>

      {dialogs}
    </Sidebar>
  );
}

function ChatList({
  items,
  activeId,
  runningIds,
  onRename,
  onDelete,
}: {
  items: ChatItem[];
  activeId?: string;
  runningIds: string[];
  onRename: (item: ChatItem) => void;
  onDelete: (item: ChatItem) => void;
}) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const href = `/chat/${item.id}`;
        const isActive = activeId === item.id;
        const isRunning = runningIds.includes(item.id);
        return (
          <SidebarMenuItem key={item.id}>
            <Link href={href}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={isActive}
                className="pr-12"
              >
                {item.cover && (
                  <ChatCover
                    src={item.cover}
                    alt=""
                    className="size-7 rounded-sm"
                  />
                )}
                <span className="truncate">{item.title}</span>
              </SidebarMenuButton>
            </Link>
            {/* The action slot is either/or: a spinner while the turn runs,
                the "…" menu once it's done. Renaming or deleting a chat
                mid-turn isn't something we want to invite. */}
            {isRunning ? (
              <span
                className="text-primary absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center"
                title={m['agent.chats.working']()}
              >
                <Loader2 className="size-3.5 motion-safe:animate-spin" />
              </span>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuAction
                      showOnHover
                      className="top-0 right-0 size-11 rounded-xl"
                      aria-label={m['agent.chats.more']()}
                    />
                  }
                >
                  <MoreHorizontal />
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start">
                  <DropdownMenuItem
                    className="min-h-11"
                    onClick={() => onRename(item)}
                  >
                    <Pencil className="size-4" />
                    {m['agent.chats.rename']()}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    className="min-h-11"
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 className="size-4" />
                    {m['agent.chats.delete']()}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
