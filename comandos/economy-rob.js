import { config } from '../config.js';
import { database } from '../database.js';

const robCommand = {
    name: 'rob',
    alias: ['robar', 'asaltar'],
    category: 'economy',
    desc: 'Sustrae todo el efectivo de la cartera de un usuario inactivo.',
    noPrefix: true,

    run: async (conn, m, { args }) => {
        try {
            const thiefJid = m.sender;
            let targetJid = m.quoted ? (m.quoted.sender || m.quoted.key.participant) : m.mentionedJid?.[0];

            if (!targetJid && args[0]) {
                targetJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }

            if (!targetJid) return m.reply(`*${config.visuals.emoji2}* \`Error de objetivo\`\n\nDebes mencionar o responder a alguien.`);
            if (thiefJid === targetJid) return m.reply(`*${config.visuals.emoji2}* No puedes robarte a ti mismo.`);

            const ahora = Date.now();
            let userThief = await database.getUser(thiefJid);
            let userVictim = await database.getUser(targetJid);

            if (!userThief) userThief = { wallet: 0, lastRob: 0 };
            if (!userVictim || Number(userVictim.wallet || 0) <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`BILLETERA VACÍA\`\n\nEste usuario no lleva nada encima.`);
            }

            const cooldown = 60 * 60 * 1000;
            const tiempoPasado = ahora - (Number(userThief.lastRob) || 0);

            if (tiempoPasado < cooldown) {
                const restante = Math.floor((cooldown - tiempoPasado) / 60000);
                return m.reply(`*${config.visuals.emoji2}* \`AGITAMIENTO\`\n\nEstás cansado. Espera **${restante}m**.`);
            }

            const lastActive = global.lastMessageMap.get(targetJid) || 0;
            if ((ahora - lastActive) < 30 * 60 * 1000) {
                return m.reply(`*${config.visuals.emoji2}* \`OBJETIVO ALERTA\`\n\nSolo puedes robar a quienes no han hablado en los últimos 30 minutos.`);
            }

            const botin = Number(userVictim.wallet);
            userVictim.wallet = 0;
            userThief.wallet = Number(userThief.wallet || 0) + botin;
            userThief.lastRob = ahora;

            await database.saveUser(thiefJid, userThief);
            await database.saveUser(targetJid, userVictim);

            const victimId = targetJid.split('@')[0].split(':')[0];
            let texto = `*${config.visuals.emoji3}* \`¡GOLPE MAESTRO!\` *${config.visuals.emoji3}*\n\n`;
            texto += `Has dejado en la calle a @${victimId}.\n`;
            texto += `*${config.visuals.emoji} Botín Total:* ¥${botin.toLocaleString()}\n\n`;
            texto += `> ¡Más vale que corras antes de que revise su cuenta!`;

            await conn.sendMessage(m.chat, { text: texto, mentions: [targetJid] }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el asalto.`);
        }
    }
};

export default robCommand;
