import { config } from '../config.js';
import { database } from '../database.js';

const economyInfoCommand = {
    name: 'economy',
    alias: ['ecoinfo', 'einfo', 'ainfo'],
    category: 'economy',
    desc: 'Consulta los tiempos de espera y el balance total de un usuario.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            let targetJid = m.sender;
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.sender || m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            const userDb = await database.getUser(targetJid);
            
            if (!userDb) {
                return m.reply(`*${config.visuals.emoji2}* El usuario no tiene registros económicos.`);
            }

            const userId = targetJid.split('@')[0].split(':')[0];
            const ahora = Date.now();

            const formatTime = (timestamp) => {
                if (!timestamp || timestamp === 0) return "*nunca*";
                const diff = ahora - timestamp;
                const segundos = Math.floor(diff / 1000);
                const minutos = Math.floor(segundos / 60);
                const horas = Math.floor(minutos / 60);
                const dias = Math.floor(horas / 24);

                if (dias > 0) return `hace *${dias}d*`;
                if (horas > 0) return `hace *${horas}h*`;
                if (minutos > 0) return `hace *${minutos}m*`;
                return `hace *${segundos}s*`;
            };

            let dailyTime = 0;
            try {
                const dailyData = JSON.parse(userDb.last_claim);
                dailyTime = dailyData.time || 0;
            } catch {
                dailyTime = new Date(userDb.last_claim).getTime() || 0;
            }

            const dailyFmt = formatTime(dailyTime);
            const workFmt = formatTime(userDb.lastWork);
            const crimeFmt = formatTime(userDb.lastCrime);
            const slutFmt = formatTime(userDb.lastSlut);

            const wallet = Number(userDb.wallet || 0);
            const bank = Number(userDb.bank || 0);
            const totalCoins = wallet + bank;

            let message = `*${config.visuals.emoji3}* \`ESTADÍSTICAS GLOBALES\` *${config.visuals.emoji3}*\n\n`;
            message += `› @${userId}\n\n`;
            message += `ⴵ Daily » ${dailyFmt}\n`;
            message += `ⴵ Work » ${workFmt}\n`;
            message += `ⴵ Crime » ${crimeFmt}\n`;
            message += `ⴵ Slut » ${slutFmt}\n\n`;
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