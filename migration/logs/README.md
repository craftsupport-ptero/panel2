# Migration logs directory
# This directory contains logs from migration processes

## Log Files

- `migration-*.log` - Database migration logs
- `file-migration-*.log` - File migration logs  
- `validation-*.log` - Data validation logs
- `rollback-*.log` - Rollback operation logs
- `cleanup-*.log` - Post-migration cleanup logs

## Log Retention

Logs are automatically managed:
- Recent logs (last 30 days) are kept for troubleshooting
- Older logs are automatically archived
- Critical logs are preserved indefinitely

## Log Analysis

Use these commands to analyze logs:

```bash
# View recent migration activity
tail -f migration/logs/migration-*.log

# Search for errors
grep -i error migration/logs/*.log

# Monitor progress
grep -i progress migration/logs/*.log | tail -20
```