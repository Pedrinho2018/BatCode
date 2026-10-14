#!/usr/bin/env bash
# Remove o BatCode do menu de aplicativos. Não apaga a pasta do projeto.
set -euo pipefail

rm -f "$HOME/.local/share/applications/batcode.desktop"
rm -f "$HOME/.local/share/icons/hicolor/256x256/apps/batcode.png"

command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$HOME/.local/share/applications" || true
command -v gtk-update-icon-cache   >/dev/null 2>&1 && gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true

echo "BatCode removido do menu."
echo "Seu progresso continua salvo. Pra apagar também: rm -rf ~/.config/batcode-app"
