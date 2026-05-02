import { config } from '../config.js';
import axios from 'axios';

const qrcodeCommand = {
    name: 'qrcode',
    alias: ['qr', 'codigoqr'],
    category: 'tools',
    desc: 'Convierte un texto en un código QR usando la API de Kazuma.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            if (!text) {
                return m.reply(`*${config.visuals.emoji2}* Por favor, ingresa el texto que deseas convertir a QR.\n\nEjemplo:\n*${usedPrefix}${commandName}* https://github.com/FelixOfc`);
            }

            const apiUrl = `https://api.kazuma.giize.com/api/tools/qr?text=${encodeURIComponent(text)}`;

            await conn.sendMessage(m.chat, { 
                image: { url: apiUrl }, 
                caption: `*${config.visuals.emoji1}* Aquí tienes tu código QR.\n\n*Texto:* ${text}` 
            }, { quoted: m });

        } catch (e) {
            console.error('Error en QRCode:', e);
            m.reply(`*${config.visuals.emoji2}* No se pudo generar el código QR. Inténtalo más tarde.`);
        }
    }
};

export default qrcodeCommand;