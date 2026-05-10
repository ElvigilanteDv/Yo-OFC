import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const economyPath = path.resolve('./config/database/economy/economy.json');

const addCoins = {
    name: 'addcoins',
    alias: ['darcoins', 'regalarcoins', 'givemoney'],
    category: 'owner',
    desc: 'Suma monedas directamente al banco de un usuario mencionado.',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const realOwnerNumber = (typeof config.owner[0] === 'string' ? config.owner[0] : config.owner[0][0]).replace(/\D/g, '');
            const senderNumber = m.sender.split('@')[0].replace(/\D/g, '');
            const isRealOwner = senderNumber === realOwnerNumber;

            if (!isRealOwner) {
                return m.reply(`*${config.visuals.emoji2}* \`ACCESO DENEGADO\` *${config.visuals.emoji2}*\n\nSolo el administrador principal tiene autoridad sobre este comando.`);
            }

            const group = m.chat;
            let targetJid = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender || m.quoted.key.participant || m.quoted.key.remoteJid : null;

            if (!targetJid) {
                return m.reply(`*${config.visuals.emoji2}* \`Falta Usuario\`\n\nMenciona a alguien o responde a su mensaje.`);
            }

            const user = targetJid.split('@')[0].split(':')[0];
            const cleanTargetJid = user + '@s.whatsapp.net';
            const monto = parseInt(args.find(arg => !isNaN(arg) && !arg.includes('@')));

            if (!monto || monto <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Monto Inválido\`\n\nIngresa una cantidad válida para enviar los coins.`);
            }

            if (!fs.existsSync(economyPath)) {
                return m.reply(`*${config.visuals.emoji2}* Base de datos no encontrada.`);
            }

            let ecoDb = JSON.parse(fs.readFileSync(economyPath, 'utf-8'));

            if (!ecoDb[group]) ecoDb[group] = {};
            
            if (!ecoDb[group][user]) {
                ecoDb[group][user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            ecoDb[group][user].bank = (Number(ecoDb[group][user].bank) || 0) + monto;

            fs.writeFileSync(economyPath, JSON.stringify(ecoDb, null, 2), 'utf-8');

            const texto = `*${config.visuals.emoji3}* \`MONEDAS ENVIADAS\` *${config.visuals.emoji3}*\n\n*❁ Usuario:* @${user}\n*❁ Cantidad:* \`¥${monto.toLocaleString()}\`\n*❁ Destino:* \`Banco\`\n\n> El dinero ha sido sumado con éxito en este grupo.`;

            await conn.sendMessage(m.chat, { 
                text: texto, 
                mentions: [cleanTargetJid] 
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error interno.`);
        }
    }
};

export default addCoins;