#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

clear
echo -e "\e[1;36m┏━━━━✿︎ Kazuma-Mr-Bot ✿︎━━━━╮\e[0m"
echo -e "\e[1;36m┃ \e[0m\e[1;33m✐ Iniciando Instalador Automático\e[0m"
echo -e "\e[1;36m┃ \e[0m\e[1;32m✐ Preparando entorno Termux...\e[0m"
echo -e "\e[1;36m╰━━━━━━━━━━━━━━━━━━━╯\e[0m"
echo ""

echo -e "\e[1;34m[1/6] Configurando almacenamiento...\e[0m"
termux-setup-storage -y
sleep 2

echo -e "\e[1;34m[2/6] Actualizando paquetes y binarios...\e[0m"
pkg update -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"
pkg upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"

echo -e "\e[1;34m[3/6] Instalando herramientas de compilación...\e[0m"
pkg install git nodejs python build-essential ffmpeg libwebp -y

echo -e "\e[1;34m[4/6] Verificando repositorio...\e[0m"
if [ -d "Kazuma-Mr-Bot" ]; then
  cd Kazuma-Mr-Bot
fi

echo -e "\e[1;34m[5/6] Instalando dependencias (Modo Seguro)...\e[0m"
rm -rf node_modules package-lock.json
npm install --no-bin-links || npm install --legacy-peer-deps

echo -e "\e[1;34m[6/6] Forzando módulos críticos...\e[0m"
npm install @whiskeysockets/baileys pino qrcode-terminal 

clear
echo -e "\e[1;32m┏━━━━✿︎ INSTALACIÓN EXITOSA ✿︎━━━━╮\e[0m"
echo -e "\e[1;32m┃ \e[0m\e[1;33m✐ Todo se instaló correctamente.\e[0m"
echo -e "\e[1;32m┃ \e[0m\e[1;32m✐ El bot se iniciará automáticamente.\e[0m"
echo -e "\e[1;32m╰━━━━━━━━━━━━━━━━━━━━━━╯\e[0m"
echo ""

for i in {5..1}
do
   echo -ne "\e[1;33m>> Iniciando en $i...\r\e[0m"
   sleep 1
done

echo -e "\e[1;32m>> ¡ENCENDIENDO KAZUMA-BOT!          \e[0m"
npm start