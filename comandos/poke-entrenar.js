import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/pokemon/pokemon.json');
const ecoPath = path.resolve('./config/database/economy/economy.json');

const trainCommand = {
    name: 'entrenar',
    alias: ['train', 'lelear'],
    category: 'pokemon',
    desc: 'Entrena a un pokémon (Costo: ¥2,000).',
    isGroup: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const from = m.chat;
            const sender = m.sender.split('@')[0].split(':')[0];
            const cost = 2000;

            let ecoDb = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
            let userEco = ecoDb[from]?.[sender] || { wallet: 0, bank: 0 };
            let totalMoney = (userEco.wallet || 0) + (userEco.bank || 0);

            if (totalMoney < cost) {
                return m.reply(`*${config.visuals.emoji2}* \`Fondos Insuficientes\`\n\nEl entrenamiento cuesta ¥${cost.toLocaleString()}.`);
            }

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            let user = db[from]?.users[sender];

            if (!user || user.pc.length === 0) return m.reply(`*${config.visuals.emoji2}* No tienes pokémon.`);

            let now = Date.now();
            let cd = 1200000; 

            if (now - (user.cooldowns?.train || 0) < cd) {
                let rest = cd - (now - user.cooldowns.train);
                let min = Math.floor(rest / 60000);
                let sec = Math.floor((rest % 60000) / 1000);
                return m.reply(`*${config.visuals.emoji2}* Pokémon cansados. Vuelve en *${min}m ${sec}s*.`);
            }

            let index = parseInt(args[0]) - 1;
            if (isNaN(index) || !user.pc[index]) return m.reply(`*${config.visuals.emoji2}* Indica el número del pokémon.`);

            let pk = user.pc[index];
            if (pk.lvl >= 100) return m.reply(`*${config.visuals.emoji2}* Ya es nivel máximo.`);

            if (userEco.wallet >= cost) {
                userEco.wallet -= cost;
            } else {
                let remaining = cost - userEco.wallet;
                userEco.wallet = 0;
                userEco.bank -= remaining;
            }
            fs.writeFileSync(ecoPath, JSON.stringify(ecoDb, null, 2));

            pk.xp += 25;
            let xpNext = Math.pow(pk.lvl + 1, 3);
            let levelUp = false;

            if (pk.xp >= xpNext) {
                pk.lvl += 1;
                pk.xp = 0;
                levelUp = true;
            }

            user.cooldowns.train = now;
            user.stats.train = (user.stats.train || 0) + 1;

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            let msg = `*${config.visuals.emoji3}* \`ENTRENAMIENTO\`\n\n`;
            msg += `Pokémon ID ${pk.id} ganó *25 XP*.\n`;
            if (levelUp) msg += `*¡Subió al nivel ${pk.lvl}!* ⬆️`;

            m.reply(msg);
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el gimnasio.`);
        }
    }
};

export default trainCommand;