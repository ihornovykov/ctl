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
