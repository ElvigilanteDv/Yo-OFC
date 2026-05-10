import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/pokemon/pokemon.json');
const ecoPath = path.resolve('./config/database/economy/economy.json');
const groupDbPath = path.resolve('./jsons/grupos.json');

const searchPokemon = {
    name: 'explorar',
    alias: ['buscar', 'find'],
    category: 'pokemon',
    desc: 'Busca un pokémon salvaje (Costo: ¥6,000).',
    isGroup: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const from = m.chat;
            const sender = m.sender.split('@')[0].split(':')[0];
            const cost = 6000;

            let groupDb = JSON.parse(fs.readFileSync(groupDbPath, 'utf-8'));
            if (!groupDb[from]?.pokemon) {
                return m.reply(`*${config.visuals.emoji2}* \`SISTEMA DESACTIVADO\`\n\nEl juego de Pokémon está desactivado en este grupo.`);
            }

            let ecoDb = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
            let userEco = ecoDb[from]?.[sender] || { wallet: 0, bank: 0 };
            let totalMoney = (userEco.wallet || 0) + (userEco.bank || 0);

            if (totalMoney < cost) {
                return m.reply(`*${config.visuals.emoji2}* \`Fondos Insuficientes\`\n\nNecesitas ¥${cost.toLocaleString()} para explorar. Tienes ¥${totalMoney.toLocaleString()}.`);
            }

            if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
            let db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf-8')) : {};

            if (!db[from]) db[from] = { users: {}, session: null };
            if (!db[from].users[sender]) db[from].users[sender] = { pc: [], cooldowns: { search: 0 } };

            let user = db[from].users[sender];
            let now = Date.now();
            let cd = 120000;

            if (now - (user.cooldowns.search || 0) < cd) {
                let rest = cd - (now - user.cooldowns.search);
                let min = Math.floor(rest / 60000);
                let sec = Math.floor((rest % 60000) / 1000);
                return m.reply(`*${config.visuals.emoji2}* Espera *${min}m ${sec}s* para volver a explorar.`);
            }

            if (userEco.wallet >= cost) {
                userEco.wallet -= cost;
            } else {
                let remaining = cost - userEco.wallet;
                userEco.wallet = 0;
                userEco.bank -= remaining;
            }
            fs.writeFileSync(ecoPath, JSON.stringify(ecoDb, null, 2));

            let pokeId = Math.floor(Math.random() * 900) + 1;
            let isShiny = Math.random() < 1/150;
            let lvl = Math.floor(Math.random() * 10) + 1;
            let img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${isShiny ? 'shiny/' : ''}${pokeId}.png`;

            db[from].session = { id: pokeId, lvl, shiny: isShiny, expire: now + 300000 };
            user.cooldowns.search = now;

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            let txt = `*${config.visuals.emoji3}* \`RADAR POKÉMON\`\n\n¡Se ha detectado un rastro!\n\n*Nivel:* ${lvl}\n*Variante:* ${isShiny ? '✨ Shiny' : 'Normal'}\n*Costo:* ¥${cost.toLocaleString()}\n\n> Tienes 5 minutos para usar *#capturar*`;

            await conn.sendMessage(from, { image: { url: img }, caption: txt }, { quoted: m });
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el radar.`);
        }
    }
};

export default searchPokemon;