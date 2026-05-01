import fs from 'fs-extra';
import path from 'path';
import { config } from '../config.js';

const selfCommand = {
    name: 'self',
    alias: ['privado', 'soloyo'],
    category: 'sockets',
    desc: 'Activa/Desactiva el modo self (solo responde a la propia sesión).',
    isGroup: false,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix) => {
        if (!m.key.fromMe) return;

        const myJid = conn.user.id.split('@')[0].split(':')[0].replace(/\D/g, '');
        const subSessionsPath = path.resolve('./sesiones_subbots');
        const moodSessionsPath = path.resolve('./sesiones_moods');
        
        let sessionFolder = '';
        if (fs.existsSync(path.join(subSessionsPath, myJid))) {
            sessionFolder = path.join(subSessionsPath, myJid);
        } else if (fs.existsSync(path.join(moodSessionsPath, myJid))) {
            sessionFolder = path.join(moodSessionsPath, myJid);
        } else {
            return m.reply(`*${config.visuals.emoji2}* No se encontró la carpeta de esta sesión.`);
        }

        const selfFilePath = path.join(sessionFolder, 'self_status.json');
        
        if (!fs.existsSync(selfFilePath)) {
            await fs.writeJson(selfFilePath, { selfMode: false });
        }

        let data = await fs.readJson(selfFilePath);
        const action = args[0]?.toLowerCase();

        if (action === 'on') {
            data.selfMode = true;
            await fs.writeJson(selfFilePath, data);
            return m.reply(`*${config.visuals.emoji1}* *Modo Self Activado*\nIgnorando mensajes externos y ocultando actividad en consola.`);
        } else if (action === 'off') {
            data.selfMode = false;
            await fs.writeJson(selfFilePath, data);
            return m.reply(`*${config.visuals.emoji2}* *Modo Self Desactivado*\nEl bot vuelve a modo público.`);
        } else {
            return m.reply(`Uso: *${usedPrefix}self on* o *${usedPrefix}self off*`);
        }
    }
};

export default selfCommand;