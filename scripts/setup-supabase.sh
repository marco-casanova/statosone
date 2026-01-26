#!/bin/bash
# ===========================================
# STRATOS SUPABASE SETUP SCRIPT
# ===========================================
# Single Supabase project for all apps
# ===========================================

set -e

echo "🚀 Stratos Supabase Setup (Single Project)"
echo "==========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "What would you like to do?"
echo ""
echo "1) Setup instructions (start here)"
echo "2) Copy .env.example to all apps"
echo "3) View the SQL schema"
echo "4) Copy SQL to clipboard (macOS)"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}📋 SETUP INSTRUCTIONS${NC}"
        echo "==========================================="
        echo ""
        echo -e "${CYAN}Step 1: Create Supabase Project${NC}"
        echo "   → Go to: https://supabase.com/dashboard"
        echo "   → Click 'New Project'"
        echo "   → Name it: stratos (or any name)"
        echo "   → Choose a region close to you"
        echo "   → Wait for it to be ready (~2 min)"
        echo ""
        echo -e "${CYAN}Step 2: Run the SQL Schema${NC}"
        echo "   → In your project, go to SQL Editor"
        echo "   → Click 'New Query'"
        echo "   → Copy contents of: scripts/supabase-schema.sql"
        echo "   → Click 'Run' (or Cmd+Enter)"
        echo "   → You should see '✅ All tables verified!'"
        echo ""
        echo -e "${CYAN}Step 3: Get Your API Keys${NC}"
        echo "   → Go to: Project Settings → API"
        echo "   → Copy these values:"
        echo "      • Project URL"
        echo "      • anon public key"
        echo "      • service_role key (keep secret!)"
        echo ""
        echo -e "${CYAN}Step 4: Configure Apps${NC}"
        echo "   → Run this script with option 2"
        echo "   → Edit each .env.local with your keys"
        echo ""
        echo -e "${CYAN}Step 5: Create Admin User${NC}"
        echo "   → Sign up in any app"
        echo "   → Run in SQL Editor:"
        echo "      UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';"
        echo ""
        ;;
    2)
        echo ""
        echo -e "${BLUE}📁 Copying .env.example files...${NC}"
        echo ""
        
        apps=("x_kin_relay" "stratostalent" "dreamnest" "kellersharer" "stratoshome")
        
        for app in "${apps[@]}"; do
            env_example="$ROOT_DIR/apps/$app/.env.example"
            env_local="$ROOT_DIR/apps/$app/.env.local"
            
            if [ -f "$env_example" ]; then
                if [ ! -f "$env_local" ]; then
                    cp "$env_example" "$env_local"
                    echo -e "${GREEN}✓ Created apps/$app/.env.local${NC}"
                else
                    echo -e "${YELLOW}⚠ apps/$app/.env.local already exists (skipped)${NC}"
                fi
            else
                echo -e "${YELLOW}⚠ apps/$app/.env.example not found${NC}"
            fi
        done
        
        echo ""
        echo -e "${GREEN}Now edit each .env.local with your Supabase credentials:${NC}"
        echo ""
        echo "NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co"
        echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ..."
        echo "SUPABASE_SERVICE_ROLE_KEY=eyJ..."
        echo ""
        ;;
    3)
        echo ""
        echo -e "${BLUE}📄 SQL Schema Location:${NC}"
        echo "   $SCRIPT_DIR/supabase-schema.sql"
        echo ""
        echo "Table prefixes:"
        echo "   profiles   → Shared auth (all apps)"
        echo "   kr_*       → KinRelay"
        echo "   st_*       → StratosTalent"
        echo "   dn_*       → DreamNest"
        echo "   ks_*       → KellerSharer"
        echo "   sh_*       → StratosHome"
        echo ""
        echo "View with: cat $SCRIPT_DIR/supabase-schema.sql"
        ;;
    4)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            cat "$SCRIPT_DIR/supabase-schema.sql" | pbcopy
            echo ""
            echo -e "${GREEN}✓ SQL copied to clipboard!${NC}"
            echo ""
            echo "Now:"
            echo "1. Go to Supabase Dashboard → SQL Editor"
            echo "2. Click 'New Query'"
            echo "3. Paste (Cmd+V)"
            echo "4. Click 'Run'"
        else
            echo "This option is for macOS only."
            echo "Copy the file manually: scripts/supabase-schema.sql"
        fi
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Done!${NC}"
