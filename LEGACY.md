# MOLEonline legacy: the read-only archive of the old version

When moleonline.cz switches to the new MOLEonline (the `sb-ncbr/moleonline` repository, its own API), the old
computations stay on the old API, `api.mole.upol.cz`. Users keep links of the form `moleonline.cz/online/<id>[/<n>]`
to them (about 91,000 computations; the logs show people opening ones from 2023 and 2024). The new site redirects an
ID it does not know to this archive:

**https://moleonline-legacy.biodata.ceitec.cz**: this repository's last production version, unchanged except that it
is read-only: it shows old computations and starts none.

The API itself stays as it is (it is not ours to change here); read-only is a property of this frontend only.

## 1. The starting point

moleonline.cz runs the branch `production` at commit **`5fcaf6f`** ("Show CAVER's channels from ChannelsDB as they
come", 2026-10-27), five commits after the tag `v2025` (`git describe --tags`: `v2025-5-g5fcaf6f`; `v2025` is a
lightweight tag). Checked on the server
(`ubuntu@moleonline.cz`): `~/moleonline-web` is at that commit with no local changes, and `~/update.sh` built `~/web`
from it on 2026-10-27 (`git pull`, `npm run build`, copy `dist/` to `~/web`, restart nginx).

`main` has diverged from `production` (137 commits that `production` lacks: Vite, the `/api` proxy), so the archive
starts from `5fcaf6f`, not from `main`.

```sh
git tag -a v2025-final 5fcaf6f -m "The last version on moleonline.cz before the new MOLEonline"
git switch -c legacy v2025-final
git push origin v2025-final legacy
```

**Do not commit the changes below to `production`**: until the switch, `~/update.sh` on the server builds the live
site from it.

## 2. Read-only

All paths are as of `5fcaf6f`.

### Notice on every page

A static block at the top of `sources/html/index.html` and `sources/html/detail.html` (plain HTML, shown even when
the scripts fail), e.g.:

> **MOLEonline has moved to new servers.** This is the archive of the previous version, with the computations made
> until November 2026: you can view them and download their results, but not compute here. For new computations,
> go to **[moleonline.cz](https://moleonline.cz)**.

The link is the plain `https://moleonline.cz`: the archive is public only after the switch, when that address is
the new MOLEonline. (While testing before the switch it still leads to the old version; that is expected.)

On the detail page it is a thin strip above `#main-view`; the page fills the window, so check that the viewer and
the panels still fit (`sources/css/style.css`).

### Not indexed

`<meta name="robots" content="noindex">` in the `<head>` of every page (`sources/html/index.html`, `detail.html`,
`about.html`, `news.html`), so that search engines drop the archive (Google indexes moleonline.cz's computation pages
now) and send people to the new site instead.

### About and news

`sources/html/about.html` and `news.html` get the same notice at the top, linking to moleonline.cz.

### Home page (`sources/html/index.html`, `sources/src/Init/`)

As on the detail page, nothing disappears for now (whether to remove these later is still open): the form and the
examples stay, disabled, with the same hover text. Both start computations: `InitForm` (`Init/InitForm/UI.tsx`:
`initWithParams`, line 71; `initWithFile`, line 83) and `Examples` (`Init/HomePage/Examples.tsx`: `initWithParams`,
`submitMoleJob`, `submitPoresJob`, lines 29–53).

- `InitForm.render` (line 156): the tabs can still be switched, but the fields of "PDB ID" and "File" and the
  Submit button are disabled (e.g. a `<fieldset disabled>` around them); the hover text on the card (`<div
  id="init-form">`'s card, `index.html` line 79). `handleFormSubmit` only calls `preventDefault()`. The "Last
  session" tab stays as it is: it only opens computations, and its cookies belong to moleonline.cz, so it is empty
  on this domain anyway.
- `Examples` (from line 55): clicking a figure does nothing, and the figures look disabled (e.g. `opacity: 0.6`,
  `cursor: not-allowed`). Not with the class `disabled`: `Init.css` (line 224) gives it `pointer-events: none`,
  which also kills the hover text. The figures already have a `title` (the example's name): append the hover
  text to it.
- Above the form: a card "Open a computation", a field that takes an ID or a link to a computation and goes to
  `/online/<id>[/<n>]`, for people who have only the ID (plain HTML and a script in `index.html`).
- The sentence about session cookies (line 74) stays: the detail page records the computations opened here, and
  "Last session" lists them.

### Detail page (`sources/src/View/UI/Controls/UI.tsx`)

Nothing disappears from the page: the controls that compute stay where they are, disabled, and on hover say why,
e.g. "This archive is read-only. For new computations, go to moleonline.cz." (one string for all of them).

- `ControlTabs` (line 1273): the tab "Submission settings" (`<Settings>`, line 1277) stays in the header but cannot
  be opened; "Submissions" (the list of the computation's submissions and their parameters) is the one open
  (`activeTabIdx: 1`, line 1178). `TabbedContainer` (`Common/UI/Tabs/BootstrapTabs.tsx`) has no disabled tab yet:
  add a prop, e.g. `disabledTabs?: number[]`, that renders such a tab's link with the class `disabled` and
  `aria-disabled`, without `data-bs-toggle` and `onClick`, and puts the hover text (`title`) on its `<li>`: Bootstrap
  gives `.nav-link.disabled` `pointer-events: none`, so a `title` on the link itself never shows. The home page's
  form uses `TabbedContainer` too; without the prop nothing changes for it.
- `ControlButtons.render` (from line 1544): Submit, Kill, Delete, Clear and "Load params" (and its file input)
  disabled, with the hover text on a wrapper around them (`.btn:disabled` has `pointer-events: none` too); the kill
  and delete dialogs can go, as nothing opens them. The switch between submissions (the arrows and
  `#submissionComboSwitch`) keeps working.
- `Submission` footer (line 1076): Copy and Resubmit disabled the same way; **Export** keeps working: it downloads
  the parameters as JSON, which load into the new MOLEonline, and that is how to repeat an old computation.
- `ControlTabs` wraps the buttons in `<form id="submission-form" onSubmit=...>`: `handleSubmit` (line 1251) only
  calls `preventDefault()`.

### A guard in the API service (`sources/src/MoleAPIService.ts`)

So that a path missed above cannot reach the API: `initWithParams`, `initWithFile`, `submitMoleJob`,
`submitPoresJob`, `killRunningJob`, `deleteProject` and `submitFeedback` return a rejected promise ("This archive is
read-only.") without a request. The callers already show a failed promise as an error message.

### Feedback form

Remove it: `View/UI/Help/UI.tsx` (`submitFeedback`, line 146) sends it through the old API's `/__mail`, which no one
watches after the switch. In its place, a line pointing to moleonline.cz for questions; `submitFeedback` in
`MoleAPIService.ts` gets the same guard as the computations.

### What stays as it is

2DProts (`View/UI/2DProts/UI.tsx`) stays: it submits jobs to the 2DProts service, which downloads the structure from
`api.mole.upol.cz/Data`, and computes nothing on MOLE's API.


Everything that reads: the viewer, channels, layers, lining residues, ChannelsDB annotations
(`/online/<id>/ChannelsDB`), downloads (`/Data`), the PDF report, PatternQuery validation. The page still calls
`https://api.mole.upol.cz` directly (`sources/config/common.ts`), which answers any origin (it echoes `Origin` in
`Access-Control-Allow-Origin`; checked), so the new domain needs no proxy and no change of the API's address.

## 3. The image

`docker/Dockerfile` already builds the site (`npm run build`) into `nginx:1.29-alpine-slim`, running as `nginx`, with
the site in `/var/www`. It contains no nginx configuration: `docker/docker-compose.production.yaml` mounts one, and
moleonline.cz itself does not run in Docker (`~/update.sh` copies `dist/` to the host's nginx), so this image has
never served the site in production. For Kubernetes it needs its own configuration, `docker/nginx.legacy.conf`,
copied in by the Dockerfile (`COPY docker/nginx.legacy.conf /etc/nginx/nginx.conf`):

- based on `docker/nginx.production.conf` (the `/online/...` rewrites to `/html/detail.html`, the PDF report
  templates, gzip, the `/tmp` paths for running unprivileged);
- **plain HTTP on port 8080**, no `server_name`, no certificates and no redirect to HTTPS: the Gateway terminates TLS
  and redirects HTTP;
- access log to stdout (`access_log /dev/stdout;`), so that `kubectl logs` shows the visits.

CI (`.github/workflows/`): on a push to `legacy`, build and push **`ghcr.io/sb-ncbr/moleonline-legacy`**, tagged with
the commit's hash and `latest`, as `sb-ncbr/moleonline` does for its images (`docker/build-push-action`, the
workflow's `GITHUB_TOKEN` with `packages: write`). A new package on ghcr.io is private: make it public once (the
package's settings), as the other MOLEonline images are, or the cluster cannot pull it. The existing
`test-build.yml` (a Docker Compose build on every push) is then redundant on `legacy`: remove it there.

## 4. Kubernetes

The namespace **`moleonline-legacy-ns`** on CERIT-SC's cluster kuba (Rancher project mole-api) has a quota of
requests 250m CPU / 512Mi and limits 1 CPU / 1000Mi. That has to hold the pod, a second one during a rolling update
and cert-manager's HTTP-01 solver (10m / 64Mi, limits 100m / 64Mi) while a certificate is issued or renewed. The
namespace's default for containers is 1 CPU / 512Mi with request = limit, which alone would take the whole quota, so
the Deployment sets its resources.

DNS: `moleonline-legacy.biodata.ceitec.cz` is a CNAME of `kuba-lb.cloud.e-infra.cz` (done).

The manifests live in this branch as `k8s/` and follow the ones of `sb-ncbr/moleonline` (`deploy/k8s/base/web.yaml`,
`gateway.yaml`): a Deployment, a Service, a Gateway with its own Let's Encrypt certificate, an HTTPS route, a
redirect of HTTP, and HSTS.

`k8s/kustomization.yaml`:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: moleonline-legacy-ns
labels:
  - pairs:
      app.kubernetes.io/part-of: moleonline-legacy
resources:
  - legacy.yaml
```

`k8s/legacy.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: moleonline-legacy
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: moleonline-legacy
  template:
    metadata:
      labels:
        app.kubernetes.io/name: moleonline-legacy
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 101  # nginx's
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: web
          image: ghcr.io/sb-ncbr/moleonline-legacy:latest
          imagePullPolicy: Always
          ports:
            - name: http
              containerPort: 8080
          readinessProbe:
            httpGet:
              path: /
              port: http
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 200m
              memory: 128Mi
          securityContext:
            allowPrivilegeEscalation: false
            capabilities:
              drop: [ALL]
---
apiVersion: v1
kind: Service
metadata:
  name: moleonline-legacy
spec:
  selector:
    app.kubernetes.io/name: moleonline-legacy
  ports:
    - name: http
      port: 8080
      targetPort: http
---
# DNS: a CNAME of the domain to kuba-lb.cloud.e-infra.cz; the certificate is issued once it resolves
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: moleonline-legacy
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-gateway
spec:
  gatewayClassName: traefik
  listeners:
    - name: web
      protocol: HTTP
      port: 8000
      hostname: moleonline-legacy.biodata.ceitec.cz
      allowedRoutes:
        namespaces:
          from: Same
    - name: websecure
      protocol: HTTPS
      port: 8443
      hostname: moleonline-legacy.biodata.ceitec.cz
      tls:
        mode: Terminate
        certificateRefs:
          - name: moleonline-legacy-tls
      allowedRoutes:
        namespaces:
          from: Same
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: moleonline-legacy
spec:
  parentRefs:
    - name: moleonline-legacy
      sectionName: websecure
  hostnames:
    - moleonline-legacy.biodata.ceitec.cz
  rules:
    - filters:
        - type: ExtensionRef
          extensionRef:
            group: traefik.io
            kind: Middleware
            name: moleonline-legacy-hsts
      backendRefs:
        - name: moleonline-legacy
          port: 8080
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: moleonline-legacy-redirect
spec:
  parentRefs:
    - name: moleonline-legacy
      sectionName: web
  hostnames:
    - moleonline-legacy.biodata.ceitec.cz
  rules:
    - filters:
        - type: RequestRedirect
          requestRedirect:
            scheme: https
            statusCode: 301
---
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: moleonline-legacy-hsts
spec:
  headers:
    stsSeconds: 31536000
```

Deploying and updating:

```sh
kubectl --context kuba-cluster apply -k k8s
kubectl --context kuba-cluster -n moleonline-legacy-ns rollout restart deployment/moleonline-legacy  # a new image
kubectl --context kuba-cluster -n moleonline-legacy-ns get gateway,certificate,pods
kubectl --context kuba-cluster -n moleonline-legacy-ns logs deploy/moleonline-legacy  # the visits
```

## 5. Testing

Locally first (`docker build -f docker/Dockerfile`, then run the image on port 8080), then at
moleonline-legacy.biodata.ceitec.cz. Old computations opened in October 2026 (from moleonline.cz's logs):

| ID | What |
|---|---|
| `jCAb0KkH0enFqgxsJmIbQ` | PDB 1k4c, a pore, from 2023-07 |
| `929rM16Ek6XxGpatngA` | PDB 5vkq, a pore |
| `sMuFuxw5zEyau3pJwxapEw` | PDB 8fhd, 3 pores and 3 tunnel computations, from 2024-08 |
| `jqJbstch5kKHe58bToHQTw` | an uploaded structure, 3 tunnel computations |
| `fmYOt5PS3UeLllf7yZ93Ww` | an uploaded structure, 10 submissions of both kinds |
| `hZeziDJKJUyTd3XIECEnA` | an uploaded structure, 38 submissions, from 2024-07 |

Check:

- `/online/<id>` and `/online/<id>/<n>` show the computation, its channels and the switch between submissions;
  `/online/<id>/ChannelsDB` the annotations.
- Downloads, the PDF report, Export of parameters.
- No way to start, resubmit, kill or delete anything, and no feedback form, on any page; the browser's network
  panel shows no `Init`, `Submit`, `Kill`, `Delete` or `__mail` request.
- The disabled tab and buttons on the detail page, and the form and examples on the home page, show their hover
  text; "Submission settings" does not open, and neither Submit nor an example starts anything.
- The notice with its link to moleonline.cz on the home page, the detail page, about, news, a failed computation
  and an unknown ID; `noindex` in every page's `<head>`.
- HTTP redirects to HTTPS, the certificate is valid, the pod stays within its limits (`kubectl top pods`).

## 6. Afterwards

- The new MOLEonline redirects IDs it does not know to `https://moleonline-legacy.biodata.ceitec.cz/online/<id>[/<n>]`
  once the old API knows them (implemented in `sb-ncbr/moleonline`, not here).
- Once moleonline.cz runs the new version, the server `moleonline.cz` (and `~/update.sh`, the branch `production`)
  is no longer needed.
- Later, UPOL may block new computations on `api.mole.upol.cz` itself; this archive is then the only client of its
  read endpoints. If that server is ever switched off, the old computations have to be imported into the new
  MOLEonline first, or the links stop working.
