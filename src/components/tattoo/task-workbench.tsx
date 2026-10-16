import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useForm } from '@tanstack/react-form';

import { useSession } from '@/core/auth/client';
import { Link, useRouter } from '@/core/i18n/navigation';
import { newAgentSessionId, uploadChatImages } from '@/lib/agent';
import {
  AGENT_MODEL_OPTIONS,
  type AgentModelOptionValue,
} from '@/lib/agent-settings';
import {
  buildTaskAttachments,
  buildTattooTaskPrompt,
  personalizeTattooIdeas,
  preflightTattooTaskTurn,
  saveTattooTaskTurn,
  tattooTaskFormSchema,
  validateTattooTask,
  type TaskAttachmentKind,
  type TattooTaskInput,
  type TattooTaskKind,
} from '@/lib/tattoo-task';
import { prepareTattooUploadImage } from '@/lib/tattoo-task-images';
import { useComposerSettings } from '@/hooks/use-composer-settings';
import { TextField } from '@/components/form-field';

import {
  TaskFontPreview,
  type TaskFontCopy,
  type TaskFontSettings,
} from './task-font-preview';
import { TaskGapGuide } from './task-gap-guide';
import {
  TaskImagePicker,
  type TaskImageCopy,
  type TaskLocalImage,
} from './task-image-picker';

export type TaskWorkbenchCopy = TaskImageCopy & {
  localNote: string;
  textLabel: string;
  textPlaceholder: string;
  themePlaceholder: string;
  labels: Record<
    'theme' | 'meaning' | 'mood' | 'placement' | 'style' | 'size' | 'notes',
    string
  >;
  sourceLabel: string;
  sourceOptional: string;
  sourcePreview: string;
  guideLabel: string;
  guidePreview: string;
  drawGuide: string;
  uploadGuide: string;
  drawLabel: string;
  drawHint: string;
  clearGuide: string;
  guideReady: string;
  guideNote: string;
  coverMode: string;
  coverUp: string;
  rework: string;
  aiAction: string;
  aiBusy: string;
  aiNote: string;
  modelLabel: string;
  creditsUnit: string;
  signIn: string;
  signInHint: string;
  checkingSession: string;
  buildIdeas: string;
  ideasTitle: string;
  ideasNote: string;
  buildFirst: string;
  selectDirection: string;
  selectedDirection: string;
  directionTitles: string[];
  ideaTemplates: string[];
};
type FormValues = Omit<TattooTaskInput, 'kind' | 'font' | 'direction'>;
const defaultValues: FormValues = {
  text: '',
  theme: '',
  meaning: '',
  mood: '',
  placement: '',
  style: '',
  size: '',
  notes: '',
  coverMode: 'cover-up',
};
const buttonClass =
  'border-paper-line min-h-11 rounded-full border px-5 py-2 text-sm font-semibold disabled:opacity-40';
const textAreaClass =
  'border-paper-line bg-paper-panel mt-2 block min-h-28 w-full min-w-0 rounded-lg border px-3 py-2 text-sm';

export function TaskWorkbench({
  kind,
  copy,
  fontCopy,
}: {
  kind: TattooTaskKind;
  copy: TaskWorkbenchCopy;
  fontCopy: TaskFontCopy;
}) {
  const id = useId();
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [settings, setSettings] = useComposerSettings();
  const [source, setSource] = useState<TaskLocalImage | null>(null);
  const [sourceRevision, setSourceRevision] = useState(0);
  const sourceRevisionRef = useRef(0);
  const [markedGuide, setMarkedGuide] = useState<TaskLocalImage | null>(null);
  const [drawnGuide, setDrawnGuide] = useState<File | null>(null);
  const [guideMode, setGuideMode] = useState<'draw' | 'upload'>('draw');
  const [font, setFont] = useState<TaskFontSettings>({
    family: 'Georgia, "Times New Roman", serif',
    size: 56,
    spacing: 0,
    layout: 'lines',
  });
  const [directions, setDirections] = useState<{
    signature: string;
    briefs: string[];
    selected: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const mounted = useRef(true);
  const [error, setError] = useState('');
  const [needsSignIn, setNeedsSignIn] = useState(false);

  useEffect(() => {
    mounted.current = true;
    const refreshSession = () => {
      void refetch();
    };
    window.addEventListener('focus', refreshSession);
    return () => {
      mounted.current = false;
      window.removeEventListener('focus', refreshSession);
    };
  }, [refetch]);
  useEffect(() => {
    if (session?.user) setNeedsSignIn(false);
  }, [session?.user]);

  const changeSource = useCallback((image: TaskLocalImage | null) => {
    setSourceRevision(++sourceRevisionRef.current);
    setSource(image);
    setMarkedGuide(null);
    setDrawnGuide(null);
  }, []);

  const changeMarkedGuide = useCallback(
    (image: TaskLocalImage | null) => {
      if (sourceRevision === sourceRevisionRef.current && mounted.current)
        setMarkedGuide(image);
    },
    [sourceRevision]
  );
  const changeDrawnGuide = useCallback(
    (file: File | null) => {
      if (sourceRevision === sourceRevisionRef.current && mounted.current)
        setDrawnGuide(file);
    },
    [sourceRevision]
  );

  async function createConcept(value: FormValues) {
    if (busyRef.current) return;
    setError('');
    const guide =
      kind === 'filler'
        ? guideMode === 'draw'
          ? drawnGuide
          : markedGuide?.file
        : null;
    const assets = { source: !!source, guide: !!guide };
    const input: TattooTaskInput = {
      ...value,
      kind,
      ...(kind === 'font' ? { font } : {}),
      ...(kind === 'idea' && directions?.signature === JSON.stringify(value)
        ? { direction: directions.briefs[directions.selected] }
        : {}),
    };
    try {
      validateTattooTask(input, assets);
    } catch (cause) {
      setError(
        copy.errors[cause instanceof Error ? cause.message : ''] ||
          copy.errors.submit
      );
      return;
    }
    if (kind === 'idea' && !input.direction) {
      setError(copy.buildFirst);
      return;
    }
    if (isPending) {
      setError(copy.checkingSession);
      return;
    }
    if (!session?.user) {
      setNeedsSignIn(true);
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      const sessionId = newAgentSessionId();
      const initialTurn = {
        prompt: buildTattooTaskPrompt(input, assets),
        settings,
      };
      const pendingImages: {
        kind: TaskAttachmentKind;
        file: File;
        canvas?: HTMLCanvasElement;
      }[] = [];
      if (source)
        pendingImages.push({
          kind: 'source',
          file: source.file,
          canvas: source.canvas,
        });
      if (guide)
        pendingImages.push({
          kind: 'annotation',
          file: guide,
          canvas: guideMode === 'upload' ? markedGuide?.canvas : undefined,
        });
      preflightTattooTaskTurn(
        sessionStorage,
        sessionId,
        initialTurn,
        pendingImages.map((image) => image.kind)
      );
      const preparedFiles: File[] = [];
      for (const image of pendingImages) {
        preparedFiles.push(
          await prepareTattooUploadImage(image.file, image.canvas)
        );
        if (!mounted.current) return;
      }
      const urls = await uploadChatImages(preparedFiles);
      if (!mounted.current) return;
      const uploadedImages: Partial<
        Record<TaskAttachmentKind, { name: string; url: string }>
      > = {};
      pendingImages.forEach((image, index) => {
        uploadedImages[image.kind] = {
          name: preparedFiles[index].name,
          url: urls[index],
        };
      });
      const attachments = buildTaskAttachments(uploadedImages);
      const destination = saveTattooTaskTurn(sessionStorage, sessionId, {
        ...initialTurn,
        attachments,
      });
      router.push(destination);
    } catch (cause) {
      if (mounted.current)
        setError(
          copy.errors[cause instanceof Error ? cause.message : ''] ||
            copy.errors.submit
        );
    } finally {
      busyRef.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) =>
        tattooTaskFormSchema.safeParse(value).success
          ? undefined
          : copy.errors['input-too-long'],
    },
    onSubmit: async ({ value }) => createConcept(value),
  });

  function buildIdeas() {
    setError('');
    try {
      const value = form.state.values;
      const briefs = personalizeTattooIdeas(
        { ...value, kind: 'idea' },
        copy.ideaTemplates
      );
      setDirections({ signature: JSON.stringify(value), briefs, selected: 0 });
    } catch (cause) {
      setError(
        copy.errors[cause instanceof Error ? cause.message : ''] ||
          copy.errors.submit
      );
    }
  }

  const commonFields = (
    kind === 'idea'
      ? ['theme', 'meaning', 'mood', 'placement', 'style', 'size']
      : kind === 'font'
        ? ['placement', 'style', 'size']
        : ['theme', 'placement', 'style', 'size']
  ) as (keyof TaskWorkbenchCopy['labels'])[];

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <p className="text-paper-muted max-w-3xl text-sm leading-6">
        {copy.localNote}
      </p>
      <fieldset
        disabled={busy}
        className="mt-6 min-w-0 space-y-7 disabled:opacity-70"
      >
        <div className="grid min-w-0 gap-8 lg:grid-cols-2">
          <div className="min-w-0 space-y-5">
            {kind === 'coverup' && (
              <fieldset className="border-paper-line rounded-xl border p-4">
                <legend className="px-1 text-sm font-semibold">
                  {copy.coverMode}
                </legend>
                <form.Field name="coverMode">
                  {(field) => (
                    <div className="space-y-2">
                      {(['cover-up', 'rework'] as const).map((mode) => (
                        <label
                          key={mode}
                          className="flex min-h-11 items-center gap-3 text-sm"
                        >
                          <input
                            type="radio"
                            name={`${id}-covermode`}
                            value={mode}
                            checked={field.state.value === mode}
                            onChange={() => field.handleChange(mode)}
                            onBlur={field.handleBlur}
                          />
                          {mode === 'cover-up' ? copy.coverUp : copy.rework}
                        </label>
                      ))}
                    </div>
                  )}
                </form.Field>
              </fieldset>
            )}
            {kind === 'font' && (
              <form.Field name="text">
                {(field) => (
                  <label
                    className="block text-sm font-semibold"
                    htmlFor={`${id}-text`}
                  >
                    {copy.textLabel}
                    <textarea
                      id={`${id}-text`}
                      name={field.name}
                      required
                      maxLength={200}
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                      placeholder={copy.textPlaceholder}
                      className={textAreaClass}
                    />
                  </label>
                )}
              </form.Field>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              {commonFields.map((name) => (
                <form.Field key={name} name={name}>
                  {(field) => (
                    <TextField
                      field={field}
                      label={copy.labels[name]}
                      required={
                        name === 'theme' &&
                        (kind === 'idea' || kind === 'filler')
                      }
                      placeholder={
                        name === 'theme' ? copy.themePlaceholder : undefined
                      }
                    />
                  )}
                </form.Field>
              ))}
            </div>
            <form.Field name="notes">
              {(field) => (
                <label
                  className="block text-sm font-semibold"
                  htmlFor={`${id}-notes`}
                >
                  {copy.labels.notes}
                  <textarea
                    id={`${id}-notes`}
                    name={field.name}
                    maxLength={2000}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    className={textAreaClass}
                  />
                </label>
              )}
            </form.Field>
            {(kind === 'image' || kind === 'coverup' || kind === 'filler') && (
              <TaskImagePicker
                value={source}
                onChange={changeSource}
                label={
                  kind === 'filler' ? copy.sourceOptional : copy.sourceLabel
                }
                previewLabel={copy.sourcePreview}
                copy={copy}
              />
            )}
          </div>
          <div className="min-w-0">
            {kind === 'font' && (
              <form.Subscribe selector={(state) => state.values.text}>
                {(text) => (
                  <TaskFontPreview
                    text={text}
                    copy={fontCopy}
                    onChange={setFont}
                  />
                )}
              </form.Subscribe>
            )}
            {kind === 'idea' && (
              <div className="border-paper-line rounded-2xl border p-4 sm:p-6">
                <h2 className="font-display text-2xl font-bold">
                  {copy.ideasTitle}
                </h2>
                <p className="text-paper-muted mt-3 text-sm leading-6">
                  {copy.ideasNote}
                </p>
                <button
                  type="button"
                  className={`${buttonClass} mt-5`}
                  onClick={buildIdeas}
                >
                  {copy.buildIdeas}
                </button>
                <form.Subscribe selector={(state) => state.values}>
                  {(value) =>
                    directions?.signature === JSON.stringify(value) ? (
                      <div className="mt-5 space-y-4">
                        {directions.briefs.map((brief, index) => (
                          <button
                            type="button"
                            key={index}
                            aria-pressed={directions.selected === index}
                            onClick={() =>
                              setDirections({ ...directions, selected: index })
                            }
                            className={`border-paper-line w-full rounded-xl border p-4 text-left ${directions.selected === index ? 'ring-vermilion ring-2' : ''}`}
                          >
                            <span className="font-display block text-lg font-bold">
                              {copy.directionTitles[index]}
                            </span>
                            <span className="text-paper-muted mt-2 block text-sm leading-6">
                              {brief}
                            </span>
                            <span className="text-vermilion mt-3 block text-xs font-semibold">
                              {directions.selected === index
                                ? copy.selectedDirection
                                : copy.selectDirection}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null
                  }
                </form.Subscribe>
              </div>
            )}
            {kind === 'filler' && (
              <section className="border-paper-line rounded-2xl border p-4 sm:p-6">
                <div className="mb-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    aria-pressed={guideMode === 'draw'}
                    className={buttonClass}
                    onClick={() => setGuideMode('draw')}
                  >
                    {copy.drawGuide}
                  </button>
                  <button
                    type="button"
                    aria-pressed={guideMode === 'upload'}
                    className={buttonClass}
                    onClick={() => setGuideMode('upload')}
                  >
                    {copy.uploadGuide}
                  </button>
                </div>
                {guideMode === 'draw' ? (
                  <TaskGapGuide
                    key={sourceRevision}
                    source={source?.canvas ?? null}
                    label={copy.drawLabel}
                    hint={copy.drawHint}
                    clearLabel={copy.clearGuide}
                    errorLabel={copy.errors['canvas-export']}
                    onChange={changeDrawnGuide}
                  />
                ) : (
                  <TaskImagePicker
                    key={sourceRevision}
                    value={markedGuide}
                    onChange={changeMarkedGuide}
                    label={copy.guideLabel}
                    previewLabel={copy.guidePreview}
                    copy={copy}
                  />
                )}
                {guideMode === 'draw' && drawnGuide && (
                  <p role="status" className="mt-3 text-sm">
                    {copy.guideReady}
                  </p>
                )}
                <p className="text-paper-muted mt-5 text-sm leading-6">
                  {copy.guideNote}
                </p>
              </section>
            )}
          </div>
        </div>
        <div className="border-paper-line border-t pt-7">
          <label htmlFor={`${id}-model`} className="text-sm font-semibold">
            {copy.modelLabel}
          </label>
          <select
            id={`${id}-model`}
            value={settings.modelOption}
            onChange={(event) =>
              setSettings({
                ...settings,
                modelOption: event.target.value as AgentModelOptionValue,
              })
            }
            className="border-paper-line bg-paper-panel mt-2 block min-h-11 max-w-full rounded-lg border px-3 py-2 text-sm"
          >
            {AGENT_MODEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} · {option.credits} {copy.creditsUnit}
              </option>
            ))}
          </select>
          <p className="text-paper-muted mt-3 max-w-3xl text-sm leading-6">
            {copy.aiNote}
          </p>
          <button
            type="submit"
            className="bg-vermilion mt-5 min-h-12 rounded-full px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? copy.aiBusy : copy.aiAction}
          </button>
        </div>
      </fieldset>
      <form.Subscribe selector={(state) => state.errors}>
        {(errors) =>
          errors.length ? (
            <p role="alert" className="text-vermilion mt-4 text-sm">
              {copy.errors['input-too-long']}
            </p>
          ) : null
        }
      </form.Subscribe>
      {error && (
        <p role="alert" className="text-vermilion mt-4 text-sm">
          {error}
        </p>
      )}
      {needsSignIn && (
        <div
          role="status"
          className="border-paper-line mt-5 max-w-2xl rounded-xl border p-4"
        >
          <p className="text-paper-muted text-sm leading-6">
            {copy.signInHint}
          </p>
          <Link
            href="/sign-in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-vermilion mt-3 inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
          >
            {copy.signIn}
          </Link>
        </div>
      )}
    </form>
  );
}
