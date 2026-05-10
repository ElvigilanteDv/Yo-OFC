import { config } from '../../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/pokemon/pokemon.json');

const trainCommand = {
    name: 'entrenar',
    alias: ['train', 'lelear'],
    category: 'pokemon',
    desc: 'Entrena a un pokémon de tu equipo para ganar XP.',
    isGroup: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        const from = m.chat;
        const sender = m.sender.split('@')[0].split(':')[0];

        let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        let user = db[from]?.users[sender];

        if (!user || user.pc.length === 0) return m.reply(`*${config.visuals.emoji2}* No tienes pokémon.`);

        let now = Date.now();
        if (now - (user.cooldowns?.train || 0) < 1200000) {
            let rest = Math.ceil((1200000 - (now - user.cooldowns.train)) / 60000);
            return m.reply(`*${config.visuals.emoji2}* Tus pokémon están cansados. Regresa en ${rest} min.`);
        }

        let index = parseInt(args[0]) - 1;
        if (isNaN(index) || !user.pc[index]) return m.reply(`*${config.visuals.emoji2}* Indica el número del pokémon en tu equipo.`);

        let pk = user.pc[index];
        if (pk.lvl >= 100) return m.reply(`*${config.visuals.emoji2}* Este pokémon ya es nivel máximo.`);

        pk.xp += 20;
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
        msg += `Pokémon ID ${pk.id} ganó *20 XP*.\n`;
        if (levelUp) msg += `*¡Subió al nivel ${pk.lvl}!* ⬆️`;

        m.reply(msg);
    }
};

export default trainCommand;