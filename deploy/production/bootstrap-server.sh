#!/usr/bin/env bash
set -Eeuo pipefail

# Secure bootstrap for an Ubuntu 24.04 LTS OpenCRVS node.
# Run as a sudo-capable user. Review firewall rules before production use.

if [[ "${EUID}" -eq 0 ]]; then
  echo "Run this script as a normal sudo-capable user, not root." >&2
  exit 1
fi

if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo is required." >&2
  exit 1
fi

sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
  ca-certificates curl git jq rsync openssl ufw fail2ban auditd unattended-upgrades docker.io

sudo systemctl enable --now docker fail2ban auditd
sudo usermod -aG docker "$USER"

# Kernel/network hardening. Conservative values suitable for an Internet-facing node.
sudo tee /etc/sysctl.d/99-opencrvs-security.conf >/dev/null <<'EOF'
net.ipv4.conf.all.accept_redirects=0
net.ipv4.conf.default.accept_redirects=0
net.ipv4.conf.all.send_redirects=0
net.ipv4.conf.default.send_redirects=0
net.ipv4.conf.all.accept_source_route=0
net.ipv4.conf.default.accept_source_route=0
net.ipv4.tcp_syncookies=1
net.ipv4.icmp_echo_ignore_broadcasts=1
net.ipv4.conf.all.log_martians=1
net.ipv6.conf.all.accept_redirects=0
net.ipv6.conf.default.accept_redirects=0
kernel.kptr_restrict=2
kernel.dmesg_restrict=1
fs.protected_hardlinks=1
fs.protected_symlinks=1
EOF
sudo sysctl --system >/dev/null

# Host firewall: expose only SSH + HTTP/HTTPS.
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# SSH hardening is enabled only when at least one public key is already installed,
# preventing accidental lockout.
if [[ -s "$HOME/.ssh/authorized_keys" ]]; then
  sudo tee /etc/ssh/sshd_config.d/99-opencrvs-hardening.conf >/dev/null <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
X11Forwarding no
AllowAgentForwarding no
MaxAuthTries 4
LoginGraceTime 30
EOF
  sudo sshd -t
  sudo systemctl reload ssh || sudo systemctl reload sshd
else
  echo "WARNING: SSH password login was NOT disabled because no authorized_keys file was found."
fi

# Fail2ban SSH protection.
sudo tee /etc/fail2ban/jail.d/opencrvs-sshd.conf >/dev/null <<'EOF'
[sshd]
enabled = true
maxretry = 5
findtime = 10m
bantime = 1h
EOF
sudo systemctl restart fail2ban

# Automatic security patches.
sudo dpkg-reconfigure -f noninteractive unattended-upgrades || true

# Docker daemon hardening. Do not expose the Docker API over TCP.
sudo install -d -m 0755 /etc/docker
sudo tee /etc/docker/daemon.json >/dev/null <<'EOF'
{
  "live-restore": true,
  "no-new-privileges": true,
  "log-driver": "json-file",
  "log-opts": {"max-size": "10m", "max-file": "5"}
}
EOF
sudo systemctl restart docker

# Initialize a single-node Swarm for the pilot. Production HA should use >=3 managers.
if ! sudo docker info --format '{{.Swarm.LocalNodeState}}' | grep -q '^active$'; then
  sudo docker swarm init
fi

sudo install -d -o "$USER" -g "$USER" -m 0750 /opt/opencrvs-rdc

echo "Server bootstrap complete. Log out/in once so Docker group membership takes effect."
echo "For production HA, add private-network Swarm nodes and restrict ports 2377/7946/4789 to that private network only."
