#!/usr/bin/env bash

# ==============================================================================
# 👑 GAMESTAN PLATFORM - LINUX MANAGEMENT & DEPLOYMENT SCRIPT
# Repository: https://github.com/meh732/gamestannew.git
# Supported OS: Ubuntu 20.04/22.04/24.04, Debian 11/12, CentOS/AlmaLinux/Fedora
# ==============================================================================

set -e

# Default Configurations
REPO_URL="https://github.com/meh732/gamestannew.git"
DEFAULT_INSTALL_DIR="/opt/gamestan"
BACKUP_DIR="/var/backups/gamestan"
SERVICE_NAME="gamestan"
NODE_RECOMMENDED_VERSION="20"

# Color Codes for Modern CLI Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
GOLD='\033[38;5;220m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Helper UI Functions
print_header() {
    clear
    echo -e "${GOLD}${BOLD}"
    echo "=============================================================================="
    echo "          👑 GAMESTAN PLATFORM - LINUX MANAGEMENT CLI (v1.0)"
    echo "              Repository: https://github.com/meh732/gamestannew.git"
    echo "=============================================================================="
    echo -e "${NC}"
}

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}${BOLD}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}${BOLD}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}${BOLD}[ERROR]${NC} $1"
}

check_root() {
    if [ "$(id -u)" -ne 0 ]; then
        log_error "This script must be executed with root privileges."
        echo -e "Please run using: ${BOLD}sudo bash $0${NC}"
        exit 1
    fi
}

detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS_NAME=$ID
        OS_VERSION=$VERSION_ID
    else
        OS_NAME="unknown"
    fi
}

# ------------------------------------------------------------------------------
# Dependency Installer (Git, Curl, Nginx, Node.js LTS, Certbot)
# ------------------------------------------------------------------------------
install_system_dependencies() {
    log_info "Updating system packages and installing dependencies..."
    detect_os

    if [[ "$OS_NAME" =~ ^(ubuntu|debian|kali|raspbian)$ ]]; then
        export DEBIAN_FRONTEND=noninteractive
        apt-get update -y
        apt-get install -y curl git tar gzip ufw build-essential nginx certbot python3-certbot-nginx
    elif [[ "$OS_NAME" =~ ^(centos|rhel|almalinux|rocky|fedora)$ ]]; then
        yum update -y || dnf update -y
        yum install -y curl git tar gzip epel-release nginx certbot python3-certbot-nginx || \
        dnf install -y curl git tar gzip epel-release nginx certbot python3-certbot-nginx
    else
        log_warn "Unrecognized OS ($OS_NAME). Attempting generic package installation..."
    fi

    # Install / Verify Node.js 20 LTS
    if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d'.' -f1 | tr -d 'v')" -lt 18 ]; then
        log_info "Installing modern Node.js (${NODE_RECOMMENDED_VERSION}.x LTS) and npm..."
        if [[ "$OS_NAME" =~ ^(ubuntu|debian|kali|raspbian)$ ]]; then
            curl -fsSL https://deb.nodesource.com/setup_${NODE_RECOMMENDED_VERSION}.x | bash -
            apt-get install -y nodejs
        elif [[ "$OS_NAME" =~ ^(centos|rhel|almalinux|rocky|fedora)$ ]]; then
            curl -fsSL https://rpm.nodesource.com/setup_${NODE_RECOMMENDED_VERSION}.x | bash -
            yum install -y nodejs || dnf install -y nodejs
        fi
    fi

    log_success "Node.js $(node -v) and npm $(npm -v) are ready."
}

# ------------------------------------------------------------------------------
# Backup Engine
# ------------------------------------------------------------------------------
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

    log_info "Creating automated backup: $backup_file ..."
    tar --exclude='node_modules' --exclude='.git' -czf "$backup_file" -C "$(dirname "$target_dir")" "$(basename "$target_dir")"

    if [ -f "$backup_file" ]; then
        local size=$(du -sh "$backup_file" | cut -f1)
        log_success "Backup created successfully! ($size) -> $backup_file"
        echo "$backup_file"
        return 0
    else
        log_error "Failed to create backup archive."
        return 1
    fi
}

# ------------------------------------------------------------------------------
# Restore Engine
# ------------------------------------------------------------------------------
restore_backup() {
    mkdir -p "$BACKUP_DIR"
    local backups=($(ls -1t ${BACKUP_DIR}/gamestan_*.tar.gz 2>/dev/null || true))

    if [ ${#backups[@]} -eq 0 ]; then
        echo -e "${YELLOW}No existing backup files found in $BACKUP_DIR${NC}"
        read -rp "Enter full path to custom .tar.gz backup archive (or press Enter to skip): " custom_path
        if [ -n "$custom_path" ] && [ -f "$custom_path" ]; then
            SELECTED_BACKUP="$custom_path"
        else
            log_info "Skipping restore process."
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
        echo -e "  [${GOLD}c${NC}] Enter custom file path"
        echo -e "  [${GOLD}s${NC}] Skip restore"

        read -rp "Select backup number to restore [1-${#backups[@]}]: " choice
        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#backups[@]}" ]; then
            SELECTED_BACKUP="${backups[$((choice-1))]}"
        elif [ "$choice" == "c" ] || [ "$choice" == "C" ]; then
            read -rp "Enter full path to .tar.gz archive: " custom_path
            if [ -f "$custom_path" ]; then
                SELECTED_BACKUP="$custom_path"
            else
                log_error "File not found: $custom_path"
                return 1
            fi
        else
            log_info "Restore skipped."
            return 1
        fi
    fi

    log_warn "Restoring from: $SELECTED_BACKUP"
    read -rp "Target restore directory [Default: $DEFAULT_INSTALL_DIR]: " target_dir
    target_dir="${target_dir:-$DEFAULT_INSTALL_DIR}"

    # Stop service if running
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log_info "Stopping $SERVICE_NAME service before restore..."
        systemctl stop "$SERVICE_NAME"
    fi

    mkdir -p "$target_dir"
    tar -xzf "$SELECTED_BACKUP" -C "$(dirname "$target_dir")"
    log_success "Backup restored into $target_dir"

    # Rebuild & restart if dependencies exist
    if [ -f "$target_dir/package.json" ]; then
        log_info "Installing dependencies and rebuilding application..."
        cd "$target_dir"
        npm install
        npm run build
        if [ -f "/etc/systemd/system/${SERVICE_NAME}.service" ]; then
            systemctl restart "$SERVICE_NAME"
            log_success "Service $SERVICE_NAME restarted successfully!"
        fi
    fi
    return 0
}

# ------------------------------------------------------------------------------
# Installation Workflow
# ------------------------------------------------------------------------------
install_gamestan() {
    print_header
    echo -e "${GOLD}${BOLD}=== STEP 1: INSTALLATION CONFIGURATION ===${NC}\n"

    # 1. Target Directory
    read -rp "Enter Installation Directory [Default: $DEFAULT_INSTALL_DIR]: " INSTALL_DIR
    INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"

    # 2. Port Configuration
    read -rp "Enter Internal Application Port [Default: 3000]: " APP_PORT
    APP_PORT="${APP_PORT:-3000}"

    # 3. Domain Name
    read -rp "Enter Domain Name (e.g. gamestan.example.com or server IP) [Default: localhost]: " DOMAIN_NAME
    DOMAIN_NAME="${DOMAIN_NAME:-localhost}"

    # 4. SSL Configuration
    ENABLE_SSL="n"
    SSL_EMAIL=""
    if [ "$DOMAIN_NAME" != "localhost" ] && [[ ! "$DOMAIN_NAME" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo ""
        read -rp "Do you want to configure Free SSL with Let's Encrypt (Certbot)? (y/N): " ENABLE_SSL
        if [[ "$ENABLE_SSL" =~ ^[Yy]$ ]]; then
            read -rp "Enter Admin Email for SSL Certificate notifications: " SSL_EMAIL
            while [ -z "$SSL_EMAIL" ]; do
                log_warn "An email address is required for Let's Encrypt."
                read -rp "Enter Admin Email: " SSL_EMAIL
            done
        fi
    fi

    # 5. Restore Backup Option
    echo ""
    read -rp "Do you want to restore from an existing backup archive now? (y/N): " DO_RESTORE
    RESTORE_DONE=0
    if [[ "$DO_RESTORE" =~ ^[Yy]$ ]]; then
        if restore_backup; then
            RESTORE_DONE=1
        fi
    fi

    # --------------------------------------------------------------------------
    # Begin Installation
    # --------------------------------------------------------------------------
    echo ""
    log_info "Starting GameStan deployment..."
    install_system_dependencies

    # Clone Repository if not already restored
    if [ $RESTORE_DONE -eq 0 ]; then
        if [ -d "$INSTALL_DIR" ]; then
            log_warn "Directory $INSTALL_DIR already exists."
            create_backup "$INSTALL_DIR" "pre_install_overwrite"
            rm -rf "${INSTALL_DIR:?}"/*
        else
            mkdir -p "$INSTALL_DIR"
        fi

        log_info "Cloning repository from $REPO_URL ..."
        git clone "$REPO_URL" "$INSTALL_DIR"
    fi

    cd "$INSTALL_DIR"

    # Install Node Packages & Build Production Assets
    log_info "Installing npm packages (this may take 1-2 minutes)..."
    npm install

    log_info "Building production application with Vite..."
    npm run build

    # Create Systemd Service
    log_info "Creating systemd daemon service: /etc/systemd/system/${SERVICE_NAME}.service ..."
    cat <<EOF > "/etc/systemd/system/${SERVICE_NAME}.service"
[Unit]
Description=GameStan Mythological Gaming Platform
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
ExecStart=$(which npm) run preview -- --port ${APP_PORT} --host 0.0.0.0
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=${APP_PORT}

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable "${SERVICE_NAME}"
    systemctl restart "${SERVICE_NAME}"

    # Configure Nginx Reverse Proxy
    log_info "Configuring Nginx Reverse Proxy for ${DOMAIN_NAME} -> 127.0.0.1:${APP_PORT} ..."
    local NGINX_CONF="/etc/nginx/sites-available/gamestan"
    if [ ! -d "/etc/nginx/sites-available" ]; then
        mkdir -p "/etc/nginx/conf.d"
        NGINX_CONF="/etc/nginx/conf.d/gamestan.conf"
    fi

    cat <<EOF > "$NGINX_CONF"
server {
    listen 80;
    server_name ${DOMAIN_NAME};

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    if [ -d "/etc/nginx/sites-enabled" ]; then
        ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/gamestan"
        rm -f "/etc/nginx/sites-enabled/default" 2>/dev/null || true
    fi

    nginx -t
    systemctl restart nginx

    # Issue SSL Certificate with Certbot if requested
    if [[ "$ENABLE_SSL" =~ ^[Yy]$ ]] && [ -n "$SSL_EMAIL" ]; then
        log_info "Requesting Let's Encrypt SSL certificate for $DOMAIN_NAME ..."
        certbot --nginx -d "$DOMAIN_NAME" --non-interactive --agree-tos -m "$SSL_EMAIL" --redirect || {
            log_warn "SSL automated issuance encountered an issue. Ensure your domain's DNS A-record points to this server IP."
        }
        systemctl reload nginx
    fi

    # Final Installation Summary
    print_header
    echo -e "${GREEN}${BOLD}🎉 GAMESTAN HAS BEEN SUCCESSFULLY INSTALLED & CONFIGURED!${NC}\n"
    echo -e "${GOLD}------------------------------------------------------------------------------${NC}"
    if [[ "$ENABLE_SSL" =~ ^[Yy]$ ]]; then
        echo -e "  🌐 Web URL:          ${CYAN}https://${DOMAIN_NAME}${NC}"
    else
        echo -e "  🌐 Web URL:          ${CYAN}http://${DOMAIN_NAME}${NC} (or http://SERVER_IP:${APP_PORT})"
    fi
    echo -e "  📁 Install Path:     ${BOLD}${INSTALL_DIR}${NC}"
    echo -e "  ⚙️ Internal Port:    ${BOLD}${APP_PORT}${NC}"
    echo -e "  🛡️ Systemd Service:  ${GREEN}active (running)${NC} [${SERVICE_NAME}.service]"
    echo -e "  📦 Backups Location: ${BOLD}${BACKUP_DIR}${NC}"
    echo -e "${GOLD}------------------------------------------------------------------------------${NC}\n"

    echo -e "Useful Commands:"
    echo -e "  - Check Status:  ${BOLD}systemctl status ${SERVICE_NAME}${NC}"
    echo -e "  - View Logs:     ${BOLD}journalctl -u ${SERVICE_NAME} -f${NC}"
    echo -e "  - Restart App:   ${BOLD}systemctl restart ${SERVICE_NAME}${NC}"
    echo -e "  - Manage Script: ${BOLD}bash $0${NC}\n"

    read -rp "Press Enter to return to main menu..."
}

# ------------------------------------------------------------------------------
# Update Workflow (with mandatory auto-backup)
# ------------------------------------------------------------------------------
update_gamestan() {
    print_header
    echo -e "${GOLD}${BOLD}=== STEP 2: UPDATE GAMESTAN PLATFORM ===${NC}\n"

    read -rp "Enter Installation Directory [Default: $DEFAULT_INSTALL_DIR]: " INSTALL_DIR
    INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"

    if [ ! -d "$INSTALL_DIR" ]; then
        log_error "Installation directory $INSTALL_DIR not found. Please install first."
        read -rp "Press Enter to return to main menu..."
        return 1
    fi

    # Mandatory Pre-Update Backup
    log_info "Creating automated pre-update safety backup..."
    create_backup "$INSTALL_DIR" "pre_update"

    cd "$INSTALL_DIR"

    log_info "Pulling latest changes from repository ($REPO_URL)..."
    git fetch --all
    git reset --hard origin/main || git pull origin main || git pull origin master

    log_info "Updating packages and rebuilding assets..."
    npm install
    npm run build

    log_info "Restarting ${SERVICE_NAME} service..."
    systemctl restart "${SERVICE_NAME}" 2>/dev/null || true

    log_success "GameStan has been updated successfully to the latest version!"
    read -rp "Press Enter to return to main menu..."
}

# ------------------------------------------------------------------------------
# Uninstall Workflow (with mandatory auto-backup)
# ------------------------------------------------------------------------------
uninstall_gamestan() {
    print_header
    echo -e "${RED}${BOLD}=== STEP 3: UNINSTALL GAMESTAN PLATFORM ===${NC}\n"

    read -rp "Enter Installation Directory [Default: $DEFAULT_INSTALL_DIR]: " INSTALL_DIR
    INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"

    echo -e "${RED}${BOLD}WARNING: This will stop the service and remove the application files!${NC}"
    read -rp "Are you sure you want to proceed with uninstallation? (yes/NO): " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "Uninstallation cancelled."
        read -rp "Press Enter to return to main menu..."
        return 0
    fi

    # Mandatory Pre-Uninstall Backup
    if [ -d "$INSTALL_DIR" ]; then
        log_info "Creating mandatory safety backup before uninstallation..."
        local saved_backup=$(create_backup "$INSTALL_DIR" "pre_uninstall")
    fi

    # Stop and remove systemd service
    log_info "Stopping and disabling systemd service..."
    systemctl stop "$SERVICE_NAME" 2>/dev/null || true
    systemctl disable "$SERVICE_NAME" 2>/dev/null || true
    rm -f "/etc/systemd/system/${SERVICE_NAME}.service"
    systemctl daemon-reload

    # Remove Nginx configuration
    log_info "Removing Nginx configuration..."
    rm -f "/etc/nginx/sites-available/gamestan" "/etc/nginx/sites-enabled/gamestan" "/etc/nginx/conf.d/gamestan.conf"
    systemctl reload nginx 2>/dev/null || true

    # Remove application directory
    if [ -d "$INSTALL_DIR" ]; then
        log_info "Removing files from $INSTALL_DIR ..."
        rm -rf "$INSTALL_DIR"
    fi

    echo ""
    log_success "GameStan has been completely uninstalled from this system."
    if [ -n "$saved_backup" ]; then
        echo -e "Your data was safely backed up at: ${BOLD}${saved_backup}${NC}"
    fi
    read -rp "Press Enter to return to main menu..."
}

# ------------------------------------------------------------------------------
# Manual Backup Menu Item
# ------------------------------------------------------------------------------
manual_backup() {
    print_header
    echo -e "${GOLD}${BOLD}=== STEP 4: MANUAL BACKUP ===${NC}\n"

    read -rp "Enter Installation Directory [Default: $DEFAULT_INSTALL_DIR]: " INSTALL_DIR
    INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"

    create_backup "$INSTALL_DIR" "manual"
    read -rp "Press Enter to return to main menu..."
}

# ------------------------------------------------------------------------------
# Manual Restore Menu Item
# ------------------------------------------------------------------------------
manual_restore() {
    print_header
    echo -e "${GOLD}${BOLD}=== STEP 5: RESTORE FROM BACKUP ===${NC}\n"
    restore_backup
    read -rp "Press Enter to return to main menu..."
}

# ------------------------------------------------------------------------------
# Service Status & Live Logs
# ------------------------------------------------------------------------------
view_status_logs() {
    print_header
    echo -e "${GOLD}${BOLD}=== GAMESTAN SERVICE STATUS & LOGS ===${NC}\n"

    if systemctl is-active --quiet "$SERVICE_NAME"; then
        echo -e "Service Status: ${GREEN}${BOLD}ACTIVE (RUNNING)${NC}\n"
    else
        echo -e "Service Status: ${RED}${BOLD}INACTIVE / STOPPED${NC}\n"
    fi

    systemctl status "$SERVICE_NAME" --no-pager || true

    echo -e "\n${CYAN}--- Live Service Output (Last 25 Lines) ---${NC}"
    journalctl -u "$SERVICE_NAME" -n 25 --no-pager || true

    echo ""
    read -rp "Press Enter to return to main menu..."
}

# ------------------------------------------------------------------------------
# Main Interactive Menu Loop
# ------------------------------------------------------------------------------
main_menu() {
    check_root

    while true; do
        print_header
        echo -e "${BOLD}Please select an option:${NC}\n"
        echo -e "  [${GOLD}1${NC}] 🚀 ${BOLD}Install GameStan${NC} (Full Setup: Node.js, Nginx, Port, Domain, SSL, Service)"
        echo -e "  [${GOLD}2${NC}] 🔄 ${BOLD}Update GameStan${NC} (Auto-Backup -> Git Pull -> Build -> Restart)"
        echo -e "  [${GOLD}3${NC}] 🗑️  ${BOLD}Uninstall GameStan${NC} (Auto-Backup -> Remove Service & Files)"
        echo -e "  [${GOLD}4${NC}] 📦 ${BOLD}Create Backup Now${NC} (Save full snapshot to ${BACKUP_DIR})"
        echo -e "  [${GOLD}5${NC}] ⏪ ${BOLD}Restore from Backup${NC} (Restore previous archive)"
        echo -e "  [${GOLD}6${NC}] 📊 ${BOLD}Service Status & Logs${NC} (Inspect systemd status & journal logs)"
        echo -e "  [${GOLD}7${NC}] ♻️  ${BOLD}Restart GameStan Service${NC}"
        echo -e "  [${GOLD}8${NC}] ❌ ${BOLD}Exit${NC}"
        echo ""
        read -rp "Enter choice [1-8]: " choice

        case $choice in
            1) install_gamestan ;;
            2) update_gamestan ;;
            3) uninstall_gamestan ;;
            4) manual_backup ;;
            5) manual_restore ;;
            6) view_status_logs ;;
            7)
                log_info "Restarting ${SERVICE_NAME} service..."
                systemctl restart "${SERVICE_NAME}"
                log_success "Service restarted!"
                sleep 1.5
                ;;
            8|q|Q)
                echo -e "\n${GOLD}Thank you for using GameStan Platform Installer! Goodbye.${NC}\n"
                exit 0
                ;;
            *)
                log_error "Invalid option. Please choose between 1 and 8."
                sleep 1
                ;;
        esac
    done
}

# Run Main
main_menu
