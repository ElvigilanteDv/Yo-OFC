#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

clear
echo -e "\e[1;36m┏━━━━✿︎ Kazuma-Mr-Bot ✿︎━━━━╮\e[0m"
echo -e "\e[1;36m┃ \e[0m\e[1;33m✐ Instalador Universal Pro\e[0m"
echo -e "\e[1;36m┃ \e[0m\e[1;32m✐ Pterodactyl • VPS • Termux\e[0m"
echo -e "\e[1;36m╰━━━━━━━━━━━━━━━━━━━╯\e[0m"
echo ""

# 1. Detección de Entorno
IS_TERMUX=false
if [[ $(command -v termux-setup-storage) ]]; then
    IS_TERMUX=true
    echo -e "\e[1;34m[!] Entorno Termux detectado. Aplicando optimizaciones...\e[0m"
    termux-setup-storage -y
    pkg fix-missing -y
    dpkg --configure -a
    pkg install git nodejs ffmpeg libwebp -y
else
    echo -e "\e[1;34m[!] Entorno Linux/Pterodactyl detectado.\e[0m"
fi

# 2. Instalación de Dependencias
echo -e "\e[1;34m[*] Instalando módulos de Node.js...\e[0m"
rm -rf node_modules package-lock.json

if [ "$IS_TERMUX" = true ]; then
    # Evita que librerías gráficas pesadas rompan la instalación en móvil
    npm config set ignore-scripts true
    npm install --no-bin-links
else
    npm install
fi

# 3. EL PARCHE MAESTRO (Compatibilidad Sharp)
# Esto busca cualquier intento de cargar 'sharp' y lo envuelve en un try-catch
# para que el bot no muera si la librería falla en Android.
echo -e "\e[1;34m[*] Aplicando parches de compatibilidad...\e[0m"
find . -type f -name "*.js" -exec sed -i "s/require('sharp')/eval('try { require(\"sharp\") } catch (e) { null }')/g" {} + 2>/dev/null

# 4. Finalización
clear
echo -e "\e[1;32m┏━━━━✿︎ INSTALACIÓN COMPLETADA ✿︎━━━━╮\e[0m"
echo -e "\e[1;32m┃ \e[0m\e[1;33m✐ El bot está configurado para este sistema.\e[0m"
echo -e "\e[1;32m┃ \e[0m\e[1;32m✐ Iniciando en 3 segundos...\e[0m"
echo -e "\e[1;32m╰━━━━━━━━━━━━━━━━━━━━━━╯\e[0m"
sleep 3

npm start