import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/pokemon/pokemon.json');
const groupDbPath = path.resolve('./jsons/grupos.json');

const releaseCommand = {
    name: 'liberar',
    alias: ['despedir', 'release'],
    category: 'pokemon',
    desc: 'Libera un pokémon de tu equipo.',
    isGroup: true,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        try {
            const from = m.chat;
            const sender = m.sender.split('@')[0].split(':')[0];

            let groupDb = JSON.parse(fs.readFileSync(groupDbPath, 'utf-8'));
            if (!groupDb[from]?.pokemon) {
                return m.reply(`*${config.visuals.emoji2}* \`SISTEMA DESACTIVADO\`\n\nEl juego de Pokémon está desactivado en este grupo.`);
            }

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            let user = db[from]?.users[sender];

            let index = parseInt(args[0]) - 1;
            if (isNaN(index) || !user || !user.pc[index]) {
                return m.reply(`*${config.visuals.emoji2}* Indica la posición en el equipo (Ej: 1).`);
            }

            let pk = user.pc[index];
            
            if (!args[1] || args[1].toLowerCase() !== 'confirmar') {
                return m.reply(`*${config.visuals.emoji2}* \`CONFIRMACIÓN\`\n\n¿Seguro que quieres liberar a ID ${pk.id} (Lvl ${pk.lvl})?\n\n> Escribe: *#liberar ${args[0]} confirmar*`);
            }

            let xpBonus = (5 + pk.lvl) * (pk.shiny ? 2 : 1);
            user.pc.splice(index, 1);
            user.stats.released = (user.stats.released || 0) + 1;

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            m.reply(`*${config.visuals.emoji3}* Has liberado a tu Pokémon.\nGanaste *${xpBonus} XP* de transferencia.`);
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al liberar.`);
        }
    }
};

export default releaseCommand;