import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

const givePjCommand = {
    name: 'givechar',
    alias: ['regalarpj', 'give'],
    category: 'gacha',
    desc: 'Transfiere la propiedad de uno de tus personajes a otro usuario del grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args) => {
        try {
            const group = m.chat;
            const giver = m.sender.replace(/:.*@/g, '@');
            const pjId = args[0];

            let rawTarget = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);

            if (!pjId || !rawTarget) {
                return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n\nIndica el ID y menciona al destinatario.\n> Ejemplo: #givepj 123 @usuario`);
            }

            const targetJid = rawTarget.replace(/:.*@/g, '@');

            if (giver === targetJid) return m.reply(`*${config.visuals.emoji2}* No tiene sentido regalarte algo a ti mismo.`);

            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: DB Gacha no encontrada.`);
            const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            const plantillaPersonajes = rawData[baseGroup];

            if (!plantillaPersonajes[pjId]) {
                return m.reply(`*${config.visuals.emoji2}* El personaje con ID \`${pjId}\` no existe.`);
            }

            if (!global.db.data.chats[group].gacha) global.db.data.chats[group].gacha = {};
            const dbGrupoGacha = global.db.data.chats[group].gacha;

            const pjInfoGrupo = dbGrupoGacha[pjId];

            if (!pjInfoGrupo || pjInfoGrupo.owner.replace(/:.*@/g, '@') !== giver) {
                return m.reply(`*${config.visuals.emoji2}* ¡Ese personaje no te pertenece!`);
            }

            dbGrupoGacha[pjId].owner = targetJid;
            dbGrupoGacha[pjId].status = 'domado';

            if (global.db.data.chats[group].shop && global.db.data.chats[group].shop[pjId]) {
                delete global.db.data.chats[group].shop[pjId];
            }

            const giverId = giver.split('@')[0];
            const receiverId = targetJid.split('@')[0];
            const pjNombre = plantillaPersonajes[pjId].name;

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3} \`TRANSFERENCIA EXITOSA\` ${config.visuals.emoji3}*\n\n@${giverId} ha cedido a *${pjNombre}* a @${receiverId}.\n\n> ¡El harem de @${receiverId} acaba de crecer!`,
                mentions: [giver, targetJid]
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar la donación.`);
        }
    }
};

export default givePjCommand;