import { config } from '../config.js';

const economyInfoCommand = {
    name: 'economy',
    alias: ['ecoinfo', 'einfo'],
    category: 'economy',
    desc: 'Consulta los tiempos de espera y el balance total de un usuario.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            let targetJid = m.sender;
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            const userDb = global.db.data.users[targetJid];
            if (!userDb) {
                return m.reply(`*${config.visuals.emoji2}* El usuario no tiene registros económicos.`);
            }

            const userId = targetJid.split('@')[0].split(':')[0];
            const ahora = Date.now();

            const formatTime = (lastUsed) => {
                if (!lastUsed || lastUsed === 0) return "*nunca*";
                const diff = ahora - lastUsed;
                const segundos = Math.floor(diff / 1000);
                const minutos = Math.floor(segundos / 60);
                const horas = Math.floor(minutos / 60);
                const dias = Math.floor(horas / 24);

                if (dias > 0) return `hace *${dias}d*`;
                if (horas > 0) return `hace *${horas}h*`;
                if (minutos > 0) return `hace *${minutos}m*`;
                return `hace *${segundos}s*`;
            };

            const dailyTime = formatTime(userDb.daily?.lastClaim);
            const workTime = formatTime(userDb.lastWork);
            const crimeTime = formatTime(userDb.lastCrime);
            const slutTime = formatTime(userDb.lastSlut);

            const wallet = userDb.wallet || 0;
            const bank = userDb.bank || 0;
            const totalCoins = wallet + bank;

            let message = `*${config.visuals.emoji3}* \`ESTADÍSTICAS GLOBALES\` *${config.visuals.emoji3}*\n\n`;
            message += `› @${userId}\n\n`;
            message += `ⴵ Daily » ${dailyTime}\n`;
            message += `ⴵ Work » ${workTime}\n`;
            message += `ⴵ Crime » ${crimeTime}\n`;
            message += `ⴵ Slut » ${slutTime}\n\n`;
            message += `*⛁* Coins totales » *¥${totalCoins.toLocaleString()}*`;

            await conn.sendMessage(m.chat, { 
                text: message,
                mentions: [targetJid]
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al obtener la información económica.`);
        }
    }
};

export default economyInfoCommand;