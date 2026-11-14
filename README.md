# Repodog Next.js Kickstarter

An opinionated application starter paired with [repodog-dotnet-kickstarter](../repodog-dotnet-kickstarter). It supports customer-facing applications, internal tools, and administration interfaces through the same authentication and policy conventions.

## Start the complete example

Check out the two repositories beside one another, install the versions in `.tool-versions` with mise, and install dependencies:

```sh
mise install
pnpm install --frozen-lockfile
pnpm test:e2e:docker
```

The Docker command builds the production application and real .NET API, starts a disposable SQL Server, creates a privileged example user and a regular user, and runs Chromium tests. It removes the test stack afterwards and retains `playwright-report/` and `test-results/`. It needs Docker, but no local test passwords or browser installation. Use `E2E_API_CONTEXT` to point at a different API checkout.

## Local development

Start the sibling API using its Compose instructions. Copy `.env.example` to `.env.local`, set a unique `AUTH_SECRET`, then run:

```sh
pnpm dev
```

The application is at <http://localhost:3000>. Sign in with a registered API account. The API can optionally seed an `ExampleUser` account using `BOOTSTRAP_USER_EMAIL` and `BOOTSTRAP_USER_PASSWORD`. Any authenticated account can open the home page and load the API example. `/restricted` demonstrates a policy-protected page; ordinary users see `/access-denied` there.

## Authentication and authorization contract

The generated server client uses these API operations:

- `POST /api/v1/auth/register` and `POST /api/v1/auth/login`.
- `POST /api/v1/auth/refresh` to replace API tokens.
- `GET /api/v1/users/me` to read `id`, `userName`, `email`, `roles`, and satisfied resource-independent `policies`.
- Password recovery operations at `/api/v1/auth/forgot-password` and `/api/v1/auth/reset-password`.

NextAuth stores API tokens in its encrypted HttpOnly session cookie. The public session exposes identity, roles, policies, and the session correlation ID, but never API tokens. Refresh reloads the current-user response; failures clear API credentials and require sign-in. Server-only settings stay under `Server` and are stripped before settings reach React providers.

`withAuth` authenticates a BFF request and supplies the bearer token. It imposes no application-wide role or policy. Individual routes use `createApiHandler({ policy: EXAMPLE_ACCESS_POLICY, handler })` when they need additional authorization. The API independently enforces the same policy. `ExampleAccess` currently requires the demonstration `ExampleUser` role; replace that policy and role with your application's needs.

The authenticated route group is `(authenticated)`. Route groups do not appear in URLs. Keep public routes outside it. The server request ID changes for each outgoing call unless explicitly supplied; the correlation ID stays stable across a signed-in session. Both are forwarded through the BFF.

## Example operations

- `/api/example` forwards to `GET /api/v1/example` for any authenticated user.
- `/api/example/restricted` forwards to `GET /api/v1/example/restricted` and requires `ExampleAccess`.
- The home page's **Load API example** button exercises the browser client, BFF, and backend together.

The backend contract is checked in as `openapi.json`; it contains only the paired bootstrap API. With the API running, refresh it from `/openapi/v1.json` and run `pnpm generate`. BFF response schemas are in `bff/schemas.ts`, and JSDoc response annotations keep the generated browser client typed.

## Generated files and checks

`predev` and `prebuild` run `pnpm generate`: appsettings declarations, server client, BFF specification, then BFF client. Regenerate after schema changes during a running dev session. Generated clients and declarations are gitignored.

```sh
pnpm validate
pnpm test:integration
pnpm test:e2e:docker
pnpm test:e2e:ui
```

`validate` builds, lints code/styles/docs, checks formatting and types, and runs unit tests. Server integration tests use a local HTTP test server and run separately. Browser tests use the real paired API. The suite covers ordinary sign-in, optional policy enforcement, denied access, sign-out, session privacy and expiry, plus a browser-to-API request from a regular user.

The starter retains Mantine, Storybook, configuration hooks, localization (`en`, `fr`, `de`, `es`), feature flags, breadcrumbs, typed links, generated clients, and the router-independent `useApi` error callback. Copy displayed text from `content/`, and keep secrets out of public configuration.

## GitHub Actions

The PR workflow runs local validation and server integration tests before the reusable Docker E2E workflow. API PRs call the same workflow. It tests the caller's merge commit with a branch of the same name in the sibling repository, or a fallback revision. Configure `E2E_API_FALLBACK_REF` in this repository and `E2E_APP_FALLBACK_REF` in the API repository; when absent, the sibling's actual default branch is used. Counterpart revisions are pinned to resolved commit SHAs and logged.

Private repository pairs need an Actions secret named `CROSS_REPO_READ_TOKEN` in both callers with read-only Contents access to both repositories. The workflow checks that it is supplied and never logs its value or substitutes the automatic token. Allow the API repository to call this repository's reusable workflows in GitHub's Actions access settings. Publish the reusable workflow on `main` before enabling the API caller. Fork PRs do not receive repository secrets.

When using these starters for a new pair, update the repository names in both workflow files, the API caller's owner/ref, package metadata, the default sibling checkout path, and this README. The `KICKSTARTER_` settings prefix is intentionally conventional and can be renamed consistently in the appsettings loader, Compose files, and environment examples.

## Repository state

This checkout was created without source-control history or credentials. No initial commit or GitHub remote is created automatically. Review the files and explicitly approve commits and publication when ready.
