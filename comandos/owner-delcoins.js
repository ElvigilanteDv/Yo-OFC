import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const economyPath = path.resolve('./config/database/economy/economy.json');

const removeCoins = {
    name: 'removecoins',
    alias: ['quitarcoins', 'delcoins', 'removerdinero'],
    category: 'owner',
    desc: 'Confisca monedas de un usuario (cartera y banco).',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const realOwnerNumber = (typeof config.owner[0] === 'string' ? config.owner[0] : config.owner[0][0]).replace(/\D/g, '');
            const senderNumber = m.sender.split('@')[0].replace(/\D/g, '');
            const isRealOwner = senderNumber === realOwnerNumber;

            if (!isRealOwner) {
                return m.reply(`*${config.visuals.emoji2}* \`ACCESO DENEGADO\` *${config.visuals.emoji2}*\n\nSolo el administrador principal tiene autoridad.`);
            }

            const group = m.chat;
            let targetJid = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender || m.quoted.key.participant || m.quoted.key.remoteJid : null;

            if (!targetJid) {
                return m.reply(`*${config.visuals.emoji2}* \`Usuario Requerido\`\n\nMenciona a alguien o responde a su mensaje.`);
            }

            const user = targetJid.split('@')[0].split(':')[0];
            const cleanTargetJid = user + '@s.whatsapp.net';
            const montoAQuitar = parseInt(args.find(arg => !isNaN(arg) && !arg.includes('@')));

            if (!montoAQuitar || montoAQuitar <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Monto Inválido\`\n\nIngresa una cantidad válida.`);
            }

            if (!fs.existsSync(economyPath)) return m.reply(`*${config.visuals.emoji2}* Base de datos no encontrada.`);
            let ecoDb = JSON.parse(fs.readFileSync(economyPath, 'utf-8'));

            if (!ecoDb[group] || !ecoDb[group][user] || ((Number(ecoDb[group][user].wallet) || 0) + (Number(ecoDb[group][user].bank) || 0)) <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Usuario Sin Fondos\`\n\n@${user} no tiene dinero en ninguna de sus cuentas.`, { mentions: [cleanTargetJid] });
            }

            let wallet = Number(ecoDb[group][user].wallet || 0);
            let bank = Number(ecoDb[group][user].bank || 0);
            let totalDisponible = wallet + bank;
            let retiradoReal = 0;

            if (totalDisponible < montoAQuitar) {
                retiradoReal = totalDisponible;
                wallet = 0;
                bank = 0;
            } else {
                retiradoReal = montoAQuitar;
                let restante = montoAQuitar;

                if (wallet >= restante) {
                    wallet -= restante;
                    restante = 0;
                } else {
                    restante -= wallet;
                    wallet = 0;
                }

                if (restante > 0) {
                    bank -= restante;
                }
            }

            ecoDb[group][user].wallet = wallet;
            ecoDb[group][user].bank = bank;

            fs.writeFileSync(economyPath, JSON.stringify(ecoDb, null, 2), 'utf-8');

            const texto = `*${config.visuals.emoji3}* \`SANCIÓN ECONÓMICA\` *${config.visuals.emoji3}*\n\n*❁ Usuario:* @${user}\n*❁ Monto Retirado:* \`¥${retiradoReal.toLocaleString()}\`\n\n*${config.visuals.emoji} Cartera Restante:* ¥${wallet.toLocaleString()}\n*${config.visuals.emoji4} Banco Restante:* ¥${bank.toLocaleString()}\n\n> Los fondos han sido procesados correctamente.`;

            await conn.sendMessage(m.chat, { 
                text: texto, 
                mentions: [cleanTargetJid] 
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error interno al procesar la sanción.`);
        }
    }
};

export default removeCoins;