import { config } from '../config.js';
import { database } from '../database.js';

const dailyCommand = {
    name: 'daily',
    alias: ['diario', 'recompensa'],
    category: 'economy',
    desc: 'Reclama tu recompensa diaria y aumenta tu racha para ganar más.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m) => {
        try {
            const userJid = m.sender;
            const ahora = Date.now();
            const cooldown = 24 * 60 * 60 * 1000;

            let userDb = await database.getUser(userJid);
            if (!userDb) userDb = { wallet: 0, bank: 0, last_claim: JSON.stringify({ time: 0, streak: 0 }) };

            let dailyData;
            try {
                dailyData = JSON.parse(userDb.last_claim);
                if (typeof dailyData !== 'object' || dailyData === null) throw new Error();
            } catch {
                dailyData = { time: 0, streak: 0 };
            }

            const tiempoPasado = ahora - dailyData.time;

            if (tiempoPasado < cooldown) {
                const restante = cooldown - tiempoPasado;
                const horas = Math.floor(restante / 3600000);
                const minutos = Math.floor((restante % 3600000) / 60000);
                const segundos = Math.floor((restante % 60000) / 1000);
                return m.reply(`*${config.visuals.emoji2}* \`RECOMPENSA RECLAMADA\`\n\n> Vuelve en **${horas}h ${minutos}m ${segundos}s** para tu siguiente racha.`);
            }

            if (tiempoPasado > cooldown * 2) {
                dailyData.streak = 0;
            }

            dailyData.streak += 1;
            dailyData.time = ahora;

            const baseCoins = 35000;
            const extraPorDia = 10000;
            const recompensa = baseCoins + (extraPorDia * (dailyData.streak - 1));

            userDb.wallet = Number(userDb.wallet || 0) + recompensa;
            userDb.last_claim = JSON.stringify(dailyData);

            let texto = `*${config.visuals.emoji3}* \`RECOMPENSA DIARIA\` *${config.visuals.emoji3}*\n\n`;
            texto += `¡Has reclamado tu recompensa del *Día ${dailyData.streak}*!\n`;
            texto += `*${config.visuals.emoji} Ganaste:* ¥${recompensa.toLocaleString()}\n`;
            texto += `*${config.visuals.emoji4} Racha actual:* ${dailyData.streak} días\n\n`;
            texto += `> *Cartera:* ¥${userDb.wallet.toLocaleString()}`;

            await database.saveUser(userJid, userDb);
            await conn.sendMessage(m.chat, { text: texto }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al reclamar tu recompensa diaria.`);
        }
    }
};

export default dailyCommand;