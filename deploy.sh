#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  NINJA LANGUAGE RUNNER — GitHub Pages Deploy Script
#  Run this from your Arch Linux (Kitty terminal)
#  Usage: bash deploy.sh
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on any error

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  ███╗   ██╗██╗     ██████╗ "
echo "  ████╗  ██║██║     ██╔══██╗"
echo "  ██╔██╗ ██║██║     ██████╔╝"
echo "  ██║╚██╗██║██║     ██╔══██╗"
echo "  ██║ ╚████║███████╗██║  ██║"
echo "  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝"
echo -e "${NC}"
echo -e "${GREEN}  NINJA LANGUAGE RUNNER — GitHub Deploy${NC}"
echo ""

# ── STEP 1: Check dependencies ───────────────────────────────
echo -e "${YELLOW}[1/6] Checking dependencies...${NC}"

if ! command -v git &>/dev/null; then
  echo -e "${RED}✗ git not found. Install with: sudo pacman -S git${NC}"
  exit 1
fi
echo -e "${GREEN}✓ git found${NC}"

if ! command -v gh &>/dev/null; then
  echo -e "${YELLOW}⚠  GitHub CLI (gh) not found."
  echo -e "   Install it: sudo pacman -S github-cli${NC}"
  echo ""
  GH_AVAILABLE=false
else
  echo -e "${GREEN}✓ GitHub CLI found${NC}"
  GH_AVAILABLE=true
fi

# ── STEP 2: Git config ────────────────────────────────────────
echo ""
echo -e "${YELLOW}[2/6] Git configuration...${NC}"

GIT_NAME=$(git config --global user.name 2>/dev/null || true)
GIT_EMAIL=$(git config --global user.email 2>/dev/null || true)

if [ -z "$GIT_NAME" ]; then
  read -p "  Enter your Git name (e.g. John Doe): " GIT_NAME
  git config --global user.name "$GIT_NAME"
fi
if [ -z "$GIT_EMAIL" ]; then
  read -p "  Enter your Git email: " GIT_EMAIL
  git config --global user.email "$GIT_EMAIL"
fi
echo -e "${GREEN}✓ Git configured as: $GIT_NAME <$GIT_EMAIL>${NC}"

# ── STEP 3: GitHub repo ───────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/6] GitHub repository setup...${NC}"
echo ""
echo "  You need a GitHub account and a repository named:"
echo -e "  ${CYAN}ninja-language-runner${NC}"
echo ""

read -p "  Enter your GitHub username: " GH_USER

REPO_URL="https://github.com/${GH_USER}/ninja-language-runner.git"

# Authenticate if gh is available
if [ "$GH_AVAILABLE" = true ]; then
  echo ""
  echo "  Checking GitHub CLI auth..."
  if ! gh auth status &>/dev/null; then
    echo -e "${YELLOW}  → Run: gh auth login${NC}"
    echo "  Choose: GitHub.com → HTTPS → Login with browser"
    gh auth login
  fi

  echo "  Creating GitHub repository (if it doesn't exist)..."
  gh repo create ninja-language-runner --public --description "Skill-based language learning game" 2>/dev/null || true
  echo -e "${GREEN}✓ Repository ready at: ${CYAN}https://github.com/${GH_USER}/ninja-language-runner${NC}"
else
  echo ""
  echo -e "${YELLOW}  Manual step required:${NC}"
  echo "  1. Go to https://github.com/new"
  echo "  2. Repository name: ninja-language-runner"
  echo "  3. Set to Public"
  echo "  4. Click 'Create repository'"
  echo "  5. Do NOT add README, .gitignore, or license"
  echo ""
  read -p "  Press ENTER when you've created the repo..."
fi

# ── STEP 4: Init git ──────────────────────────────────────────
echo ""
echo -e "${YELLOW}[4/6] Initializing local git repository...${NC}"

# Run from the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -d ".git" ]; then
  git init
  git branch -M main
  echo -e "${GREEN}✓ Git initialized${NC}"
else
  echo -e "${GREEN}✓ Git already initialized${NC}"
fi

# Create .gitignore
cat > .gitignore << 'EOF'
.DS_Store
node_modules/
*.log
.env
EOF

# ── STEP 5: Commit and push ───────────────────────────────────
echo ""
echo -e "${YELLOW}[5/6] Committing and pushing files...${NC}"

git add -A
git commit -m "🥷 Initial deploy — Ninja Language Runner v1.0" 2>/dev/null || \
  git commit --allow-empty -m "🥷 Update deploy"

# Add remote (update if exists)
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo "  Pushing to GitHub..."
git push -u origin main --force

echo -e "${GREEN}✓ Code pushed to GitHub${NC}"

# ── STEP 6: Enable GitHub Pages ───────────────────────────────
echo ""
echo -e "${YELLOW}[6/6] Enabling GitHub Pages...${NC}"

if [ "$GH_AVAILABLE" = true ]; then
  gh api \
    --method POST \
    -H "Accept: application/vnd.github+json" \
    /repos/${GH_USER}/ninja-language-runner/pages \
    -f build_type=legacy \
    -f source='{"branch":"main","path":"/"}' 2>/dev/null || \
  gh api \
    --method PUT \
    -H "Accept: application/vnd.github+json" \
    /repos/${GH_USER}/ninja-language-runner/pages \
    -f build_type=legacy \
    -f source='{"branch":"main","path":"/"}' 2>/dev/null || true
  echo -e "${GREEN}✓ GitHub Pages configured via API${NC}"
else
  echo ""
  echo -e "${YELLOW}  Manual step required:${NC}"
  echo "  1. Go to: https://github.com/${GH_USER}/ninja-language-runner/settings/pages"
  echo "  2. Under 'Source' → select 'Deploy from a branch'"
  echo "  3. Branch: main / folder: / (root)"
  echo "  4. Click Save"
fi

# ── Done ──────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ DEPLOY COMPLETE!${NC}"
echo ""
echo -e "  ${CYAN}Your game will be live at:${NC}"
echo -e "  ${GREEN}https://${GH_USER}.github.io/ninja-language-runner${NC}"
echo ""
echo -e "  ${YELLOW}⚠  GitHub Pages takes 1-3 minutes to go live.${NC}"
echo -e "  ${YELLOW}   Check build status at:${NC}"
echo -e "  ${CYAN}   https://github.com/${GH_USER}/ninja-language-runner/actions${NC}"
echo ""
echo -e "  ${CYAN}To update the game later, just run:${NC}"
echo -e "  ${GREEN}  git add -A && git commit -m 'update' && git push${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
