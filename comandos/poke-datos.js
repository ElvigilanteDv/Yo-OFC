import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/pokemon/pokemon.json');
const groupDbPath = path.resolve('./jsons/grupos.json');

const infoCommand = {
    name: 'datos',
    alias: ['pokedex', 'info', 'pkstatus'],
    category: 'pokemon',
    desc: 'Muestra información detallada de un pokémon de tu equipo.',
    isGroup: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const from = m.chat;
            const sender = m.sender.split('@')[0].split(':')[0];

            let groupDb = JSON.parse(fs.readFileSync(groupDbPath, 'utf-8'));
            if (!groupDb[from]?.pokemon) {
                return m.reply(`*${config.visuals.emoji2}* \`SISTEMA DESACTIVADO\`\n\nEl juego de Pokémon está desactivado en este grupo.`);
            }

            if (!fs.existsSync(dbPath)) return m.reply(`*${config.visuals.emoji2}* Sin registros.`);
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            let user = db[from]?.users[sender];

            let index = parseInt(args[0]) - 1;
            if (isNaN(index) || !user || !user.pc[index]) {
                return m.reply(`*${config.visuals.emoji2}* Indica la posición del pokémon en tu equipo (Ej: 1, 2, 3...).`);
            }

            let pk = user.pc[index];
            let xpNext = Math.pow(pk.lvl + 1, 3);
            let hp = Math.floor(20 + (pk.lvl * 2.5));
            let atk = Math.floor(10 + (pk.lvl * 1.5));
            let def = Math.floor(10 + (pk.lvl * 1.2));
            
            let url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pk.shiny ? 'shiny/' : ''}${pk.id}.png`;

            let txt = `*${config.visuals.emoji3}* \`FICHA POKÉMON\`\n\n`
            txt += `*ID:* ${pk.id} ${pk.shiny ? '✨' : ''}\n`
            txt += `*Nivel:* ${pk.lvl}\n`
            txt += `*XP:* ${pk.xp}/${xpNext}\n\n`
            txt += `*Estadísticas:*\n`
            txt += `❤️ HP: ${hp}\n`
            txt += `⚔️ ATK: ${atk}\n`
            txt += `🛡️ DEF: ${def}\n\n`
            txt += `> Capturado el: ${new Date(pk.date).toLocaleDateString()}`;

            await conn.sendMessage(from, { image: { url }, caption: txt }, { quoted: m });
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al consultar datos.`);
        }
    }
};

export default infoCommand;