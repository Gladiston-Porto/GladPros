#!/usr/bin/env bash
set -euo pipefail

# GitHub Branch and CI/CD Status Checker - Bash Version
# Works with local git repository and GitHub API

REPO_OWNER="Gladiston-Porto"
REPO_NAME="GladPros"
GITHUB_API="https://api.github.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Emojis
SUCCESS="✅"
FAILURE="❌"
WARNING="⚠️"
INFO="ℹ️"
ROCKET="🚀"
FOLDER="📁"
BRANCH="🌿"
GEAR="🔧"
CHART="📊"
HEALTH="🏥"

echo -e "${ROCKET} GitHub Branch and CI/CD Status Checker"
echo -e "${FOLDER} Repository: ${REPO_OWNER}/${REPO_NAME}"
echo "=================================================="

# Function to make GitHub API calls with curl
github_api() {
    local endpoint="$1"
    local headers=""
    
    if [[ -n "${GITHUB_TOKEN:-}" ]]; then
        headers="-H 'Authorization: token ${GITHUB_TOKEN}'"
    fi
    
    if command -v curl >/dev/null 2>&1; then
        eval "curl -s ${headers} -H 'Accept: application/vnd.github+json' -H 'User-Agent: GladPros-Checker' '${GITHUB_API}${endpoint}'"
    else
        echo "curl not available" >&2
        return 1
    fi
}

# Check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
        echo -e "${FAILURE} Not in a git repository"
        return 1
    fi
    return 0
}

# Check local branch status
check_local_branches() {
    echo -e "${BRANCH} Checking local branches..."
    
    if ! check_git_repo; then
        return 1
    fi
    
    local current_branch
    current_branch=$(git branch --show-current 2>/dev/null || echo "unknown")
    
    local total_branches
    total_branches=$(git branch -a | wc -l)
    
    local local_branches
    local_branches=$(git branch | wc -l)
    
    local remote_branches  
    remote_branches=$(git branch -r | grep -v HEAD | wc -l 2>/dev/null || echo "0")
    
    echo ""
    echo -e "${CHART} Local Branch Summary:"
    echo "   Current branch: ${current_branch}"
    echo "   Local branches: ${local_branches}"
    echo "   Remote branches: ${remote_branches}"
    echo "   Total branches: ${total_branches}"
    
    echo ""
    echo -e "📋 Recent branches:"
    git branch -v | head -10 | while read -r line; do
        echo "   $line"
    done
    
    # Check for uncommitted changes
    if ! git diff --quiet 2>/dev/null; then
        echo -e "   ${WARNING} Uncommitted changes detected"
    fi
    
    # Check if we're ahead/behind remote
    if git status --porcelain=v1 2>/dev/null | grep -q "^##.*ahead\|behind"; then
        echo -e "   ${WARNING} Local branch is ahead/behind remote"
    fi
}

# Check workflow files
check_workflow_files() {
    echo -e "${GEAR} Checking workflow files..."
    
    local workflows_dir=".github/workflows"
    
    if [[ ! -d "$workflows_dir" ]]; then
        echo -e "   ${FAILURE} No .github/workflows directory found"
        return 1
    fi
    
    local workflow_count
    workflow_count=$(find "$workflows_dir" -name "*.yml" -o -name "*.yaml" | wc -l)
    
    echo ""
    echo -e "${CHART} Workflow Files Summary:"
    echo "   Total workflows: ${workflow_count}"
    
    if [[ $workflow_count -gt 0 ]]; then
        echo -e "📋 Workflow files:"
        find "$workflows_dir" -name "*.yml" -o -name "*.yaml" | while read -r workflow; do
            local filename
            filename=$(basename "$workflow")
            local size
            size=$(wc -l < "$workflow" 2>/dev/null || echo "0")
            echo "   📄 $filename (${size} lines)"
            
            # Check for common workflow triggers
            if grep -q "push:" "$workflow" 2>/dev/null; then
                echo "      - Triggers on push"
            fi
            if grep -q "pull_request:" "$workflow" 2>/dev/null; then
                echo "      - Triggers on PR"
            fi
            if grep -q "schedule:" "$workflow" 2>/dev/null; then
                echo "      - Has scheduled runs"
            fi
        done
    fi
}

# Check GitHub status via API (if available)
check_github_status() {
    echo -e "${GEAR} Checking GitHub repository status..."
    
    if [[ -z "${GITHUB_TOKEN:-}" ]]; then
        echo -e "   ${WARNING} GITHUB_TOKEN not set - limited API access"
    fi
    
    # Try to get repository info
    local repo_info
    if repo_info=$(github_api "/repos/${REPO_OWNER}/${REPO_NAME}" 2>/dev/null); then
        echo ""
        echo -e "${CHART} Repository Information:"
        
        # Parse JSON manually for basic info (bash-friendly)
        if echo "$repo_info" | grep -q '"default_branch"'; then
            local default_branch
            default_branch=$(echo "$repo_info" | grep '"default_branch"' | cut -d'"' -f4)
            echo "   Default branch: ${default_branch}"
        fi
        
        if echo "$repo_info" | grep -q '"private"'; then
            local is_private
            is_private=$(echo "$repo_info" | grep '"private"' | grep -o 'true\|false')
            echo "   Visibility: $([ "$is_private" = "true" ] && echo "Private" || echo "Public")"
        fi
        
    else
        echo -e "   ${FAILURE} Unable to fetch repository information from GitHub API"
    fi
}

# Check recent git activity
check_recent_activity() {
    echo -e "${CHART} Checking recent activity..."
    
    if ! check_git_repo; then
        return 1
    fi
    
    echo ""
    echo -e "📋 Recent commits:"
    git log --oneline --graph --decorate -10 2>/dev/null || {
        echo -e "   ${FAILURE} Unable to get git log"
        return 1
    }
    
    echo ""
    echo -e "📋 Recent authors:"
    git log --pretty=format:"%an" -10 | sort | uniq -c | sort -nr | head -5 | while read -r count author; do
        echo "   $author ($count commits)"
    done
}

# Generate health summary
generate_health_summary() {
    echo ""
    echo -e "${HEALTH} Health Summary:"
    
    local issues=0
    local warnings=0
    
    # Check if we're in a git repo
    if ! check_git_repo; then
        echo -e "   🔴 Not in a git repository"
        issues=$((issues + 1))
    fi
    
    # Check for workflow files
    if [[ ! -d ".github/workflows" ]]; then
        echo -e "   🟡 No CI/CD workflows found"
        warnings=$((warnings + 1))
    else
        local workflow_count
        workflow_count=$(find ".github/workflows" -name "*.yml" -o -name "*.yaml" | wc -l)
        if [[ $workflow_count -eq 0 ]]; then
            echo -e "   🟡 No workflow files found"
            warnings=$((warnings + 1))
        else
            echo -e "   🟢 Found ${workflow_count} workflow files"
        fi
    fi
    
    # Check for uncommitted changes
    if git diff --quiet 2>/dev/null; then
        echo -e "   🟢 Working directory clean"
    else
        echo -e "   🟡 Uncommitted changes present"
        warnings=$((warnings + 1))
    fi
    
    # Overall health
    echo ""
    if [[ $issues -eq 0 && $warnings -eq 0 ]]; then
        echo -e "🟢 Overall Status: HEALTHY"
    elif [[ $issues -eq 0 ]]; then
        echo -e "🟡 Overall Status: MINOR ISSUES (${warnings} warnings)"
    else
        echo -e "🔴 Overall Status: NEEDS ATTENTION (${issues} issues, ${warnings} warnings)"
    fi
}

# Main execution
main() {
    check_local_branches
    echo ""
    check_workflow_files
    echo ""
    check_github_status
    echo ""
    check_recent_activity
    echo ""
    generate_health_summary
    
    echo ""
    echo "=================================================="
    echo -e "${SUCCESS} Status check completed!"
}

# Show help
show_help() {
    echo "GitHub Branch and CI/CD Status Checker"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  GITHUB_TOKEN   GitHub personal access token (optional)"
    echo ""
    echo "Examples:"
    echo "  $0"
    echo "  GITHUB_TOKEN=ghp_xxx $0"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        main
        ;;
esac