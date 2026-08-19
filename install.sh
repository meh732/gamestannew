#!/usr/bin/env bash

# ==============================================================================
# 👑 GAMESTAN PLATFORM - LINUX MANAGEMENT & DEPLOYMENT SCRIPT (v1.1)
# Repository: https://github.com/meh732/gamestannew.git
# ==============================================================================

set -e

# Default Configurations
REPO_URL="https://github.com/meh732/gamestannew.git"
DEFAULT_INSTALL_DIR="/opt/gamestan"
BACKUP_DIR="/var/backups/gamestan"
SERVICE_NAME="gamestan"
NODE_RECOMMENDED_VERSION="20"

# Color Codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GOLD='\033[38;5;220m'
BOLD='\033[1m'
NC='\033[0m'

print_header() {
    clear
    echo -e "${GOLD}${BOLD}"
    echo "=============================================================================="
    echo "          👑 GAMESTAN PLATFORM - LINUX MANAGEMENT CLI (v1.1)"
    echo "              Repository: https://github.com/meh732/gamestannew.git"
    echo "=============================================================================="
    echo -e "${NC}"
}

log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}${BOLD}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}${BOLD}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}${BOLD}[ERROR]${NC} $1"; }

check_root() {
    if [ "$(id -u)" -ne 0 ]; then
        log_error "This script must be executed with root privileges (sudo)."
        exit 1
    fi
}

detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS_NAME=$ID
    else
        OS_NAME="unknown"
    fi
}

install_system_dependencies() {
    log_info "Updating system packages and installing dependencies..."
    detect_os

    if [[ "$OS_NAME" =~ ^(ubuntu|debian|kali|raspbian)$ ]]; then
        export DEBIAN_FRONTEND=noninteractive
        apt-get update -y
        apt-get install -y curl git tar gzip ufw build-essential nginx certbot python3-certbot-nginx
        # Open firewall ports for Web traffic
        ufw allow 80/tcp 2>/dev/null || true
        ufw allow 443/tcp 2>/dev/null || true
    elif [[ "$OS_NAME" =~ ^(centos|rhel|almalinux|rocky|fedora)$ ]]; then
        yum update -y || dnf update -y
        yum install -y curl git tar gzip epel-release nginx certbot python3-certbot-nginx firewalld || \
        dnf install -y curl git tar gzip epel-release nginx certbot python3-certbot-nginx firewalld
        systemctl start firewalld 2>/dev/null || true
        firewall-cmd --permanent --add-service=http 2>/dev/null || true
        firewall-cmd --permanent --add-service=https 2>/dev/null || true
        firewall-cmd --reload 2>/dev/null || true
    fi

    # Install / Verify Node.js 20 LTS
    if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d'.' -f1 | tr -d 'v')" -lt 18 ]; then
        log_info "Installing modern Node.js (${NODE_RECOMMENDED_VERSION}.x LTS)..."
        if [[ "$OS_NAME" =~ ^(ubuntu|debian|kali|raspbian)$ ]]; then
            curl -fsSL https://deb.nodesource.com/setup_${NODE_RECOMMENDED_VERSION}.x | bash -
            apt-get install -y nodejs
        elif [[ "$OS_NAME" =~ ^(centos|rhel|almalinux|rocky|fedora)$ ]]; then
            curl -fsSL https://rpm.nodesource.com/setup_${NODE_RECOMMENDED_VERSION}.x | bash -
            yum install -y nodejs || dnf install -y nodejs
        fi
    fi

    log_success "Node.js $(node -v) and npm $(npm -v) ready."
}

create_backup() {
    local target_dir="${1:-$DEFAULT_INSTALL_DIR}"
    local reason="${2:-manual}"

    if [ ! -d "$target_dir" ]; then
        log_warn "Directory $target_dir does not exist. Skipping backup."
        return 0
    fi

    mkdir -p "$BACKUP_DIR"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="${BACKUP_DIR}/gamestan_${reason}_${timestamp}.tar.gz"

    log_info "Creating backup: $backup_file ..."
    tar --exclude='node_modules' --exclude='.git' -czf "$backup_file" -C "$(dirname "$target_dir")" "$(basename "$target_dir")"

    if [ -f "$backup_file" ]; then
        local size=$(du -sh "$backup_file" | cut -f1)
        log_success "Backup saved! ($size) -> $backup_file"
        echo "$backup_file"
        return 0
    else
        log_error "Failed to create backup archive."
        return 1
    fi
}

restore_backup() {
    mkdir -p "$BACKUP_DIR"
    local backups=($(ls -1t ${BACKUP_DIR}/gamestan_*.tar.gz 2>/dev/null || true))

    if [ ${#backups[@]} -eq 0 ]; then
        echo -e "${YELLOW}No backups found in $BACKUP_DIR${NC}"
        read -rp "Enter full path to custom .tar.gz archive (or press Enter to skip): " custom_path
        if [ -n "$custom_path" ] && [ -f "$custom_path" ]; then
            SELECTED_BACKUP="$custom_path"
        else
            log_info "Skipping restore."
            return 1
        fi
    else
        echo -e "${CYAN}${BOLD}Available Backups in ${BACKUP_DIR}:${NC}"
        for i in "${!backups[@]}"; do
            local bname=$(basename "${backups[$i]}")
            local bsize=$(du -sh "${backups[$i]}" | cut -f1)
            local bdate=$(date -r "${backups[$i]}" "+%Y-%m-%d %H:%M:%S")
            echo -e "  [${GOLD}$((i+1))${NC}] $bname  (${CYAN}$bsize${NC}) - $bdate"
        done
        read -rp "Select backup number [1-${#backups[@]}]: " choice
        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#backups[@]}" ]; then
            SELECTED_BACKUP="${backups[$((choice-1))]}"
        else
            log_info "Restore skipped."
            return 1
        fi
    fi

    read -rp "Target restore directory [Default: $DEFAULT_INSTALL_DIR]: " target_dir
    target_dir="${target_dir:-$DEFAULT_INSTALL_DIR}"

    if systemctl is-active --quiet "$SERVICE_NAME"; then
        systemctl stop "$SERVICE_NAME"
    fi

    mkdir -p "$target_dir"
    tar -xzf "$SELECTED_BACKUP" -C "$(dirname "$target_dir")"
    chmod -R 755 "$target_dir"
    log_success "Backup restored into $target_dir"

    if [ -f "$target_dir/package.json" ]; then
        cd "$target_dir"
        npm install
        npm run build
        systemctl restart "$SERVICE_NAME" 2>/dev/null || true
    fi
    return 0
}

configure_nginx() {
    local domain="$1"
    local app_dir="$2"
    local port="$3"

    log_info "Configuring Nginx with high-performance SPA static routing & proxy..."
    local NGINX_CONF="/etc/nginx/sites-available/gamestan"
    if [ ! -d "/etc/nginx/sites-available" ]; then
        mkdir -p "/etc/nginx/conf.d"
        NGINX_CONF="/etc/nginx/conf.d/gamestan.conf"
    fi

    # Fix permissions so Nginx (www-data/nginx) can read dist files
    chmod -R 755 /opt
    chmod -R 755 "$app_dir"

    cat <<EOF > "$NGINX_CONF"
server {
    listen 80;
    server_name ${domain};

    root ${app_dir}/dist;
    index index.html;

    client_max_body_size 50M;

    # Gzip compression for blazing fast loading
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json image/svg+xml;

    # Serve static assets with caching
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|webp|manifest|webmanifest)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public, max-age=15552000, immutable";
        try_files \$uri \$uri/ /index.html;
    }

    # SPA Routing fallback
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Optional API proxy pass if backend enabled
    location /api/ {
        proxy_pass http://127.0.0.1:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    if [ -d "/etc/nginx/sites-enabled" ]; then
        ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/gamestan"
        rm -f "/etc/nginx/sites-enabled/default" 2>/dev/null || true
    fi

    nginx -t
    systemctl restart nginx
    log_success "Nginx configured and restarted successfully!"
}

install_gamestan() {
    print_header
    echo -e "${GOLD}${BOLD}=== STEP 1: INSTALLATION CONFIGURATION ===${NC}\n"

    read -rp "Enter Installation Directory [Default: $DEFAULT_INSTALL_DIR]: " INSTALL_DIR
    INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"

    read -rp "Enter Internal Port [Default: 3000]: " APP_PORT
    APP_PORT="${APP_PORT:-3000}"

    read -rp "Enter Domain Name or Server IP [Default: localhost]: " DOMAIN_NAME
    DOMAIN_NAME="${DOMAIN_NAME:-localhost}"

    ENABLE_SSL="n"
    SSL_EMAIL=""
    if [ "$DOMAIN_NAME" != "localhost" ] && [[ ! "$DOMAIN_NAME" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo ""
        read -rp "Do you want to configure Free SSL with Let's Encrypt (Certbot)? (y/N): " ENABLE_SSL
        if [[ "$ENABLE_SSL" =~ ^[Yy]$ ]]; then
            read -rp "Enter Admin Email for SSL: " SSL_EMAIL
            while [ -z "$SSL_EMAIL" ]; do
                read -rp "Enter Admin Email: " SSL_EMAIL
            done
        fi
    fi

    echo ""
    read -rp "Do you want to restore from an existing backup before starting? (y/N): " DO_RESTORE
    RESTORE_DONE=0
    if [[ "$DO_RESTORE" =~ ^[Yy]$ ]]; then
        if restore_backup; then
            RESTORE_DONE=1
        fi
    fi

    install_system_dependencies

    if [ $RESTORE_DONE -eq 0 ]; then
        if [ -d "$INSTALL_DIR" ]; then
            create_backup "$INSTALL_DIR" "pre_install_overwrite"
            rm -rf "${INSTALL_DIR:?}"/*
        else
            mkdir -p "$INSTALL_DIR"
        fi

        log_info "Cloning from $REPO_URL ..."
        git clone "$REPO_URL" "$INSTALL_DIR"
    fi

    cd "$INSTALL_DIR"
    log_info "Installing npm packages and building..."
    npm install
    npm run build

    # Set proper permissions for web server
    chmod -R 755 "$INSTALL_DIR"

    # Configure Nginx
    configure_nginx "$DOMAIN_NAME" "$INSTALL_DIR" "$APP_PORT"

    # SSL Issuance
    if [[ "$ENABLE_SSL" =~ ^[Yy]$ ]] && [ -n "$SSL_EMAIL" ]; then
        log_info "Issuing SSL Certificate with Certbot for $DOMAIN_NAME..."
        certbot --nginx -d "$DOMAIN_NAME" --non-interactive --agree-tos -m "$SSL_EMAIL" --redirect || {
            log_warn "Certbot encountered an error. Check DNS A-record and firewall."
        }
        systemctl reload nginx 2>/dev/null || true
    fi

    print_header
    echo -e "${GREEN}${BOLD}🎉 GAMESTAN HAS BEEN SUCCESSFULLY INSTALLED & CONFIGURED!${NC}\n"
    if [[ "$ENABLE_SSL" =~ ^[Yy]$ ]]; then
        echo -e "  🌐 Web URL:          ${CYAN}https://${DOMAIN_NAME}${NC}"
    else
        echo -e "  🌐 Web URL:          ${CYAN}http://${DOMAIN_NAME}${NC}"
    fi
    echo -e "  📁 Install Path:     ${BOLD}${INSTALL_DIR}${NC}"
    echo -e "  📂 Static Web Root:  ${BOLD}${INSTALL_DIR}/dist${NC}\n"
    read -rp "Press Enter to return to main menu..."
}

update_gamestan() {
    print_header
    echo -e "${GOLD}${BOLD}=== STEP 2: UPDATE GAMESTAN ===${NC}\n"
    read -rp "Enter Installation Directory [Default: $DEFAULT_INSTALL_DIR]: " INSTALL_DIR
    INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"

    if [ ! -d "$INSTALL_DIR" ]; then
        log_error "Directory not found: $INSTALL_DIR"
        read -rp "Press Enter to return to menu..."
        return 1
    fi

    create_backup "$INSTALL_DIR" "pre_update"
    cd "$INSTALL_DIR"
    git fetch --all
    git reset --hard origin/main || git reset --hard origin/master || git pull
    npm install
    npm run build
    chmod -R 755 "$INSTALL_DIR"
    systemctl reload nginx 2>/dev/null || true
    log_success "GameStan updated and rebuilt successfully!"
    read -rp "Press Enter to return to menu..."
}

uninstall_gamestan() {
    print_header
    echo -e "${RED}${BOLD}=== STEP 3: UNINSTALL GAMESTAN ===${NC}\n"
    read -rp "Enter Installation Directory [Default: $DEFAULT_INSTALL_DIR]: " INSTALL_DIR
    INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"

    read -rp "Are you sure you want to uninstall? (yes/NO): " confirm
    if [ "$confirm" != "yes" ]; then
        return 0
    fi

    create_backup "$INSTALL_DIR" "pre_uninstall"
    rm -f "/etc/nginx/sites-available/gamestan" "/etc/nginx/sites-enabled/gamestan" "/etc/nginx/conf.d/gamestan.conf"
    systemctl reload nginx 2>/dev/null || true
    rm -rf "$INSTALL_DIR"
    log_success "GameStan has been uninstalled."
    read -rp "Press Enter to return to menu..."
}

manual_backup() {
    print_header
    read -rp "Enter Installation Directory [Default: $DEFAULT_INSTALL_DIR]: " INSTALL_DIR
    INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"
    create_backup "$INSTALL_DIR" "manual"
    read -rp "Press Enter to return to menu..."
}

view_status_logs() {
    print_header
    echo -e "${GOLD}${BOLD}=== NGINX & WEB STATUS ===${NC}\n"
    systemctl status nginx --no-pager || true
    echo -e "\n${CYAN}--- Nginx Error Logs (Last 20 lines) ---${NC}"
    tail -n 20 /var/log/nginx/error.log 2>/dev/null || true
    read -rp "Press Enter to return to menu..."
}

main_menu() {
    check_root
    while true; do
        print_header
        echo -e "  [${GOLD}1${NC}] 🚀 ${BOLD}Install GameStan${NC} (Node.js, Nginx SPA, Port, Domain, SSL)"
        echo -e "  [${GOLD}2${NC}] 🔄 ${BOLD}Update GameStan${NC} (Auto-Backup -> Git Pull -> Build -> Reload)"
        echo -e "  [${GOLD}3${NC}] 🗑️  ${BOLD}Uninstall GameStan${NC} (Auto-Backup -> Remove Nginx & Files)"
        echo -e "  [${GOLD}4${NC}] 📦 ${BOLD}Create Backup Now${NC} (Save full snapshot to ${BACKUP_DIR})"
        echo -e "  [${GOLD}5${NC}] ⏪ ${BOLD}Restore from Backup${NC} (Restore previous archive)"
        echo -e "  [${GOLD}6${NC}] 📊 ${BOLD}Nginx Status & Logs${NC}"
        echo -e "  [${GOLD}7${NC}] ♻️  ${BOLD}Reload Nginx Web Server${NC}"
        echo -e "  [${GOLD}8${NC}] ❌ ${BOLD}Exit${NC}\n"
        read -rp "Enter choice [1-8]: " choice
        case $choice in
            1) install_gamestan ;;
            2) update_gamestan ;;
            3) uninstall_gamestan ;;
            4) manual_backup ;;
            5) restore_backup ;;
            6) view_status_logs ;;
            7) systemctl reload nginx; log_success "Nginx reloaded!"; sleep 1 ;;
            8|q|Q) exit 0 ;;
        esac
    done
}

main_menu
