import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const shopPath = path.resolve('./config/database/gacha/gacha_shop.json');

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
            const giver = m.sender.split('@')[0].split(':')[0];
            const pjId = args[0];
            
            let targetJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);

            if (!pjId || !targetJid) {
                return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n\nIndica el ID y menciona al destinatario.\n> Ejemplo: #givepj 123 @usuario`);
            }

            const receiver = targetJid.split('@')[0].split(':')[0];
            if (giver === receiver) return m.reply(`*${config.visuals.emoji2}* No tiene sentido regalarte algo a ti mismo.`);

            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: DB Gacha no encontrada.`);
            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));

            if (!gachaDB[group] || !gachaDB[group][pjId]) {
                return m.reply(`*${config.visuals.emoji2}* El personaje con ID \`${pjId}\` no existe en este grupo.`);
            }

            const pj = gachaDB[group][pjId];
            if (pj.owner !== giver) {
                return m.reply(`*${config.visuals.emoji2}* ¡Ese personaje no te pertenece!`);
            }

            gachaDB[group][pjId].owner = receiver;
            gachaDB[group][pjId].status = 'domado';

            if (fs.existsSync(shopPath)) {
                let shopDB = JSON.parse(fs.readFileSync(shopPath, 'utf-8'));
                if (shopDB[group] && shopDB[group][pjId]) {
                    delete shopDB[group][pjId];
                    fs.writeFileSync(shopPath, JSON.stringify(shopDB, null, 2));
                }
            }

            fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3} \`TRANSFERENCIA EXITOSA\` ${config.visuals.emoji3}*\n\n@${giver} ha cedido a *${pj.name}* a @${receiver}.\n\n> ¡El harem de @${receiver} acaba de crecer!`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al procesar la donación.`);
        }
    }
};

export default givePjCommand;
