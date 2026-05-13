import { config } from '../config.js';

const robCommand = {
    name: 'rob',
    alias: ['robar', 'asaltar'],
    category: 'economy',
    desc: 'Sustrae todo el efectivo de la cartera de un usuario inactivo.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const thief = m.sender.replace(/:.*@/g, '@');
            let rawTarget = m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : m.mentionedJid?.[0];

            if (!rawTarget && args[0]) {
                rawTarget = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }

            if (!rawTarget) return m.reply(`*${config.visuals.emoji2}* \`Error de objetivo\`\n\nDebes mencionar o responder a alguien.`);
            const targetJid = rawTarget.replace(/:.*@/g, '@');

            if (thief === targetJid) return m.reply(`*${config.visuals.emoji2}* No puedes robarte a ti mismo.`);

            const ahora = Date.now();
            if (!global.db.data.users[thief]) global.db.data.users[thief] = {};
            if (!global.db.data.users[targetJid]) global.db.data.users[targetJid] = {};

            const userThief = global.db.data.users[thief];
            const userVictim = global.db.data.users[targetJid];

            const cooldown = 60 * 60 * 1000;
            const tiempoPasado = ahora - (userThief.lastRob || 0);

            if (tiempoPasado < cooldown) {
                const restante = Math.floor((cooldown - tiempoPasado) / 60000);
                return m.reply(`*${config.visuals.emoji2}* \`AGITAMIENTO\`\n\nEstás cansado. Espera **${restante}m**.`);
            }

            const lastActive = userVictim.lastSeen || 0;
            if ((ahora - lastActive) < 30 * 60 * 1000) {
                return m.reply(`*${config.visuals.emoji2}* \`OBJETIVO ALERTA\`\n\nSolo puedes robar a quienes no han hablado en 30 minutos.`);
            }

            const botin = userVictim.wallet || 0;

            if (botin <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`BILLETERA VACÍA\`\n\nEste usuario no lleva nada encima.`);
            }

            userVictim.wallet = 0;
            userThief.wallet = (userThief.wallet || 0) + botin;
            userThief.lastRob = ahora;

            const victimId = targetJid.split('@')[0];

            let texto = `*${config.visuals.emoji3}* \`¡GOLPE MAESTRO!\` *${config.visuals.emoji3}*\n\n`;
            texto += `Has dejado en la calle a @${victimId}.\n`;
            texto += `*${config.visuals.emoji} Botín Total:* ¥${botin.toLocaleString()}\n\n`;
            texto += `> ¡Más vale que corras antes de que revise su cuenta!`;

            await conn.sendMessage(m.chat, { 
                text: texto, 
                mentions: [targetJid] 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el asalto.`);
        }
    }
};

export default robCommand;