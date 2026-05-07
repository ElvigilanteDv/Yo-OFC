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

echo -e "\e[1;34m[2/6] Actualizando paquetes del sistema...\e[0m"
pkg update -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"
pkg upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"

echo -e "\e[1;34m[3/6] Instalando Git y Node.js...\e[0m"
pkg install git nodejs -y

echo -e "\e[1;34m[4/6] Clonando el repositorio...\e[0m"
if [ -d "Kazuma-Mr-Bot" ]; then
  echo -e "\e[1;33m[!] La carpeta ya existe. Actualizando repositorio...\e[0m"
  cd Kazuma-Mr-Bot
  git pull
else
  git clone https://github.com/Dev-FelixOfc/Kazuma-Mr-Bot
  cd Kazuma-Mr-Bot
fi

echo -e "\e[1;34m[5/6] Instalando dependencias (npm install)...\e[0m"
echo -e "\e[1;33m[!] Esto puede tardar unos minutos, por favor espere.\e[0m"
npm install --quiet

clear
echo -e "\e[1;32m┏━━━━✿︎ INSTALACIÓN COMPLETADA ✿︎━━━━╮\e[0m"
echo -e "\e[1;32m┃ \e[0m\e[1;33m✐ Todo está listo.\e[0m"
echo -e "\e[1;32m┃ \e[0m\e[1;32m✐ Para iniciar el bot, escribe:\e[0m"
echo -e "\e[1;32m┃ \e[0m\e[1;97m   npm start\e[0m"
echo -e "\e[1;32m╰━━━━━━━━━━━━━━━━━━━━━━╯\e[0m"
echo ""