import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const setBotName = {
    name: 'setname',
    alias: ['setbotname', 'botname', 'nombrebot'],
    category: 'sockets',
    desc: 'Configura el nombre corto y largo de tu Socket personal.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const from = m.chat;
            const user = m.sender.split('@')[0].split(':')[0];
            const botNumber = conn.user.id.split(':')[0].replace(/\D/g, '');
            const isOwner = config.owner.includes(m.sender);

            const mainBotNumber = config.session_bot.replace(/\D/g, '');
            if (botNumber === mainBotNumber) {
                return await conn.sendMessage(from, { text: `*${config.visuals.emoji2}* Este comando no está disponible en el bot principal.` }, { quoted: m });
            }

            if (botNumber !== user && !isOwner) {
                return await conn.sendMessage(from, { text: `*${config.visuals.emoji2}* Solo el dueño de este socket puede personalizar su nombre.` }, { quoted: m });
            }

            const fullText = args.join(' ');
            if (!fullText) return m.reply(`*${config.visuals.emoji2}* Uso: #setname Corto/Nombre Largo`);

            let shortName, longName;
            if (fullText.includes('/')) {
                let [part1, ...part2] = fullText.split('/');
                shortName = part1.trim();
                longName = part2.join('/').trim();
                if (shortName.includes(' ')) return m.reply(`*${config.visuals.emoji2}* El nombre corto no puede tener espacios.`);
            } else {
                shortName = fullText.trim();
                longName = fullText.trim();
            }

            const subSessionsPath = path.resolve('./sesiones_subbots');
            const moodSessionsPath = path.resolve('./sesiones_moods');
            let userSettingsPath = '';

            if (await fs.pathExists(path.join(subSessionsPath, botNumber))) {
                userSettingsPath = path.join(subSessionsPath, botNumber, 'settings.json');
            } else if (await fs.pathExists(path.join(moodSessionsPath, botNumber))) {
                userSettingsPath = path.join(moodSessionsPath, botNumber, 'settings.json');
            } else {
                return m.reply(`*${config.visuals.emoji2}* Carpeta de sesión no encontrada.`);
            }

            let localConfig = (await fs.pathExists(userSettingsPath)) ? await fs.readJson(userSettingsPath) : {};
            localConfig.shortName = shortName;
            localConfig.longName = longName;
            localConfig.lastUpdate = Date.now();

            await fs.writeJson(userSettingsPath, localConfig, { spaces: 2 });
            await m.reply(`*${config.visuals.emoji3} \`CONFIGURACIÓN SOCKET\` ${config.visuals.emoji3}*\n\n*Corto:* ${shortName}\n*Largo:* ${longName}\n\n> Ajuste aplicado correctamente.`);
        } catch (e) {
            await m.reply(`*${config.visuals.emoji2}* Error al guardar el nombre.`);
        }
    }
};

export default setBotName;