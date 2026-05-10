import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/pokemon/pokemon.json');
const groupDbPath = path.resolve('./jsons/grupos.json');

const catchPokemon = {
    name: 'capturar',
    alias: ['catch', 'poke'],
    category: 'pokemon',
    desc: 'Intenta capturar al pokémon detectado.',
    isGroup: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const from = m.chat;
            const sender = m.sender.split('@')[0].split(':')[0];

            let groupDb = JSON.parse(fs.readFileSync(groupDbPath, 'utf-8'));
            if (!groupDb[from]?.pokemon) {
                return m.reply(`*${config.visuals.emoji2}* \`SISTEMA DESACTIVADO\`\n\nEl juego de Pokémon está desactivado en este grupo.`);
            }

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            if (!db[from]?.session) return m.reply(`*${config.visuals.emoji2}* No hay ningún pokémon cerca.`);

            let session = db[from].session;
            if (Date.now() > session.expire) {
                db[from].session = null;
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
                return m.reply(`*${config.visuals.emoji2}* El pokémon se ha ido.`);
            }

            if (!db[from].users[sender]) db[from].users[sender] = { pc: [], stats: { catch: 0 }, cooldowns: {} };
            let user = db[from].users[sender];

            let success = Math.random() < 0.7; 

            if (!success) {
                return m.reply(`*${config.visuals.emoji2}* ¡Se salió de la Pokéball! Intenta de nuevo.`);
            }

            let newPoke = {
                id: session.id,
                lvl: session.lvl,
                shiny: session.shiny,
                xp: 0,
                date: Date.now()
            };

            user.pc.push(newPoke);
            user.stats = user.stats || {};
            user.stats.catch = (user.stats.catch || 0) + 1;
            user.cooldowns = user.cooldowns || {};
            user.cooldowns.search = Date.now();
            
            db[from].session = null;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji3}* \`¡ATRÁPALO YA!\`\n\nHas capturado exitosamente al pokémon nivel ${newPoke.lvl}.\n\n> Revisa tu equipo con *#equipo*` 
            }, { quoted: m });
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* La Pokéball falló.`);
        }
    }
};

export default catchPokemon;