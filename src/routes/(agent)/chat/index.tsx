import { createFileRoute } from '@tanstack/react-router';

import { PromptLauncher } from '@/components/agent/prompt-launcher';

export const Route = createFileRoute('/(agent)/chat/')({
  component: AgentHomePage,
});

function AgentHomePage() {
  return (
    <div className="flex h-full min-w-0 flex-col overflow-x-hidden overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col justify-center px-4 py-8 sm:px-6">
        <PromptLauncher className="[&_button]:focus-visible:outline-ring [&_button]:min-h-11 [&_button]:min-w-11 [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_h1]:text-left [&_h1]:text-3xl [&_img]:rounded-xl [&_p]:text-left" />
      </div>
    </div>
  );
}
