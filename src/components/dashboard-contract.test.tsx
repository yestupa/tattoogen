import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { DataTable } from './data-table';

// Frozen after comparison against c9116ef46ba61c89a95fa61db5725750579ea764.
// Keep this visual-only change from altering requests, guards or event wiring.
// Stored fingerprints make the contract usable without Git history or subprocesses.
const baseline: Record<string, string> = {
  'src/routes/settings/index.tsx':
    '2c7b9fbbd8969ea7ef2b9f76e5ec7fa64cea5c4be072b33ce609545d567d710c',
  'src/routes/settings/-settings-form.tsx':
    '4fb7437047891c53166a29f10ab79817a742770a5d323bf31efb35ad05625005',
  'src/routes/settings/billing.tsx':
    '7b8824a77dd314c43d879f80ea1ca47b3b28b2aadb183d35242e54b15d6a9207',
  'src/routes/settings/credits.tsx':
    '2c844f78b1c13e209ccb1096ba6c25a3d891ce5ff1fb5fcdaae9a1c3ccb2e495',
  'src/routes/settings/payments.tsx':
    '880345eabb131ca1182a05e8f74d7b85e109aeef1f84a459f1f9cb1f4cbec951',
  'src/routes/settings/apikeys.tsx':
    '7d518fb90ed3b2afdcc91499226c530cbdc3c87baff4a6b82747520b6e4f940e',
  'src/routes/settings/tickets.tsx':
    '1d2888cbc9b0682e2ad5f09e2c0900452091d04b65d760801c3a90829aa00f70',
  'src/routes/admin/index.tsx':
    '7df86f105f77f3b202be50a5c8a2771bd5ec591d9271592926a6358e23733185',
  'src/routes/admin/users.tsx':
    '1fad2b10fb4545da2500fb94832484082af408d34b4aefbcd55ecc72e9988506',
  'src/routes/admin/invite-codes.tsx':
    'c59428cd005f1e03b7769875964a410f1f1ed3297bd769c078f975a123cb9879',
  'src/routes/admin/roles.tsx':
    '4d2a9ab2fd968eb9bc5a5b56a08af9de1586658a93bd5b4f4af290d61229d711',
  'src/routes/admin/permissions.tsx':
    '32e0bd5ad6099bfcb5b28ebd7456648e3475ca298ab2f3982dd42e71493b24e4',
  'src/routes/admin/payments.tsx':
    'c609dd1cb42d5ded293de8b4e340356d323e13f9929f9005b32860526923de97',
  'src/routes/admin/subscriptions.tsx':
    'd703908b55d8a6abd9e7f955886ee5b23b705637de44562812686e598047c40d',
  'src/routes/admin/credits.tsx':
    'e29060b1f8a4ea72134051ff364c1b92150c884d29a487d763ba130e13b9d8d2',
  'src/routes/admin/categories.tsx':
    '489e7d2363eb8c2287cc0454746b0b0821c338a26e34d6205d76ae6239d3a221',
  'src/routes/admin/posts.tsx':
    '51f11419dcd47ccec657cefd3a99a22cec5e3759a55103b20c681a7a1e726fc0',
  'src/routes/admin/chats.tsx':
    'c2b6090c580385d3bd18de2ce0ea9f1bff1cac4509050984cd422b26b2e89f87',
  'src/routes/admin/tickets.tsx':
    '57972ee1018a12be82d833d6baaa12db5a09519da3b98a0e982486526a439155',
  'src/routes/admin/settings.tsx':
    '0269eef58ceae50040ecd8ffadc022afea82abeea46c3ee16dc7f6e686cbf7f6',
  'src/routes/settings/profile.tsx':
    'f5a006cffe50c3d844ca6eda7a546e652f506ccbc7e6acf3adfd163d83211c3d',
  'src/routes/settings/route.tsx':
    'd97a8702bf3d07f2c368bf7fd851a17544f60db1bf39f0f27c70a6b2adac5e90',
  'src/routes/admin/route.tsx':
    '590cdab09054d7e0a4b296e75f6c8ee8d66bd04090124ff475721f042846a9b3',
  'src/components/app-layout.tsx':
    'bc80023c15bcddb48bc6060515bcfc0f038ba066379839675ffcf4e118785e5f',
  guard: 'a19c0b07beeb6b169126979ad72419a293629b676c82599541576c974ac20832',
  'src/components/app-sidebar.tsx':
    '4e3c36ac974faa567a667396d619b887a4d024faeed9c0398e5e0edf92afa147',
  'src/components/user-menu.tsx':
    'bd928c2e7a158cde5f4d18836e0ed974e804481d85a4561e593ba6aa9ee427ea',
};
const fingerprint = (value: string) =>
  createHash('sha256').update(value).digest('hex');

it('changes only the three permissions toast fallback labels in the frozen behavior', () => {
  const text = readFileSync('src/routes/admin/permissions.tsx', 'utf8');
  const label = /m\[['"]common\.action\.failed['"]\]\(\)/g;
  expect(text.match(label)).toHaveLength(3);
  // Restoring only approved copy yields the original complete query/mutation,
  // payload, callbacks and action-wiring fingerprint. No validator is relaxed.
  expect(
    fingerprint(JSON.stringify(behavior(text.replace(label, "'Failed'"))))
  ).toBe('4635c851277fa3c2d09594602532e9bab998265d00c57ae620cf550a85b3ec76');
});
const settings = [
  'index',
  '-settings-form',
  'billing',
  'credits',
  'payments',
  'apikeys',
  'tickets',
];
const admin = [
  'index',
  'users',
  'invite-codes',
  'roles',
  'permissions',
  'payments',
  'subscriptions',
  'credits',
  'categories',
  'posts',
  'chats',
  'tickets',
  'settings',
];
const pages = [
  ...settings.map((name) => `src/routes/settings/${name}.tsx`),
  ...admin.map((name) => `src/routes/admin/${name}.tsx`),
];
const source = (path: string) => readFileSync(path, 'utf8');

function behavior(text: string) {
  const file = ts.createSourceFile(
    'component.tsx',
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const printer = ts.createPrinter({ removeComments: true });
  const found: string[] = [];
  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      /^(api(Get|Post|Patch|Put|Delete)|use(Query|Mutation|Form|Session|UserPermissions)|createFileRoute|pageQuery)$/.test(
        node.expression.getText(file)
      )
    ) {
      found.push(printer.printNode(ts.EmitHint.Unspecified, node, file));
    }
    if (
      ts.isJsxAttribute(node) &&
      /^(onClick|onSubmit|onChange|onOpenChange|disabled|enabled|loading|onPageChange|onSearchChange|rowKey|render)$/.test(
        node.name.getText(file)
      ) &&
      node.initializer
    ) {
      found.push(
        printer.printNode(ts.EmitHint.Unspecified, node.initializer, file)
      );
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
}

type CriticalSources = Record<'menu' | 'layout' | 'admin' | 'settings', string>;

// Structural checks supplement the broad fingerprints. They accept formatting
// changes and inspect the actual handler/prop AST, without running side effects.
function validateCriticalBehavior(sources: CriticalSources): string[] {
  const parse = (text: string) =>
    ts.createSourceFile(
      'contract.tsx',
      text,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );
  const nodes = (root: ts.Node): ts.Node[] => {
    const result: ts.Node[] = [];
    const visit = (node: ts.Node) => {
      result.push(node);
      ts.forEachChild(node, visit);
    };
    visit(root);
    return result;
  };
  const namedFunction = (file: ts.SourceFile, name: string) =>
    nodes(file).find(
      (node): node is ts.FunctionDeclaration =>
        ts.isFunctionDeclaration(node) && node.name?.text === name
    );
  const expressionName = (node: ts.Expression): string | undefined => {
    if (ts.isIdentifier(node)) return node.text;
    if (ts.isPropertyAccessExpression(node))
      return `${expressionName(node.expression)}.${node.name.text}`;
    return undefined;
  };
  const call = (
    node: ts.Node,
    name: string,
    _file: ts.SourceFile
  ): node is ts.CallExpression =>
    ts.isCallExpression(node) && expressionName(node.expression) === name;
  const stringValue = (node: ts.Node | undefined, value: string) =>
    !!node && ts.isStringLiteral(node) && node.text === value;
  const violations: string[] = [];
  const menu = parse(sources.menu);
  const signOut = namedFunction(menu, 'handleSignOut');
  const statements = signOut?.body?.statements ?? [];
  const awaitedIndex = statements.findIndex(
    (node) =>
      ts.isExpressionStatement(node) &&
      ts.isAwaitExpression(node.expression) &&
      call(node.expression.expression, 'signOut', menu)
  );
  const redirectIndex = statements.findIndex(
    (node) =>
      ts.isExpressionStatement(node) &&
      call(node.expression, 'router.push', menu) &&
      stringValue(node.expression.arguments[0], '/')
  );
  if (
    awaitedIndex < 0 ||
    redirectIndex <= awaitedIndex ||
    !signOut?.modifiers?.some(
      (node) => node.kind === ts.SyntaxKind.AsyncKeyword
    )
  )
    violations.push('sign-out-await');
  const gatedProfile = nodes(menu).some(
    (node) =>
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken &&
      ts.isIdentifier(node.left) &&
      node.left.text === 'profileHref' &&
      nodes(node.right).some(
        (child) =>
          call(child, 'localizeHref', menu) &&
          child.arguments.length === 1 &&
          ts.isIdentifier(child.arguments[0]) &&
          child.arguments[0].text === 'profileHref'
      )
  );
  if (!gatedProfile) violations.push('profile-gate');
  const admin = parse(sources.admin);
  const gatedAdmin = nodes(admin).some(
    (node) =>
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText(admin) === 'AppLayout' &&
      node.attributes.properties.some(
        (attribute) =>
          ts.isJsxAttribute(attribute) &&
          attribute.name.getText(admin) === 'requirePermission' &&
          stringValue(attribute.initializer, 'admin.*')
      )
  );
  if (!gatedAdmin) violations.push('admin-permission');
  const layout = parse(sources.layout);
  const parameter = namedFunction(layout, 'AppLayout')?.parameters[0];
  const defaultRedirect =
    parameter &&
    ts.isObjectBindingPattern(parameter.name) &&
    parameter.name.elements.some(
      (element) =>
        ts.isIdentifier(element.name) &&
        element.name.text === 'unauthorizedRedirect' &&
        stringValue(element.initializer, '/settings')
    );
  if (!defaultRedirect) violations.push('unauthorized-default');
  const settings = parse(sources.settings);
  const save = namedFunction(settings, 'handleSave');
  const saveNodes = save ? nodes(save) : [];
  const declaredPayload = saveNodes.some(
    (node) =>
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'toSave' &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
  );
  const populatedPayload = saveNodes.some(
    (node) =>
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isElementAccessExpression(node.left) &&
      ts.isIdentifier(node.left.expression) &&
      node.left.expression.text === 'toSave' &&
      expressionName(node.left.argumentExpression) === 's.name' &&
      ts.isElementAccessExpression(node.right) &&
      expressionName(node.right.expression) === 'configs' &&
      expressionName(node.right.argumentExpression) === 's.name'
  );
  const submittedPayload = saveNodes.some(
    (node) =>
      call(node, 'saveMutation.mutate', settings) &&
      node.arguments.length === 1 &&
      ts.isIdentifier(node.arguments[0]) &&
      node.arguments[0].text === 'toSave'
  );
  if (!declaredPayload || !populatedPayload || !submittedPayload)
    violations.push('save-payload');
  return violations;
}

const criticalSources = (): CriticalSources => ({
  menu: source('src/components/user-menu.tsx'),
  layout: source('src/components/app-layout.tsx'),
  admin: source('src/routes/admin/route.tsx'),
  settings: source('src/routes/admin/settings.tsx'),
});

describe('critical dashboard behavior structure', () => {
  it('accepts the actual source without executing requests', () => {
    expect(validateCriticalBehavior(criticalSources())).toEqual([]);
  });

  it('accepts equivalent formatting rather than requiring a fixed hash', () => {
    const originals = criticalSources();
    const formatted = {
      ...originals,
      menu: originals.menu.replace('await signOut();', 'await   signOut( );'),
      settings: originals.settings.replace(
        'configs[s.name]',
        'configs[ s . name ]'
      ),
    };
    expect(validateCriticalBehavior(formatted)).toEqual([]);
  });

  it.each([
    ['menu', 'await signOut();', '', 'sign-out-await'],
    ['menu', 'profileHref && (', 'true && (', 'profile-gate'],
    ['admin', 'requirePermission="admin.*"', '', 'admin-permission'],
    [
      'layout',
      "unauthorizedRedirect = '/settings'",
      "unauthorizedRedirect = '/'",
      'unauthorized-default',
    ],
    [
      'settings',
      'saveMutation.mutate(toSave)',
      'saveMutation.mutate({})',
      'save-payload',
    ],
  ] as const)(
    'rejects the in-memory %s mutation: %s',
    (key, before, after, violation) => {
      const originals = criticalSources();
      const mutated = originals[key].replace(before, after);
      expect(mutated).not.toBe(originals[key]);
      expect(
        validateCriticalBehavior({ ...originals, [key]: mutated })
      ).toContain(violation);
    }
  );
});

describe('dashboard visual and behavior contracts', () => {
  it('scopes indirect portal dialogs to the authenticated workspace', () => {
    const layout = source('src/components/app-layout.tsx');
    expect(layout).toContain('data-app-workspace');
    expect(layout).toContain('body:has([data-app-workspace])');
    expect(layout).toContain('[data-slot="dialog-content"] :is(button, a)');
    expect(layout).toContain('min-height: 44px');
    expect(layout).toContain('min-width: 44px');
    expect(layout).toContain('display: inline-flex');
    expect(layout).toContain(':focus-visible');
    expect(source('src/routes/settings/credits.tsx')).toContain(
      '<CreditTopUpDialog'
    );
    expect(source('src/routes/admin/settings.tsx')).toContain(
      '<SettingsTestDialog'
    );
  });
  it.each(pages)('reuses the page heading on %s', (path) => {
    expect(source(path)).toContain('<PageHeading');
    expect(source(path)).not.toContain('<h1');
  });

  it.each([
    ...pages,
    'src/routes/settings/profile.tsx',
    'src/routes/settings/route.tsx',
    'src/routes/admin/route.tsx',
    'src/components/app-layout.tsx',
    'src/components/app-sidebar.tsx',
    'src/components/user-menu.tsx',
  ])(
    'preserves query, mutation, permission and action wiring in %s',
    (path) => {
      expect(fingerprint(JSON.stringify(behavior(source(path))))).toBe(
        baseline[path]
      );
    }
  );

  it('keeps authorization resolution and redirect effects unchanged', () => {
    const current = source('src/components/app-layout.tsx');
    const guards = (text: string) =>
      text
        .slice(
          text.indexOf('const { data: session'),
          text.indexOf('if (isPending || !authorized')
        )
        .replace(/\s+/g, ' ');
    expect(fingerprint(guards(current))).toBe(baseline.guard);
  });

  it('contains the viewport and uses a branded loading state', () => {
    const layout = source('src/components/app-layout.tsx');
    expect(layout).toContain('h-svh');
    expect(layout).toContain('overflow-y-auto');
    expect(layout).toContain('overflow-x-hidden');
    expect(layout).toContain('<BrandArtwork');
    expect(layout).toContain('mobileBrand || brand');
    expect(layout).toContain('bg-background');
    expect(layout.match(/<main\b/g)).toHaveLength(1);
  });

  it('gives navigation and user menu accessible touch targets and purple active states', () => {
    const sidebar = source('src/components/app-sidebar.tsx');
    expect(sidebar).toContain('data-[active=true]:bg-primary');
    expect(sidebar).toContain('min-h-11');
    expect(sidebar).toContain('bg-sidebar');
    const menu = source('src/components/user-menu.tsx');
    expect(menu).toContain('min-h-11');
    expect(menu).toContain('aria-label={name}');
    expect(menu).toContain('focus-visible');
  });

  it('keeps table pagination controlled and localizes horizontal overflow', () => {
    const table = source('src/components/data-table.tsx');
    expect(table).toContain('manualPagination: true');
    expect(table).toContain('rowCount: total');
    expect(table).toContain('onPageChange(page - 1)');
    expect(table).toContain('onPageChange(page + 1)');
    expect(table).toContain('rounded-2xl border');
    expect(table).toContain('overflow-x-auto');
    expect(table).toContain('min-w-0');
    expect(table).toContain('<PageState');
    expect(table).toContain('data-table-skeleton');
  });

  it('renders loading rows instead of announcing an empty table', () => {
    const html = renderToStaticMarkup(
      <DataTable
        columns={[{ header: 'Name', cell: (row: { id: string }) => row.id }]}
        data={[]}
        total={0}
        page={1}
        pageSize={10}
        onPageChange={() => {}}
        rowKey={(row) => row.id}
        loading
        emptyText="Empty fixture"
      />
    );
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('data-table-skeleton');
    expect(html).not.toContain('Empty fixture');
  });

  it('renders empty copy with a secondary heading and keeps cells unchanged', () => {
    const props = {
      columns: [
        {
          header: 'Name',
          cell: (row: { id: string }) => <button>{row.id}</button>,
        },
      ],
      total: 0,
      page: 1,
      pageSize: 10,
      onPageChange: () => {},
      rowKey: (row: { id: string }) => row.id,
    };
    const empty = renderToStaticMarkup(
      <DataTable {...props} data={[]} emptyText="Empty fixture" />
    );
    expect(empty).toContain('<h2');
    expect(empty).not.toContain('<h1');
    expect(empty).toContain('Empty fixture');
    const populated = renderToStaticMarkup(
      <DataTable {...props} data={[{ id: 'Fixture row' }]} />
    );
    expect(populated).toContain('Fixture row');
    expect(populated).toContain('<button');
  });

  it('keeps previously loaded rows and actions visible when a refresh fails', () => {
    const html = renderToStaticMarkup(
      <DataTable
        columns={[
          {
            header: 'Name',
            cell: (row: { id: string }) => <button>{row.id}</button>,
          },
        ]}
        data={[{ id: 'Retained fixture row' }]}
        total={1}
        page={1}
        pageSize={10}
        onPageChange={() => {}}
        rowKey={(row) => row.id}
        error="Fixture refresh failed"
      />
    );
    expect(html).toContain('Retained fixture row');
    expect(html).toContain('<button>Retained fixture row</button>');
    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('Fixture refresh failed');
    expect(html.indexOf('Fixture refresh failed')).toBeLessThan(
      html.indexOf('<table')
    );
    expect(html).not.toContain('aria-busy="true"');
    expect(html).not.toContain('data-table-skeleton');
    expect(html).not.toContain('<h1');
  });

  it('bounds invite dialogs and keeps growing content locally scrollable', () => {
    const invite = source('src/routes/admin/invite-codes.tsx');
    for (const dialog of invite.matchAll(/<DialogContent\b[^>]*>/g)) {
      expect(dialog[0]).toContain('max-h-[calc(100dvh-2rem)]');
      expect(dialog[0]).toContain('overflow-y-auto');
    }
  });

  it('renders an error state when the initial table request fails', () => {
    const html = renderToStaticMarkup(
      <DataTable
        columns={[{ header: 'Name', cell: (row: { id: string }) => row.id }]}
        data={[]}
        total={0}
        page={1}
        pageSize={10}
        onPageChange={() => {}}
        rowKey={(row) => row.id}
        error="Fixture request failed"
      />
    );
    expect(html).toContain('Fixture request failed');
    expect(html).toContain('lucide-circle-alert');
    expect(html).not.toContain('<h1');
  });

  it.each(pages.filter((path) => source(path).includes('<DialogContent')))(
    'keeps portal dialog controls touch-sized in %s',
    (path) => {
      for (const dialog of source(path).matchAll(/<DialogContent\b[^>]*>/g)) {
        expect(dialog[0]).toContain('[&_button]:min-h-11');
        expect(dialog[0]).toContain('rounded-2xl');
      }
    }
  );
});
