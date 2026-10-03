import { useId } from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';

import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

function fieldError(field: AnyFieldApi): string | null {
  if (!field.state.meta.isTouched) return null;
  const errs = field.state.meta.errors;
  if (!errs?.length) return null;
  const first = errs[0] as unknown;
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object' && 'message' in first) {
    return String((first as { message: unknown }).message);
  }
  return String(first);
}

// Standard text input wired to a TanStack Form field — label, value,
// blur/change handlers and first-error display in one component.
export function TextField({
  field,
  id,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  required,
  disabled,
  'aria-describedby': ariaDescribedBy,
}: {
  field: AnyFieldApi;
  id?: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  'aria-describedby'?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const error = fieldError(field);
  const errorId = `${inputId}-error`;
  const describedBy =
    [
      ...new Set(
        [
          ...(ariaDescribedBy?.split(/\s+/) ?? []),
          ...(error ? [errorId] : []),
        ].filter(Boolean)
      ),
    ].join(' ') || undefined;

  return (
    <Field>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <Input
        id={inputId}
        name={field.name}
        type={type}
        value={(field.state.value as string) ?? ''}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      {error && (
        <p id={errorId} className="text-destructive text-sm">
          {error}
        </p>
      )}
    </Field>
  );
}
