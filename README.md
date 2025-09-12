# CI/CD Pipeline: Docker + GitHub Actions + AWS EC2 (Beginner-Friendly)

This repo is a **copy‑paste starter** you can push to GitHub and deploy to an Ubuntu EC2 instance.
It includes:
- A tiny Node.js web app (`/app`)
- Dockerfile
- Nginx reverse proxy (for stable ports and smoother restarts)
- Docker Compose for production
- GitHub Actions workflow that builds/pushes a Docker image to **GitHub Container Registry (GHCR)** and deploys to EC2 over SSH

> Works even if you’ve **never** done CI/CD before. Follow the steps below once, then every push to `main` auto‑deploys.


## 0) What you need
- A GitHub account
- An AWS account
- An Ubuntu EC2 instance (we’ll create it below)
- (Optional) A domain pointing to the EC2 public IP if you want pretty URLs & HTTPS later


## 1) Push this project to your own GitHub repo
1. Download the ZIP from ChatGPT and unzip.
2. Create a **new GitHub repository** (keep the name simple, e.g. `my-cicd-app`).
3. In the unzipped folder, run:
   ```bash
   git init
   git add .
   git commit -m "init: ci/cd docker aws starter"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```


## 2) Launch the EC2 instance (Ubuntu)
1. **Create Key Pair** (RSA, `.pem`) and download it (you’ll need it to SSH).
2. **Security Group**: Allow inbound `22` (SSH) from your IP and `80` (HTTP) from anywhere.
3. Launch **Ubuntu 22.04** (t3.micro is fine for demo). Note the **Public IPv4 address** (we’ll call it `EC2_HOST`).

SSH into the box:
```bash
chmod 600 path/to/your-key.pem
ssh -i path/to/your-key.pem ubuntu@EC2_HOST
```

Install Docker + Compose and prep deploy folder:
```bash
# On EC2
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Reconnect SSH so docker group applies

mkdir -p /srv/myapp
```


## 3) Configure GHCR (image registry)
We’ll push images to **GitHub Container Registry** and pull them on EC2.

- On GitHub, create a **Personal Access Token (classic)** with scope: `read:packages` (for EC2 pulls). Copy it (we’ll call it `GHCR_PAT`).
- Your GHCR username is your GitHub username (`GHCR_USERNAME`).

On the **EC2 server**, log in to GHCR **once** (stored under `~/.docker/config.json`):
```bash
docker logout ghcr.io || true
echo "YOUR_GHCR_PAT_HERE" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

> You’ll also put these in GitHub Secrets so the workflow can pass them safely to the server.


## 4) Tell Compose which image to run
Open `deploy/docker-compose.yml`. It contains `IMAGE_PLACEHOLDER`. The workflow will replace this automatically with your repo image name (like `ghcr.io/<you>/<repo>:latest`) on every deploy, so you don’t have to edit it manually.


## 5) Add GitHub Secrets (repo → Settings → Secrets and variables → Actions → New repository secret)
Create these **secrets**:

- `EC2_HOST` → your instance public IP or DNS
- `EC2_USER` → `ubuntu`
- `EC2_SSH_KEY` → paste your **private** key (`.pem`) contents
- `GHCR_USERNAME` → your GitHub username
- `GHCR_PAT` → the PAT you created above with `read:packages`

> The workflow uses these to SSH into EC2 and to log in to GHCR on the server.


## 6) Trigger your first deployment
Push any change to `main` (even editing `app/server.js` text). The workflow will:
1. Build the Docker image
2. Push it to GHCR (tags: `latest` + the commit SHA)
3. Copy the deploy files to `/srv/myapp` on EC2
4. Log in to GHCR on the server (using your secrets)
5. Pull `:latest` and run via Docker Compose (Nginx reverse proxy on :80 → app on :3000)

Open `http://EC2_HOST/` in your browser — you should see: **“Hello from version …”**


## 7) Minimal downtime notes
- Nginx keeps port 80 stable while the app container is recreated.
- Typical restarts are a second or two. For stricter zero‑downtime you can later add blue/green or multiple replicas — this starter keeps it simple.


## 8) Local development (optional)
To run locally without GHCR:
```bash
docker compose -f docker-compose.dev.yml up --build
# open http://localhost:3000
```


## 9) Next steps (optional)
- Attach a domain + HTTPS (Let’s Encrypt) — easiest with a Caddy or nginx + certbot container.
- Add a database container (Postgres) and env secrets.
- Scale app replicas and update Nginx upstreams for rolling-style updates.

---

**That’s it.** Edit `/app/server.js`, commit, push to `main` — your EC2 updates automatically.
