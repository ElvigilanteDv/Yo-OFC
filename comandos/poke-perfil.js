import { config } from '../../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/pokemon/pokemon.json');

const profileCommand = {
    name: 'perfilpk',
    alias: ['entrenador', 'miequipo'],
    category: 'pokemon',
    desc: 'Muestra tus estadísticas globales como entrenador.',
    isGroup: true,
    noPrefix: true,

    run: async (conn, m) => {
        const from = m.chat;
        const sender = m.sender.split('@')[0].split(':')[0];

        if (!fs.existsSync(dbPath)) return m.reply(`*${config.visuals.emoji2}* No hay datos.`);
        let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        let user = db[from]?.users[sender];

        if (!user) return m.reply(`*${config.visuals.emoji2}* No has iniciado tu aventura.`);

        let txt = `*${config.visuals.emoji3}* \`PERFIL ENTRENADOR\`\n\n`;
        txt += `*Usuario:* @${sender}\n`;
        txt += `*Pokémon en PC:* ${user.pc.length}\n`;
        txt += `*Capturas:* ${user.stats?.catch || 0}\n`;
        txt += `*Entrenamientos:* ${user.stats?.train || 0}\n`;
        txt += `*Liberados:* ${user.stats?.released || 0}\n\n`;

        let canSearch = Date.now() - (user.cooldowns?.search || 0) >= 120000;
        let canTrain = Date.now() - (user.cooldowns?.train || 0) >= 1200000;

        txt += `*ESTADO:*\n`;
        txt += `*Búsqueda:* ${canSearch ? '✅' : '⌛'}\n`;
        txt += `*Entrenar:* ${canTrain ? '✅' : '⌛'}`;

        await conn.sendMessage(from, { text: txt, mentions: [m.sender] }, { quoted: m });
    }
};

export default profileCommand;