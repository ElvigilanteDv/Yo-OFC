import { config } from '../config.js';

const dailyCommand = {
    name: 'daily',
    alias: ['diario', 'recompensa'],
    category: 'economy',
    desc: 'Reclama tu recompensa diaria y aumenta tu racha para ganar más.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m) => {
        try {
            const user = m.sender;
            const ahora = Date.now();
            const cooldown = 24 * 60 * 60 * 1000;

            if (!global.db.data.users[user]) global.db.data.users[user] = {};
            const userDb = global.db.data.users[user];

            if (!userDb.daily) {
                userDb.daily = { lastClaim: 0, streak: 0 };
            }

            const tiempoPasado = ahora - userDb.daily.lastClaim;

            if (tiempoPasado < cooldown) {
                const restante = cooldown - tiempoPasado;
                const horas = Math.floor(restante / 3600000);
                const minutos = Math.floor((restante % 3600000) / 60000);
                const segundos = Math.floor((restante % 60000) / 1000);

                let tiempoTexto = "";
                if (horas > 0) {
                    tiempoTexto = `**${horas}h ${minutos}m ${segundos}s**`;
                } else {
                    tiempoTexto = `**${minutos}m ${segundos}s**`;
                }

                return m.reply(`*${config.visuals.emoji2}* \`RECOMPENSA RECLAMADA\`\n\n> Vuelve en ${tiempoTexto} para tu siguiente racha.`);
            }

            if (tiempoPasado > cooldown * 2) {
                userDb.daily.streak = 0;
            }

            userDb.daily.streak += 1;
            
            const baseCoins = 35000;
            const extraPorDia = 10000;
            const recompensa = baseCoins + (extraPorDia * (userDb.daily.streak - 1));

            if (typeof userDb.wallet === 'undefined') userDb.wallet = 0;
            userDb.wallet += recompensa;
            userDb.daily.lastClaim = ahora;

            let texto = `*${config.visuals.emoji3}* \`RECOMPENSA DIARIA\` *${config.visuals.emoji3}*\n\n`;
            texto += `¡Has reclamado tu recompensa del **Día ${userDb.daily.streak}**!\n`;
            texto += `*${config.visuals.emoji} Ganaste:* ¥${recompensa.toLocaleString()}\n`;
            texto += `*${config.visuals.emoji4} Racha actual:* ${userDb.daily.streak} días\n\n`;
            texto += `> *Cartera:* ¥${userDb.wallet.toLocaleString()}`;

            await conn.sendMessage(m.chat, { text: texto }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al reclamar tu recompensa diaria.`);
        }
    }
};

export default dailyCommand;