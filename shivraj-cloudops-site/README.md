# Shivraj Singh Bisht — CloudOps/DevOps Website

Full-stack site for CloudOps, DevOps, Infrastructure and Security practice.

- Backend: Python (FastAPI) with PostgreSQL
- Frontend: React + Vite (SPA served via Nginx)
- Database: PostgreSQL
- Orchestration: Kubernetes (plain manifests + Helm chart)

## Local development

```bash
# 1) Start everything
docker compose up --build -d

# 2) Backend API
curl http://localhost:8080/health

# 3) Frontend
open http://localhost:8081
```

## Container images

- Backend image builds from `backend/Dockerfile`
- Frontend image builds from `frontend/Dockerfile`

Example tags:

```bash
docker build -t your-registry/website-backend:latest backend
docker build -t your-registry/website-frontend:latest frontend
```

Push to your registry and update image repos in manifests/values.

## Kubernetes (plain manifests)

Files in `k8s/`:
- `postgres-statefulset.yaml`: PostgreSQL
- `secrets.yaml`: DB credentials and optional TLS
- `configmap.yaml`: App config
- `backend-deployment.yaml` + `backend-service.yaml`
- `frontend-deployment.yaml` + `frontend-service.yaml`
- `ingress.yaml`: Routes `/api` to backend and `/` to frontend

Apply in order:

```bash
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl apply -f k8s/backend-deployment.yaml -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml
```

Health checks:
- Backend: `/health` on port 8080 (probes configured)
- Frontend: `/` on port 80 (probes configured)

Update images in the deployments before applying.

## Helm chart

Chart located at `helm/site`.

Render:
```bash
helm template site helm/site \
  --set backend.image.repository=your-registry/website-backend \
  --set backend.image.tag=latest \
  --set frontend.image.repository=your-registry/website-frontend \
  --set frontend.image.tag=latest \
  --set ingress.host=shivraj.example.com | kubectl apply -f -
```

Install/upgrade:
```bash
helm upgrade --install site helm/site \
  --set backend.image.repository=your-registry/website-backend \
  --set backend.image.tag=latest \
  --set frontend.image.repository=your-registry/website-frontend \
  --set frontend.image.tag=latest \
  --set ingress.host=shivraj.example.com
```

Values overview:
- `ingress.className`: ingress class (default nginx)
- `ingress.host`: host name to route
- `postgres.*`: enable/disable built-in PostgreSQL and set storage/auth

## Security notes
- Set strong DB credentials via Helm values or Secret manifests
- Enable TLS on Ingress (provide cert in `website-tls` secret)
- Add network policies and resource quotas as needed

---

© Shivraj Singh Bisht