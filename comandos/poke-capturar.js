import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/pokemon/pokemon.json');

const catchPokemon = {
    name: 'capturar',
    alias: ['catch', 'poke'],
    category: 'pokemon',
    desc: 'Intenta capturar al pokémon actual.',
    isOwner: false,
    isAdmin: false,
    isGroup: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const from = m.chat;
            const sender = m.sender.split('@')[0].split(':')[0];

            if (!fs.existsSync(dbPath)) return m.reply(`*${config.visuals.emoji2}* Error: DB no encontrada.`);
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[from] || !db[from].session) return m.reply(`*${config.visuals.emoji2}* No hay pokémon para capturar.`);

            let session = db[from].session;
            if (Date.now() > session.expire) {
                db[from].session = null;
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
                return m.reply(`*${config.visuals.emoji2}* El pokémon ha huido.`);
            }

            if (!db[from].users[sender]) db[from].users[sender] = { pc: [], cooldowns: {}, stats: { catch: 0 } };
            let user = db[from].users[sender];

            if (user.pc.length >= 56) return m.reply(`*${config.visuals.emoji2}* No tienes espacio en tu equipo ni en la caja.`);

            let success = Math.random() < 0.5;
            if (!success) {
                db[from].session = null;
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
                return m.reply(`*${config.visuals.emoji2}* ¡Se escapó! El pokémon huyó de la zona.`);
            }

            let newPoke = {
                id: session.id,
                lvl: session.lvl,
                shiny: session.shiny,
                xp: 0,
                date: Date.now()
            };

            user.pc.push(newPoke);
            user.stats.catch = (user.stats.catch || 0) + 1;
            db[from].session = null;

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji3}* \`CAPTURA EXITOSA\`\n\nHas atrapado un pokémon nivel ${newPoke.lvl}.\n¡Se ha guardado en tu PC!` 
            }, { quoted: m });
        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al lanzar la pokéball.`);
        }
    }
};

export default catchPokemon;