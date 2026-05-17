import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { database } from '../database.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

const givePjCommand = {
    name: 'givechar',
    alias: ['regalarpj', 'give'],
    category: 'gacha',
    desc: 'Transfiere la propiedad de uno de tus personajes a otro usuario del grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, { args }) => {
        try {
            const group = m.chat;
            const giverJid = m.sender;
            const pjId = args[0];

            let targetJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);

            if (!pjId || !targetJid) {
                return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n\nIndica el ID y menciona al destinatario.`);
            }

            if (giverJid === targetJid) return m.reply(`*${config.visuals.emoji2}* No te lo puedes regalar a ti mismo.`);

            const infoPj = await database.getCharacterOwner(group, pjId);

            if (!infoPj || infoPj.owner !== giverJid) {
                return m.reply(`*${config.visuals.emoji2}* ¡Ese personaje no te pertenece o no existe!`);
            }

            // Actualizamos en la base de datos
            await database.updateCharacterOwner(group, pjId, targetJid);
            // Si estaba en la tienda, lo quitamos
            await database.removeFromShop(group, pjId);

            const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            const pjNombre = rawData[baseGroup][pjId]?.name || "Personaje";

            const giverId = giverJid.split('@')[0].split(':')[0];
            const receiverId = targetJid.split('@')[0].split(':')[0];

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3} \`TRANSFERENCIA EXITOSA\` ${config.visuals.emoji3}*\n\n@${giverId} ha cedido a *${pjNombre}* a @${receiverId}.\n\n> ¡El harem de @${receiverId} acaba de crecer!`,
                mentions: [giverJid, targetJid]
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar la donación.`);
        }
    }
};

export default givePjCommand;