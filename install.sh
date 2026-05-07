#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

clear
echo -e "\e[1;36m┏━━━━✿︎ Kazuma-Mr-Bot ✿︎━━━━╮\e[0m"
echo -e "\e[1;36m┃ \e[0m\e[1;33m✐ Iniciando Instalador Automático\e[0m"
echo -e "\e[1;36m┃ \e[0m\e[1;32m✐ Aplicando Modo Salto de Errores...\e[0m"
echo -e "\e[1;36m╰━━━━━━━━━━━━━━━━━━━╯\e[0m"
echo ""

echo -e "\e[1;34m[1/6] Configurando almacenamiento...\e[0m"
termux-setup-storage -y
sleep 2

echo -e "\e[1;34m[2/6] Reparando base de datos de paquetes...\e[0m"
pkg fix-missing -y
dpkg --configure -a

echo -e "\e[1;34m[3/6] Instalando binarios necesarios...\e[0m"
pkg install git nodejs python ffmpeg libwebp -y

echo -e "\e[1;34m[4/6] Entrando al repositorio...\e[0m"
if [ -d "Kazuma-Mr-Bot" ]; then
  cd Kazuma-Mr-Bot
fi

echo -e "\e[1;34m[5/6] Instalando dependencias (Omitiendo Binarios Conflictivos)...\e[0m"
rm -rf node_modules package-lock.json
# Esta línea es la que salvará la instalación:
npm config set ignore-scripts true
npm install --no-bin-links

echo -e "\e[1;34m[6/6] Instalando Baileys manualmente...\e[0m"
npm install @whiskeysockets/baileys pino qrcode-terminal

clear
echo -e "\e[1;32m┏━━━━✿︎ INSTALACIÓN FINALIZADA ✿︎━━━━╮\e[0m"
echo -e "\e[1;32m┃ \e[0m\e[1;33m✐ El bot iniciará omitiendo librerías pesadas.\e[0m"
echo -e "\e[1;32m┃ \e[0m\e[1;32m✐ Disfruta de Kazuma en Termux.\e[0m"
echo -e "\e[1;32m╰━━━━━━━━━━━━━━━━━━━━━━╯\e[0m"
echo ""

npm start