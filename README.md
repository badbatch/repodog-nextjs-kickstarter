# Repodog Next.js Kickstarter

An opinionated Next.js application starter for customer-facing applications, internal tools and administration interfaces. It includes Mantine, seven next-box packages, typed browser/server API clients, NextAuth authentication, policy-based access and a real Docker browser-test suite. It works with [repodog-dotnet-kickstarter](https://github.com/badbatch/repodog-dotnet-kickstarter) through a defined API contract; a different backend can implement that contract too.

## Install

Install the versions in `.tool-versions` with mise, then install dependencies:

```sh
mise install
pnpm install --frozen-lockfile
cp .env.example .env.local
openssl rand -base64 32
```

Put the generated value in `AUTH_SECRET` in `.env.local`. Set `KICKSTARTER_SERVER__API__BASE_URL` to the backend URL; its local default is `http://localhost:8080`. `KICKSTARTER_BFF__BASE_URL` defaults to `/api`. The backend address is server-only; the browser calls the BFF.

## Run

Start the sibling .NET API using its README, or start another backend implementing the contract below:

```sh
pnpm dev
```

Open <http://localhost:3000>. Register an account through the API, then sign in at `/login`. The .NET starter can seed an account with the `ExampleUser` role using `BOOTSTRAP_USER_EMAIL` and `BOOTSTRAP_USER_PASSWORD`. All authenticated users can open `/` and load the API example; `/restricted` additionally requires `ExampleAccess`.

For a production build, run `pnpm build` followed by `pnpm start`. The build copies public assets into Next.js's standalone output. `predev` and `prebuild` automatically run all generators.

For component development, run `pnpm storybook` and open <http://localhost:6006>. Use `pnpm build-storybook` to export it.

## Test and validate

| Command                 | What it runs                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `pnpm validate`         | Dependency consistency, build, code/style/Markdown lint, formatting, types and unit tests with coverage. |
| `pnpm test`             | Jest unit tests and coverage.                                                                            |
| `pnpm test:integration` | Server API-client/BFF integration tests using a local HTTP server; no .NET process is started.           |
| `pnpm test:e2e:docker`  | Builds the real frontend and .NET API, starts disposable SQL Server/accounts, then runs Playwright.      |
| `pnpm test:e2e:ui`      | Interactive Playwright; requires a compatible API and configured test accounts.                          |

For Docker E2E, place the kickstarters beside one another and run `pnpm test:e2e:docker`. Docker is required; local account passwords and browser installation are not. Set `E2E_API_CONTEXT` to override the default `../repodog-dotnet-kickstarter` checkout. The runner removes the stack and volumes afterwards and retains `playwright-report/` and `test-results/`.

For browser tests against a running API, set `E2E_API_URL`, `E2E_PRIVILEGED_EMAIL`, `E2E_PRIVILEGED_PASSWORD`, `E2E_USER_EMAIL` and `E2E_USER_PASSWORD`. The privileged account needs `ExampleAccess`; the ordinary account must not have it. By default Playwright starts the frontend on port 3100. Set `E2E_BASE_URL` to test an already-running frontend instead. Tests expect English content.

The browser suite covers sign-in, ordinary authenticated access, policy denial, sign-out, session expiry, session-token privacy and a complete browser → BFF → backend request. New tests use When/then names and Arrange/Act/Assert sections.

## Structure and coding patterns

| Location                                | Responsibility                                                         |
| --------------------------------------- | ---------------------------------------------------------------------- |
| `app/`                                  | App Router pages, layouts, server actions and BFF route handlers.      |
| `app/(authenticated)/`                  | Pages that require sign-in; the group name is omitted from URLs.       |
| `app/_components/AppProviders.tsx`      | Shared client providers and navigation integration.                    |
| `components/`                           | Reusable UI, colocated styles, stories and tests.                      |
| `content/`                              | Localized UI text, formatting and Markdown component mapping.          |
| `appSettings/`, `config/`               | Typed configuration schema, defaults, hooks and JSON overrides.        |
| `libs/ApiClient/`                       | Browser API provider/hooks and server API-client middleware.           |
| `server/auth/`, `server/middleware/`    | Authentication configuration, credentials provider and BFF middleware. |
| `server/httpClient/`, `bff/httpClient/` | Generated backend and browser clients; do not edit these by hand.      |
| `e2e/`, `__testUtils__/`                | Browser scenarios and reusable test support.                           |

Use Server Components for server work and add `'use client'` where interaction requires it. Keep credentials and backend calls in server code. The `#` import alias resolves from the repository root. Put display text in `content/`, reuse named exports and colocate component-specific CSS rather than scattering global styles.

Mantine's shared theme lives in [theme.ts](theme.ts). Customize colors, typography, spacing and component defaults there. The app and Storybook both use that theme. Storybook provides light/dark controls and a keyboard toggle; the sample color-scheme component demonstrates application switching. Repodog ESLint, Prettier, Stylelint, TypeScript and test configurations enforce the repository's coding conventions.

## next-box packages

The packages are already connected in [AppProviders.tsx](app/_components/AppProviders.tsx) and the root layout. Add application configuration to those integration points rather than creating a second provider stack.

### `@next-box/appsettings`: typed runtime configuration

[appSettings/schema.ts](appSettings/schema.ts) defines the Zod schema. [appSettings/index.ts](appSettings/index.ts) combines defaults, JSON configuration from `config/` and prefixed environment variables. Environment overrides use double underscores for nesting:

```dotenv
KICKSTARTER_SERVER__API__BASE_URL=http://localhost:8080
KICKSTARTER_SERVER__AUTH__SESSION_MAX_AGE_SECONDS=28800
KICKSTARTER_BFF__BASE_URL=/api
```

Server code calls `await loadAppSettings()`. Client components use the typed hook factories exported by [appSettings/hooks.ts](appSettings/hooks.ts):

```tsx
import { useAppSettingsOrThrow } from '#appSettings/hooks.ts';

const bffSettings = useAppSettingsOrThrow('Bff');
```

The root layout calls `getClientAppSettings` before passing settings to the browser. The exact root `Server` section is removed from the client snapshot and unavailable through client hook types. Put private backend/auth configuration under that section; other root sections are public. After changing the schema, run `pnpm appsettings:types` or `pnpm generate` to refresh declarations.

### `@next-box/envs`: public environment values

`getPublicEnvs(process.env)` supplies the root `EnvsProvider`, and `PublicEnvVarsScript` exposes public values to code outside React. Read them with `useEnvs()` in components or `getEnv` in the existing content initialization. Only public values belong in this path; structured settings and server-only values belong in appsettings.

`NEXT_PUBLIC_LANGUAGE_CODE` selects the starter's content language. This provider/script approach makes public runtime values available to the rendered application rather than scattering direct environment access throughout components.

### `@next-box/feature-flags`: UI feature switches

Add definitions to [featureFlags.config.ts](featureFlags.config.ts) and custom client filters to [clientFilters.ts](clientFilters.ts). Both arrays start empty. For example:

```ts
export const featureFlags = [{ name: 'NEW_DASHBOARD', enabled: false }];
```

In a client component, `useFeature('NEW_DASHBOARD')` returns whether it is enabled; the package also provides a `Feature` component for conditional rendering. Conditions can use registered client filters. The configuration model follows .NET feature-management concepts, but frontend and backend flags are configured independently: no synchronization is installed. UI flags do not replace API authorization.

### `@next-box/i18n`: content and localization

[content/index.ts](content/index.ts) selects `en`, `fr`, `de` or `es`, falls back to English and exports `t`, `tt` and the matching date-fns locale. Add keys to the language content files and use the typed resolver:

```tsx
import { tt } from '#content/index.ts';

const label = tt('actions.signOut');
```

`tt` checks content paths and throws for missing content; `t` supports dynamic paths and can return `undefined`. Both support template values. `I18nProvider` and [componentMapper.tsx](content/componentMapper.tsx) support rendering mapped Markdown content. Language selection is configuration-based; this starter does not include a user-facing language picker, and example text still needs translation review.

### `@next-box/breadcrumb`: route-aware breadcrumbs

[routeRules.ts](routeRules.ts) maps route patterns to labels. `BreadcrumbProvider` tracks the current pathname/search and exposes breadcrumb data through `useBreadcrumb()`. [BreadcrumbNavigation.tsx](app/_components/BreadcrumbNavigation.tsx) renders it with Mantine.

Add or refine a route rule when introducing a page whose label cannot be derived from its URL, especially detail pages that should display a resource name. Keep route-specific labeling in the rules rather than duplicating it in individual page components.

### `@next-box/link-extra`: consistent navigation

`LinkProvider` combines Next.js navigation with Mantine `Anchor` and the shared loading indicator. Use the package's `Link` for navigation that should participate in those behaviors. The provider uses a 500 ms loading threshold, so short transitions do not flash a loading bar. The package also supports router-cache bypass through `disableRouterCache`; inspect that setting when deciding whether a route should reuse client navigation state.

### `@next-box/route-handler`: typed BFF middleware

[createApiHandler.ts](server/createApiHandler.ts) uses the package's handler factory and middleware composition to supply typed context to BFF handlers. The chain adds request/correlation IDs, authenticates, optionally checks a policy, then supplies an authenticated backend client. These are route-handler middleware functions, separate from Next.js request interception conventions.

Start a protected route with `createApiHandler`; write shared request behavior as `createMiddleware` functions rather than repeating token handling in every route. Authentication calls use the server client directly because sign-in cannot depend on an authenticated BFF route.

## Getta and the two generated API clients

The request path is:

```text
Browser → generated BFF client → Next.js route handler → generated backend client → API
```

| Client         | Contract input                                                   | Generated output     | Consumer                                         |
| -------------- | ---------------------------------------------------------------- | -------------------- | ------------------------------------------------ |
| Backend/server | Root `openapi.json`, exported by the backend                     | `server/httpClient/` | Server auth and BFF handlers.                    |
| Browser/BFF    | `public/openapi.json`, generated from BFF routes and Zod schemas | `bff/httpClient/`    | `ApiProvider`, `useApiClient` and UI components. |

Getta supplies the HTTP client and `getta generate-client`. Run `pnpm generate` for the full sequence: appsettings declarations → backend client → BFF OpenAPI document → browser client. The individual commands are `generate-server-client`, `generate-bff-openapi-spec` and `generate-bff-client`. Generated directories/declarations are gitignored.

After changing the .NET API, export its development document and regenerate:

```sh
curl --fail http://localhost:8080/openapi/v1.json -o openapi.json
pnpm generate
```

For a BFF change, add the route and its response schema in [bff/schemas.ts](bff/schemas.ts), then add the `@response` annotation used by the existing example handlers. [openapi-gen.config.ts](openapi-gen.config.ts) controls route/schema discovery, error responses and the Scalar UI at `/api-docs`. The browser contract describes BFF operations, not the backend's full API.

[createServerApiClient.ts](server/createServerApiClient.ts) reads the private API base URL and creates the backend client. Outside authenticated middleware, pass authorization headers explicitly and provide a timeout signal where appropriate. [withApiClient.ts](libs/ApiClient/withApiClient.ts) adds the access token and IDs for protected BFF requests. Header factories resolve per outgoing request; explicit caller request IDs override the default generated ID.

Browser components use `useApiClient()` and `useApi(request, { onError })`. The latter supplies `execute`, loading/error/success state and a reset operation. Its error callback keeps navigation decisions in the consuming UI. A 403 becomes `ApiAccessError`; other HTTP statuses still need appropriate handling. See [ExamplePanel.tsx](components/ExamplePanel/ExamplePanel.tsx) for a working example.

To add an authenticated BFF operation, follow [the ordinary example route](app/api/example/route.ts). To add policy enforcement, follow [the restricted route](app/api/example/restricted/route.ts):

```ts
export const GET = createApiHandler({
  policy: EXAMPLE_ACCESS_POLICY,
  handler: async (_request, _routeContext, { apiClient }) => {
    const response = await apiClient.getRestrictedExample();
    return Response.json(response.data, { status: response.status });
  },
});
```

The complete example files include timeout and unavailable-service handling. Keep operation names stable in the backend OpenAPI document so client methods remain predictable.

## NextAuth authentication and authorization

The root [auth.ts](auth.ts) re-exports [server/auth/auth.ts](server/auth/auth.ts). The credentials provider has its own file under `server/auth/providers/`, and `/api/auth/[...nextauth]` exposes the public auth handlers.

1. The login action passes credentials to NextAuth.
2. The credentials provider calls `loginUser`, validates the token response and calls `getCurrentUser` with the bearer token.
3. The JWT callback stores API credentials and identity/role/policy information in the encrypted HttpOnly session cookie. It generates a correlation ID for the signed-in session.
4. When tokens approach expiry, the callback refreshes them and reloads `/users/me`. Failure clears API credentials and requires sign-in.
5. The public session callback exposes identity, roles, policies, correlation ID and auth errors. It does not expose access or refresh tokens to browser JavaScript.

The API's bearer tokens are opaque Identity tokens; NextAuth's session JWT is a separate format and responsibility. `AUTH_SECRET` protects the session. Configure the session lifetime through `Server.Auth.SessionMaxAgeSeconds` (default eight hours), refresh buffer through `Server.Auth.RefreshBufferSeconds` (30 seconds), and request timeout through `Server.Api.TimeoutMs` (10 seconds).

The authenticated route-group layout checks the session. The restricted page separately checks `ExampleAccess` and redirects to `/access-denied` when needed. The BFF's `withAuth` uses a private server-only session projection to obtain the access token and persist refreshed session cookies. `withPolicy` applies an optional route policy; the backend independently enforces its own policy. Return 401 for missing authentication and 403 for insufficient access.

Sign-out clears the NextAuth session. The API does not expose a revocation endpoint for already-issued bearer tokens. Registration and password recovery endpoints exist in the backend contract; this starter currently provides the login/access-denied UI, not finished registration/reset-password screens.

## Integration with the .NET kickstarter

The shared contract is:

| Endpoint                                               | Purpose                                                                                  |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `POST /api/v1/auth/register`                           | Create an ordinary account.                                                              |
| `POST /api/v1/auth/login`                              | Return `tokenType`, `accessToken`, `expiresIn` and `refreshToken`.                       |
| `POST /api/v1/auth/refresh`                            | Exchange a refresh token for replacement tokens.                                         |
| `GET /api/v1/users/me`                                 | Return `id`, `userName`, `email`, `roles` and satisfied resource-independent `policies`. |
| `POST /api/v1/auth/forgot-password`, `/reset-password` | Account recovery.                                                                        |
| `GET /api/v1/example`                                  | Example available to any authenticated account.                                          |
| `GET /api/v1/example/restricted`                       | Example requiring `ExampleAccess`, backed by the `ExampleUser` role.                     |

The backend role/policy definitions live in `AuthorizationPolicies.cs`; the frontend policy name lives in [libs/Auth/policies.ts](libs/Auth/policies.ts). When adding a policy, enforce it in the API, expose it through the current-user allowlist only if resource-independent, and apply the same name to relevant pages/BFF routes. Role changes become visible after token refresh; existing API tokens contain an identity snapshot.

The session correlation ID links browser/BFF/API activity. Browser requests receive a new request ID per call; the BFF forwards it to the backend. Direct server-client calls generate a new ID unless one is supplied. The .NET request middleware includes these values in its structured log scope.

## GitHub Actions

Each repository validates its own code before running the shared E2E workflow in this repository. The E2E job uses the caller's merge commit and tries the same source branch in the counterpart. If absent, it uses `E2E_API_FALLBACK_REF` here or `E2E_APP_FALLBACK_REF` in the API repository; unset variables use the counterpart's default branch. Checkout uses resolved commit SHAs.

Configure `CROSS_REPO_READ_TOKEN` in both callers with read-only Contents access to both repositories, and permit the API repository to call this repository's reusable workflow. The workflow must exist on the ref used by the API caller. Fork PRs do not receive repository secrets. Reports are uploaded as artifacts; E2E credentials and database state are disposable.

## Creating another application

[.repodog-bootstrap.json](.repodog-bootstrap.json) describes replacements, project paths and optional pairing for Repodog's app generator. Providing a counterpart retains the shared Docker/E2E setup. Omitting it generates independent validation and removes pair-specific Docker/E2E tooling; the Next.js app still needs a backend implementing its contract. Customization also updates package identity, configuration prefixes and repository references. Creating files does not automatically create commits or publish repositories.

### What the manifest does

[.repodog-bootstrap.json](.repodog-bootstrap.json) is the recipe used by `repodog new app` to turn this repository into a named application. The application does not read it at runtime. Maintain it alongside the starter's source files: changing a filename, namespace, workflow or text used by a replacement can require a manifest change too.

The generator downloads the configured GitHub revision, reads the manifest, prepares the application in a temporary directory and copies the completed result to a new destination. It omits the source `.git` directory and the manifest itself. The generated `.repodog-origin.json` records `repository`, requested `ref` and resolved `commit`. No dependency installation, Git initialization, commits or GitHub repository creation happen as part of materialization.

### Generate from this starter

```sh
repodog new app nextjs
```

Answer the application name, description and GitHub owner prompts. Supply the counterpart repository name to keep the paired setup, or leave it blank for independent validation. The CLI also supports configuration defaults and question overrides.

The default source is this starter's GitHub repository at `main`. To test a published branch, tag or commit containing manifest edits, set the source in a project or global `.repodogrc`:

```json
{
  "appBootstraps": {
    "nextjs": {
      "repository": "badbatch/repodog-nextjs-kickstarter",
      "ref": "your-template-branch"
    }
  }
}
```

Replace `your-template-branch` with an existing branch, tag or commit ref. Editing a local starter checkout does not change what the CLI downloads from GitHub. Use a revision containing your changes when testing through the command, and use the CLI's fixture tests for local generator development. Existing generated applications are not updated automatically.

### Manifest fields

| Field          | Required | Meaning                                                                                                                    |
| -------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `version`      | Yes      | Manifest format version. Currently `1`; this is not the application/package version.                                       |
| `files`        | Yes      | Exact UTF-8 file paths to process with the normal replacements. This is not a list of all files to copy.                   |
| `replacements` | Yes      | Ordered `{ "from": "literal source text", "to": "replacement template" }` rules applied to each listed file.               |
| `renamePaths`  | Yes      | Ordered `{ "from": "old/path", "to": "new/path/template" }` rules for files or directories.                                |
| `exclude`      | Yes      | Exact file or directory paths omitted from the generated application. Excluding a directory also excludes its descendants. |
| `whenMissing`  | No       | A map from variable name to additional exclusions and file-specific replacements, used when that value is absent or blank. |

Arrays can be empty. Paths are relative to the starter root and are literal paths, not glob patterns. Files not listed in `files` are still copied unless excluded; their contents are unchanged unless targeted by a conditional file replacement. Keep binary assets out of `files`.

### Variables and replacement syntax

The application generator supplies these values:

| Variable                | Source or default                                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `name`                  | Application repository/folder name, such as `my-app-ui`.                                                                |
| `description`           | The description answer, when supplied.                                                                                  |
| `owner`                 | GitHub owner answer.                                                                                                    |
| `repository`            | Derived `owner/name`.                                                                                                   |
| `counterpartRepository` | Optional other repository name; blank means standalone generation.                                                      |
| `counterpartPath`       | Derived `../counterpartRepository`, or an empty string when standalone.                                                 |
| `namespace`             | Explicit value or PascalCase `name`, such as `MyAppUi`.                                                                 |
| `configPrefix`          | Explicit value or uppercase `name` with hyphens changed to underscores and a trailing underscore, such as `MY_APP_UI_`. |

The existing Repodog `templateVariables` and `questionOverrides` configuration can provide defaults or additional answers. Custom values remain available to replacement templates. Definitions are selected under `new.app.nextjs` or `new.app.dotnet`, with an optional custom type path for more specific configuration.

Use `{{name}}` for a literal value. Use `{{description|json}}` when replacing an entire JSON string value: the generator adds quotes and escapes embedded quotes/newlines correctly. For example:

```json
{
  "from": "\"Starter description\"",
  "to": "{{description|json}}"
}
```

Do not surround `{{description|json}}` with another pair of JSON quotes in the generated content. Templates can reference variables, but they cannot execute JavaScript or shell commands. `from` is always literal text, not a regex. All occurrences are replaced, and rules run in array order; a later rule can match text produced by an earlier one.

### Next.js example

This reduced example illustrates package metadata and optional text customization. It is not a replacement for this repository's complete manifest:

```json
{
  "version": 1,
  "files": ["package.json", "README.md"],
  "replacements": [
    { "from": "starter-ui", "to": "{{name}}" },
    { "from": "STARTER_", "to": "{{configPrefix}}" },
    { "from": "\"Starter description\"", "to": "{{description|json}}" }
  ],
  "renamePaths": [],
  "exclude": []
}
```

The real recipe also customizes environment prefixes, branding, repository links and sibling build paths. When adding a new component with starter-specific text, add it to `files` only if that text needs replacement. When changing a workflow or this README, update matching conditional text rules too.

### Optional counterpart configuration

A `whenMissing` entry contains both an `exclude` array and a `fileReplacements` array. Each file replacement has `file`, `from` and `to` fields:

```json
{
  "whenMissing": {
    "counterpartRepository": {
      "exclude": ["paired-example.txt"],
      "fileReplacements": [
        {
          "file": "README.md",
          "from": "Use the paired example.",
          "to": "Configure your own compatible backend or frontend."
        }
      ]
    }
  }
}
```

This fragment illustrates the shape; use paths and text that actually exist in the starter. A provided counterpart leaves these omission rules inactive. A missing, empty or whitespace-only value activates them. Conditional replacements target their named file directly, even when it is not listed in `files`.

In this starter, `counterpartRepository` controls the paired E2E configuration and related documentation. Omitting it keeps the application's own validation workflow and removes cross-repository E2E dependencies. The Next.js application still expects the documented authentication/API contract; an independently hosted or non-.NET backend can implement it.

### Generation order

1. Read and validate the version-1 manifest.
2. Select applicable `whenMissing` entries and validate exclusion paths.
3. Copy the source, omitting `.git`, the manifest and all applicable exclusions; reject symbolic links.
4. Apply conditional `fileReplacements` to the copied files.
5. Apply normal `replacements` to the remaining files listed in `files`.
6. Apply `renamePaths` in order, then write `.repodog-origin.json`.
7. Copy into a new destination. An existing destination is refused; a partially created destination is removed on failure. Temporary files are cleaned up.

Paths used by replacement and rename operations must stay inside the application directory. Reference original filenames in `files` and conditional replacements because renaming happens afterwards. Rename child files before their parent directories. Do not leave rules targeting files removed by an exclusion.

### Editing and verifying the manifest

Manual edits are expected. They affect future generations from that GitHub revision, not applications already created. Commit and publish a verified manifest change together with the starter change it supports.

When changing the starter:

1. Add a text file to `files` if its contents need customization; leave ordinary copied files and binary assets out.
2. Update literal `from` text and original paths when renaming or rewriting starter files.
3. Keep `renamePaths` ordered from child files to parent directories.
4. Review `whenMissing`, especially workflow, package-script and README replacements, for both standalone and paired output.
5. Generate into fresh temporary destinations with a different name/owner/prefix/namespace. Exercise both a supplied and an omitted counterpart.
6. Inspect generated metadata, links, workflows and configuration, then run the generated application's install, build, validation and relevant E2E commands.

A missing file, invalid manifest, unresolved variable used by a replacement, unsafe path or symbolic link causes generation to fail. However, a valid literal `from` value that no longer appears in a file currently matches nothing silently. Runtime validation checks the structure and path rules; it cannot prove the resulting application is correct. Keep tests for generation behavior and verify actual generated applications after editing the recipe.

### Implementation and type definitions

The manifest contract belongs to the Repodog CLI. In the `repodog` repository:

- `cli/new/src/app/types.ts` defines `BootstrapManifest`, `BootstrapReplacement`, `BootstrapFileReplacement` and `BootstrapOmission`.
- `cli/new/src/app/generateApp.ts` collects answers, resolves variables, downloads the source and calls the materializer.
- `cli/new/src/app/getValidAppVariablesOrThrow.ts` resolves and validates application variable values.
- `cli/new/src/app/materializeApp/materializeApp.ts` coordinates generation; adjacent files implement copying, replacements, renaming and destination cleanup.
- `cli/new/src/app/materializeApp/loadValidBootstrapManifestOrThrow.ts` performs runtime manifest validation.

There is currently no published JSON Schema or `$schema` binding for editor completion. TypeScript definitions are checked when building the CLI; JSON files are checked by the CLI's runtime validator when generating an application. A syntactically valid JSON edit is not, by itself, evidence that a recipe will generate a working app.
