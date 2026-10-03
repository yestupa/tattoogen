import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AuthShell } from './auth-shell';
import { BrandArtwork } from './brand-artwork';
import { PageHeading } from './page-heading';
import { PageState } from './page-state';

describe('shared visual system components', () => {
  it('renders the original tattoo artwork as decorative by default', () => {
    const html = renderToStaticMarkup(<BrandArtwork />);
    expect(html).toContain('data-brand-artwork="tattoo-generator"');
    expect(html).toContain('aria-hidden="true"');
  });

  it('exposes artwork to assistive technology only with an explicit label', () => {
    const html = renderToStaticMarkup(
      <BrandArtwork label="Botanical tattoo flash" />
    );
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Botanical tattoo flash"');
    expect(html).not.toContain('aria-hidden="true"');
  });

  it('gives authentication content a single main landmark', () => {
    const html = renderToStaticMarkup(
      <AuthShell
        eyebrow="Tattoo Generator"
        title="Welcome back"
        benefits={['Private by design']}
      >
        <form aria-label="Sign in">
          <button>Continue</button>
        </form>
      </AuthShell>
    );
    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html).toContain('Welcome back');
    expect(html).toContain('Private by design');
    expect(html).toContain('aria-label="Sign in"');
    expect(html).toContain('Continue');
  });

  it('renders reusable heading copy and an optional action', () => {
    const html = renderToStaticMarkup(
      <PageHeading
        eyebrow="Your workspace"
        title="Library"
        description="Saved designs"
        action={<button>Upload</button>}
      />
    );
    expect(html).toContain('Your workspace');
    expect(html).toContain('Library');
    expect(html).toContain('Saved designs');
    expect(html).toContain('Upload');
  });

  it('renders status copy and both supplied action slots', () => {
    const html = renderToStaticMarkup(
      <PageState
        variant="not-found"
        code="404"
        title="Lost in the ink"
        description="Try another path"
        detail="Check the address"
        primaryAction={<a href="/">Home</a>}
        secondaryAction={<button>Back</button>}
      />
    );
    expect(html).toContain('404');
    expect(html).toContain('Lost in the ink');
    expect(html).toContain('Try another path');
    expect(html).toContain('Check the address');
    expect(html).toContain('Home');
    expect(html).toContain('Back');
  });

  it('announces loading while preserving readable status copy', () => {
    const html = renderToStaticMarkup(
      <PageState
        variant="loading"
        title="Loading designs"
        description="Please wait"
      />
    );
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain('aria-busy="true"');
    expect(html).toContain('Loading designs');
  });

  it.each([
    { variant: 'empty', iconClass: 'lucide-inbox' },
    { variant: 'forbidden', iconClass: 'lucide-shield' },
    { variant: 'error', iconClass: 'lucide-circle-alert' },
  ] as const)(
    'renders the $variant state with its copy and decorative icon',
    ({ variant, iconClass }) => {
      const html = renderToStaticMarkup(
        <PageState
          variant={variant}
          title={`${variant} title`}
          description={`${variant} description`}
        />
      );
      expect(html).toContain(`${variant} title`);
      expect(html).toContain(`${variant} description`);
      expect(html).toContain(iconClass);
      expect(html).toContain('aria-hidden="true"');
      expect(html).not.toContain('aria-busy="true"');
    }
  );

  it('replaces the default icon with supplied artwork', () => {
    const html = renderToStaticMarkup(
      <PageState
        variant="empty"
        title="No saved designs"
        description="Create your first design"
        artwork={<svg role="img" aria-label="Custom tattoo flash" />}
      />
    );
    expect(html).toContain('aria-label="Custom tattoo flash"');
    expect(html.match(/<svg\b/g)).toHaveLength(1);
    expect(html).not.toContain('lucide-inbox');
  });
});
