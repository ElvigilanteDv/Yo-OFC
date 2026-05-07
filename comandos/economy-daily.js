import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const dailyCommand = {
    name: 'daily',
    alias: ['diario', 'recompensa'],
    category: 'economy',
    desc: 'Reclama tu recompensa diaria de coins y mantén tu racha para obtener bonificaciones mayores.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const group = m.chat;
            const user = m.sender.split('@')[0].split(':')[0];
            const now = Date.now();

            const botNumber = conn.user.id.split(':')[0];
            const subSessionsPath = path.resolve('./sesiones_subbots');
            const moodSessionsPath = path.resolve('./sesiones_moods');
            let settingsPath = '';

            if (fs.existsSync(path.join(subSessionsPath, botNumber))) {
                settingsPath = path.join(subSessionsPath, botNumber, 'settings.json');
            } else if (fs.existsSync(path.join(moodSessionsPath, botNumber))) {
                settingsPath = path.join(moodSessionsPath, botNumber, 'settings.json');
            }

            let displayShortName = config.botName;
            if (settingsPath && fs.existsSync(settingsPath)) {
                const localData = await fs.readJson(settingsPath);
                if (localData.shortName) displayShortName = localData.shortName;
            }

            if (!fs.existsSync(dbPath)) fs.outputJsonSync(dbPath, {});
            let db = await fs.readJson(dbPath);

            if (!db[group]) db[group] = {};
            if (!db[group][user]) {
                db[group][user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 } };
            }

            const userData = db[group][user];
            const cooldown = 24 * 60 * 60 * 1000;
            const lastClaim = userData.daily?.lastClaim || 0;
            const timePassed = now - lastClaim;

            if (timePassed < cooldown) {
                const remaining = cooldown - timePassed;
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                return m.reply(`*${config.visuals.emoji2}* \`TIEMPO RESTANTE\`\n\nYa reclamaste tu recompensa.\n*Espera:* ${hours}h ${minutes}m`);
            }

            if (timePassed < (cooldown * 2)) {
                userData.daily.streak = (userData.daily.streak || 0) + 1;
            } else {
                userData.daily.streak = 1;
            }

            const reward = 30000 + (userData.daily.streak * 5000);
            userData.wallet = (userData.wallet || 0) + reward;
            userData.daily.lastClaim = now;

            db[group][user] = userData;
            await fs.writeJson(dbPath, db, { spaces: 2 });

            const textoDaily = `*${config.visuals.emoji3}* \`RECOMPENSA DIARIA - ${displayShortName.toUpperCase()}\`\n\n*Ganaste:* ¥${reward.toLocaleString()}\n*Racha:* Día ${userData.daily.streak}\n\n> *Billetera:* ¥${userData.wallet.toLocaleString()}`;

            await conn.sendMessage(m.chat, { 
                text: textoDaily 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el proceso.`);
        }
    }
};

export default dailyCommand;