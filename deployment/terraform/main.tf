# Terraform configuration for Cloudflare serverless infrastructure
# Deploys D1 database, R2 storage, Workers, and DNS configuration

terraform {
  required_version = ">= 1.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

# Variables
variable "cloudflare_api_token" {
  description = "Cloudflare API Token with appropriate permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the Pterodactyl panel"
  type        = string
  default     = "panel.example.com"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "pterodactyl-panel"
}

# Data sources
data "cloudflare_zone" "domain" {
  name = replace(var.domain_name, "/^[^.]+\\./", "")
}

# Random password for encryption keys
resource "random_password" "app_key" {
  length  = 32
  special = true
}

resource "random_password" "db_encryption_key" {
  length  = 32
  special = false
}

# D1 Database
resource "cloudflare_d1_database" "pterodactyl" {
  account_id = var.cloudflare_account_id
  name       = "${var.project_name}-${var.environment}"
}

# R2 Bucket for file storage
resource "cloudflare_r2_bucket" "pterodactyl_files" {
  account_id = var.cloudflare_account_id
  name       = "${var.project_name}-files-${var.environment}"
  location   = "auto"
}

# R2 Bucket for backups
resource "cloudflare_r2_bucket" "pterodactyl_backups" {
  account_id = var.cloudflare_account_id
  name       = "${var.project_name}-backups-${var.environment}"
  location   = "auto"
}

# KV Namespace for cache
resource "cloudflare_workers_kv_namespace" "cache" {
  account_id = var.cloudflare_account_id
  title      = "${var.project_name}-cache-${var.environment}"
}

# KV Namespace for sessions
resource "cloudflare_workers_kv_namespace" "sessions" {
  account_id = var.cloudflare_account_id
  title      = "${var.project_name}-sessions-${var.environment}"
}

# Workers Script for the main application
resource "cloudflare_worker_script" "pterodactyl_panel" {
  account_id = var.cloudflare_account_id
  name       = "${var.project_name}-${var.environment}"
  content    = file("${path.module}/../workers/panel.js")

  # Environment variables
  plain_text_binding {
    name = "ENVIRONMENT"
    text = var.environment
  }

  plain_text_binding {
    name = "APP_NAME"
    text = "Pterodactyl Panel"
  }

  secret_text_binding {
    name = "APP_KEY"
    text = random_password.app_key.result
  }

  secret_text_binding {
    name = "DB_ENCRYPTION_KEY"
    text = random_password.db_encryption_key.result
  }

  # D1 database binding
  d1_database_binding {
    name        = "DB"
    database_id = cloudflare_d1_database.pterodactyl.id
  }

  # R2 bucket bindings
  r2_bucket_binding {
    name        = "FILES_BUCKET"
    bucket_name = cloudflare_r2_bucket.pterodactyl_files.name
  }

  r2_bucket_binding {
    name        = "BACKUPS_BUCKET"
    bucket_name = cloudflare_r2_bucket.pterodactyl_backups.name
  }

  # KV namespace bindings
  kv_namespace_binding {
    name         = "CACHE"
    namespace_id = cloudflare_workers_kv_namespace.cache.id
  }

  kv_namespace_binding {
    name         = "SESSIONS"
    namespace_id = cloudflare_workers_kv_namespace.sessions.id
  }

  # Analytics binding
  analytics_engine_binding {
    name = "ANALYTICS"
  }
}

# DNS record for the panel
resource "cloudflare_record" "panel" {
  zone_id = data.cloudflare_zone.domain.id
  name    = var.domain_name
  value   = "${var.project_name}-${var.environment}.${var.cloudflare_account_id}.workers.dev"
  type    = "CNAME"
  proxied = true
  comment = "Pterodactyl Panel - Managed by Terraform"
}

# Page Rules for optimization
resource "cloudflare_page_rule" "panel_api_cache" {
  zone_id  = data.cloudflare_zone.domain.id
  target   = "${var.domain_name}/api/*"
  priority = 1

  actions {
    cache_level = "bypass"
    disable_performance = true
  }
}

resource "cloudflare_page_rule" "panel_static_cache" {
  zone_id  = data.cloudflare_zone.domain.id
  target   = "${var.domain_name}/assets/*"
  priority = 2

  actions {
    cache_level         = "cache_everything"
    edge_cache_ttl      = 31536000  # 1 year
    browser_cache_ttl   = 31536000  # 1 year
  }
}

# WAF Rules for security
resource "cloudflare_ruleset" "panel_security" {
  zone_id = data.cloudflare_zone.domain.id
  name    = "${var.project_name}-security-${var.environment}"
  kind    = "zone"
  phase   = "http_request_firewall_custom"

  rules {
    action = "block"
    expression = "(http.request.uri.path contains \"/admin\" and not ip.src in {1.2.3.4 2.3.4.5})"
    description = "Block admin access from unauthorized IPs"
    enabled = true
  }

  rules {
    action = "challenge"
    expression = "(http.request.uri.path contains \"/api/\" and rate(1m) > 100)"
    description = "Challenge high API request rates"
    enabled = true
  }
}

# Rate limiting
resource "cloudflare_rate_limit" "api_requests" {
  zone_id = data.cloudflare_zone.domain.id
  
  threshold = 60
  period    = 60
  
  match {
    request {
      url_pattern = "${var.domain_name}/api/*"
      schemes     = ["HTTP", "HTTPS"]
      methods     = ["GET", "POST", "PUT", "DELETE", "PATCH"]
    }
  }
  
  action {
    mode    = "simulate"  # Change to "ban" for production
    timeout = 600
    response {
      content_type = "application/json"
      body         = "{\"error\": \"Rate limit exceeded\"}"
    }
  }
  
  correlate {
    by = "nat"
  }
  
  disabled = false
  description = "API rate limiting for Pterodactyl Panel"
}

# Output values
output "d1_database_id" {
  description = "D1 Database ID"
  value       = cloudflare_d1_database.pterodactyl.id
}

output "r2_files_bucket" {
  description = "R2 Files Bucket Name"
  value       = cloudflare_r2_bucket.pterodactyl_files.name
}

output "r2_backups_bucket" {
  description = "R2 Backups Bucket Name"
  value       = cloudflare_r2_bucket.pterodactyl_backups.name
}

output "worker_url" {
  description = "Cloudflare Worker URL"
  value       = "https://${var.project_name}-${var.environment}.${var.cloudflare_account_id}.workers.dev"
}

output "panel_url" {
  description = "Panel URL"
  value       = "https://${var.domain_name}"
}

output "cache_namespace_id" {
  description = "KV Cache Namespace ID"
  value       = cloudflare_workers_kv_namespace.cache.id
}

output "sessions_namespace_id" {
  description = "KV Sessions Namespace ID"
  value       = cloudflare_workers_kv_namespace.sessions.id
}

output "app_key" {
  description = "Generated App Key"
  value       = random_password.app_key.result
  sensitive   = true
}

# Local file outputs for environment configuration
resource "local_file" "env_production" {
  content = templatefile("${path.module}/templates/env.tpl", {
    environment           = var.environment
    domain_name          = var.domain_name
    d1_database_id       = cloudflare_d1_database.pterodactyl.id
    r2_files_bucket      = cloudflare_r2_bucket.pterodactyl_files.name
    r2_backups_bucket    = cloudflare_r2_bucket.pterodactyl_backups.name
    cache_namespace_id   = cloudflare_workers_kv_namespace.cache.id
    sessions_namespace_id = cloudflare_workers_kv_namespace.sessions.id
    app_key              = random_password.app_key.result
    db_encryption_key    = random_password.db_encryption_key.result
  })
  filename = "${path.module}/../../.env.${var.environment}"
}

# Terraform backend configuration (optional)
terraform {
  backend "s3" {
    # Uncomment and configure for remote state storage
    # bucket = "your-terraform-state-bucket"
    # key    = "pterodactyl-panel/terraform.tfstate"
    # region = "us-east-1"
  }
}