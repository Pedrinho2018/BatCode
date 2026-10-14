#!/usr/bin/env bash
# Instala o BatCode no menu de aplicativos do Linux (GNOME/KDE/XFCE).
# Reversível: rode ./desinstalar.sh pra remover.
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/256x256/apps"
ATALHO="$DESKTOP_DIR/batcode.desktop"

mkdir -p "$DESKTOP_DIR" "$ICON_DIR"
chmod +x "$APP_DIR/batcode"

# ícone
if [[ -f "$APP_DIR/batcode.png" ]]; then
  cp "$APP_DIR/batcode.png" "$ICON_DIR/batcode.png"
fi

cat > "$ATALHO" <<EOF
[Desktop Entry]
Type=Application
Name=BatCode
GenericName=Curso de C++
Comment=Aprenda C++ e estruturas de dados voando com o Batu
Exec=$APP_DIR/batcode
Icon=batcode
Terminal=false
Categories=Education;Development;ComputerScience;
Keywords=cpp;c++;programacao;estrutura;dados;lista;curso;
StartupWMClass=batcode
EOF

chmod +x "$ATALHO"

# atualiza os caches (se as ferramentas existirem)
command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$DESKTOP_DIR" || true
command -v gtk-update-icon-cache   >/dev/null 2>&1 && gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true

echo "BatCode instalado."
echo "  menu:    procure por 'BatCode' nos aplicativos"
echo "  terminal: $APP_DIR/batcode"
echo "  remover:  $APP_DIR/desinstalar.sh"
