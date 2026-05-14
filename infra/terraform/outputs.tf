output "droplet_id" {
  description = "DigitalOcean Droplet ID"
  value       = digitalocean_droplet.ctl.id
}

output "droplet_public_ip" {
  description = "Public IPv4 address of the Droplet"
  value       = digitalocean_droplet.ctl.ipv4_address
}

output "droplet_name" {
  description = "Name of the Droplet"
  value       = digitalocean_droplet.ctl.name
}

output "firewall_id" {
  description = "ID of the attached cloud firewall"
  value       = digitalocean_firewall.ctl.id
}
