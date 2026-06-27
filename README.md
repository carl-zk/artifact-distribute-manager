# Artifact Distribute Manager

A Vue 3 + Vite application for uploading files, selecting agents, creating tasks, and managing task progress across page views.

## Overview

`artifact-distribute-manager` provides a lightweight UI for:
- uploading and managing file uploads
- selecting agents and target files for task creation
- viewing and starting generated tasks
- sharing selection state across routes using Pinia
- navigating between dashboard pages with Vue Router

## Features

- File upload and preview
- Agent selection modal
- File selection modal
- Task creation and task list management
- Login portal with route protection
- Shared state with Pinia
- Vue Router-based page navigation
- Bootstrap 5 styling

## Tech Stack

- Vue 3
- Vite
- TypeScript
- Vue Router
- Pinia
- Bootstrap 5
- Sass

## Project Structure

- `src/main.ts` — app entry and plugin registration
- `src/App.vue` — app layout and router view
- `src/router/index.ts` — application routes
- `src/stores` — Pinia stores for shared state
- `src/composables` — reusable logic hooks
- `src/components` — UI components
- `src/views` — page-level views
- `src/services` — API and SSE helpers

## Setup

Install dependencies:

```sh
npm install
```

Run development server:

```sh
npm run dev
```

Build for production:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

Type-check the project:

```sh
npm run type-check
```

## Deploy


```sh
docker build -t artifact-ui:latest .

minikube image load artifact-ui

kubectl apply -f deploy.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

`<minikube-ip>:30081/`

## Rolling out
```sh
eval $(minikube docker-env)
docker build -t artifact-ui:latest .
kubectl rollout restart deployment artifact-ui
```
it avoid 'minikube image load xx' option.

## Notes

- This project is configured for modern Node versions: `^20.19.0 || >=22.12.0`.
- Ensure VS Code has the Vue Volar extension enabled for the best TypeScript and Vue support.
- The app uses Pinia to maintain shared selection state between `FilesPlane`, `TaskPlane`, and other views.
