import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Sparkles, Upload, Wand2 } from 'lucide-react';

import { AGENT_MODEL_OPTIONS } from '@/lib/agent-settings';
import { m } from '@/paraglide/messages.js';
import { PageState } from '@/components/page-state';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const Route = createFileRoute('/(agent)/editor')({
  component: EditorPage,
});

// Mirrors the composer's model picker.
const MODELS = AGENT_MODEL_OPTIONS.map((option) => ({
  id: option.value,
  name: option.label,
}));

function EditorPage() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(MODELS[0].id);

  return (
    <div className="h-full min-w-0 space-y-6 overflow-y-auto p-4 sm:p-6 [&_[data-slot=card]]:rounded-3xl [&_button]:min-h-11 [&_button]:min-w-11">
      <div>
        <h1 className="font-serif text-3xl tracking-tight">
          {m['agent.editor.title']()}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {m['agent.editor.description']()}
        </p>
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Canvas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Canvas</CardTitle>
          </CardHeader>
          <CardContent>
            <label
              className="border-border bg-secondary/30 hover:bg-secondary/50 focus-visible:outline-ring flex min-h-80 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-4 text-center focus-visible:outline-2"
              htmlFor="upload"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.currentTarget.querySelector('input')?.click();
                }
              }}
            >
              <PageState
                headingLevel={2}
                title={m['agent.editor.upload_label']()}
                description={m['agent.editor.upload_hint']()}
                artwork={
                  <Upload
                    aria-hidden="true"
                    className="text-primary mx-auto size-10"
                  />
                }
                className="border-0 bg-transparent px-2 py-6 sm:px-2 sm:py-6 [&_h2]:text-xl [&_h2]:sm:text-2xl"
              />
              <input
                id="upload"
                type="file"
                accept="image/*"
                className="hidden"
              />
            </label>
          </CardContent>
        </Card>

        {/* Prompt panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="text-primary size-4" />
              {m['agent.editor.prompt_label']()}
            </CardTitle>
            <CardDescription>{m['agent.editor.model_label']()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              items={MODELS.map((mo) => ({ label: mo.name, value: mo.id }))}
              value={model}
              onValueChange={(v) => v && setModel(v)}
            >
              <SelectTrigger
                aria-label={m['agent.editor.model_label']()}
                className="min-h-11 w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((mo) => (
                  <SelectItem key={mo.id} value={mo.id}>
                    {mo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={m['agent.editor.prompt_placeholder']()}
              aria-label={m['agent.editor.prompt_label']()}
              className="min-h-11"
            />

            <Button className="w-full gap-2" disabled={!prompt.trim()}>
              <Wand2 className="size-4" />
              {m['agent.editor.submit']()}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {m['agent.editor.history']()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PageState
            headingLevel={2}
            title={m['agent.editor.empty_history']()}
            description={m['agent.editor.description']()}
            className="border-dashed [&_h2]:text-xl [&_h2]:sm:text-2xl"
          />
        </CardContent>
      </Card>
    </div>
  );
}
