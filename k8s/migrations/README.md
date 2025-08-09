# Database Migration Jobs

This folder provides Kubernetes Jobs to automate database migrations as part of your deployment pipeline.

## Options

- Plain Kubernetes Job: `migration-job.yaml`
- Argo CD PreSync hook: `argocd-migration-job.yaml`
- Helm hook Job (chart): `/workspace/helm/app-migrations`

## Secrets expected

Create a secret named `app-db` with keys used by the manifests:

- `url`: full connection string, e.g. `postgres://user:pass@host:5432/db?sslmode=disable`
- `host`: database host used by the readiness initContainer
- `port`: database port used by the readiness initContainer

Example:

```bash
kubectl -n default create secret generic app-db \
  --from-literal=url="postgres://user:pass@postgres:5432/app" \
  --from-literal=host="postgres" \
  --from-literal=port="5432"
```

## Plain Kubernetes

Apply the job when needed (e.g., as a step before rolling out the Deployment):

```bash
kubectl apply -f /workspace/k8s/migrations/migration-job.yaml
kubectl wait --for=condition=complete --timeout=5m job/app-migrate -n default
```

Adjust the `image` and `args` to call your app's migration command (e.g. `alembic upgrade head`, `sequelize db:migrate`, `prisma migrate deploy`, etc.).

## Argo CD

Include `argocd-migration-job.yaml` in your app manifests to run migrations automatically before your app syncs:

- PreSync hook ensures migrations run before the rest of the resources
- Hook is cleaned up when it succeeds

## Helm

A minimal Helm chart is provided in `/workspace/helm/app-migrations`.

Install or upgrade with:

```bash
helm upgrade --install app-migrations /workspace/helm/app-migrations \
  --namespace default \
  --set image.repository=your-registry/your-app \
  --set image.tag=latest \
  --set migration.command="npm run migrate"
```

You can enable a DB readiness `initContainer` for Postgres or MySQL via values:

```yaml
migration:
  waitForDatabase:
    enabled: true
    type: postgres # or mysql
    image: postgres:16-alpine # or mysql:8
```

## Notes

- Keep the migration Job idempotent. It may run multiple times on retries or across environments.
- Use low `backoffLimit` to avoid long rollouts on failure. Increase if your migrations sometimes need retries.
- Prefer running migrations as hooks (Argo CD/Helm) instead of `initContainers` on the main Deployment to avoid delaying pod restarts.