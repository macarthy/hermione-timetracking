# Deployment Guide for Digital Ocean

## Prerequisites

1. Digital Ocean server with Docker and Docker Compose installed
2. Supabase project set up with database schema
3. Azure AD application configured
4. Domain name (optional but recommended)

## Deployment Steps

### 1. Server Setup

```bash
# Update server
sudo apt update && sudo apt upgrade -y

# Install Docker if not already installed
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Deploy Application

```bash
# Clone the repository
git clone https://github.com/macarthy/hermione-timetracking.git
cd hermione-timetracking

# Create environment file
cp .env.local.example .env.local
# Edit .env.local with your production values

# Build and start the application
docker-compose up -d --build

# Check logs
docker-compose logs -f hermione
```

### 3. Environment Variables

Create `.env.local` with your production values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Azure AD Configuration
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=your_azure_client_id
NEXT_PUBLIC_AZURE_AD_TENANT_ID=your_azure_tenant_id
AZURE_AD_CLIENT_SECRET=your_azure_client_secret

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secure_random_string
```

### 4. Nginx Reverse Proxy (Recommended)

Create `/etc/nginx/sites-available/hermione`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/hermione /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 6. Monitoring and Maintenance

```bash
# View application logs
docker-compose logs -f hermione

# Update application
git pull origin main
docker-compose up -d --build

# Backup (if needed)
docker-compose exec hermione npm run backup

# Check health
curl http://localhost:3000/api/health
```

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Environment variables not loading**
   - Check `.env.local` file exists and has correct permissions
   - Restart containers: `docker-compose restart`

3. **Database connection issues**
   - Verify Supabase URL and keys
   - Check network connectivity to Supabase

4. **Build failures**
   - Check Docker logs: `docker-compose logs hermione`
   - Ensure sufficient disk space and memory

### Performance Optimization

1. **Enable compression in Nginx**
2. **Set up CDN for static assets**
3. **Configure proper caching headers**
4. **Monitor resource usage with htop/docker stats**