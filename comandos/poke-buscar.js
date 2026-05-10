import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/pokemon/pokemon.json');

const searchPokemon = {
    name: 'explorar',
    alias: ['buscar', 'find'],
    category: 'pokemon',
    desc: 'Busca un pokémon salvaje en el área.',
    isOwner: false,
    isAdmin: false,
    isGroup: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const from = m.chat;
            const sender = m.sender.split('@')[0].split(':')[0];

            if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
            let db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf-8')) : {};

            if (!db[from]) db[from] = { users: {}, session: null };
            if (!db[from].users[sender]) db[from].users[sender] = { pc: [], cooldowns: { search: 0 }, stats: { catch: 0, train: 0, released: 0 } };

            let user = db[from].users[sender];
            let now = Date.now();

            if (now - (user.cooldowns?.search || 0) < 120000) {
                let rest = Math.ceil((120000 - (now - user.cooldowns.search)) / 1000);
                return m.reply(`*${config.visuals.emoji2}* Debes esperar ${rest}s para volver a explorar.`);
            }

            let pokeId = Math.floor(Math.random() * 900) + 1;
            let isShiny = Math.random() < 1/4096;
            let lvl = Math.floor(Math.random() * 5) + 1;
            let img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${isShiny ? 'shiny/' : ''}${pokeId}.png`;

            db[from].session = { id: pokeId, lvl, shiny: isShiny, expire: now + 180000 };
            user.cooldowns.search = now;

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            let txt = `*${config.visuals.emoji3}* \`POKÉMON SALVAJE\`\n\n*Nivel:* ${lvl}\n*Variante:* ${isShiny ? '✨ Shiny' : 'Normal'}\n\n> Usa *#capturar* para intentar atraparlo.`;

            await conn.sendMessage(from, { image: { url: img }, caption: txt }, { quoted: m });
        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el radar pokémon.`);
        }
    }
};

export default searchPokemon;