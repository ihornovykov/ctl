variable "do_token" {
  description = "DigitalOcean personal access token (DIGITALOCEAN_TOKEN env var is the alternative)"
  type        = string
  sensitive   = true
}

variable "droplet_id" {
  description = "Numeric ID of the existing Droplet (doctl compute droplet list)"
  type        = string
}

variable "droplet_name" {
  description = "Name of the Droplet as shown in DigitalOcean control panel"
  type        = string
  default     = "code-to-learn"
}

variable "droplet_region" {
  description = "Region slug of the existing Droplet"
  type        = string
  default     = "fra1"
}

variable "droplet_size" {
  description = "Size slug of the existing Droplet (doctl compute size list)"
  type        = string
  default     = "s-1vcpu-2gb"
}

variable "droplet_image" {
  description = "Image slug/ID used when the Droplet was created (only used when Terraform re-creates)"
  type        = string
  default     = "ubuntu-24-04-x64"
}

variable "ssh_allowlist_cidrs" {
  description = <<-EOT
    CIDR blocks allowed to reach TCP 22 (SSH) on the Droplet. Use one /32 per IPv4 (e.g. ["203.0.113.7/32"]).
    Update when your ISP or Wi-Fi changes your public IP (curl -4 https://api.ipify.org).
    If GitHub Actions deploys over SSH from ubuntu-latest, runners use GitHub IP ranges — either add
    the "actions" CIDRs from https://api.github.com/meta or switch to a deploy path that does not need inbound 22 from GitHub.
  EOT
  type = list(string)
}
