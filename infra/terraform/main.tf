terraform {
  required_version = ">= 1.6"

  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

# ------------------------------------------------------------------
# Existing Droplet (imported, not created by Terraform)
# Import with: terraform import digitalocean_droplet.ctl <DROPLET_ID>
# ------------------------------------------------------------------
resource "digitalocean_droplet" "ctl" {
  name   = var.droplet_name
  region = var.droplet_region
  size   = var.droplet_size
  image  = var.droplet_image

  # Prevent accidental destruction when plan detects any drift.
  lifecycle {
    prevent_destroy = true
    # Ignore fields Terraform cannot reconcile on an imported Droplet
    # without forcing a replacement (ssh_keys were added via the DO UI,
    # user_data hash is unknown after first boot, etc.)
    ignore_changes = [
      ssh_keys,
      user_data,
      tags,
    ]
  }
}

# ------------------------------------------------------------------
# Cloud Firewall — only 22, 80, 443 reachable from the internet
# ------------------------------------------------------------------
resource "digitalocean_firewall" "ctl" {
  name = "ctl-firewall"

  droplet_ids = [digitalocean_droplet.ctl.id]

  # Inbound: SSH
  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Inbound: HTTP
  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Inbound: HTTPS (for when TLS + domain is added later)
  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Outbound: allow all (DNS, Neon DB, OAuth, UploadThing, etc.)
  outbound_rule {
    protocol              = "tcp"
    port_range            = "all"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "all"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}
