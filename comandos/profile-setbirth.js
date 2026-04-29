import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbPath = path.resolve('./config/database/profile/birthdays.json');

const setBirth = {
    name: 'setbirth',
    alias: ['cumpleaños'],
    category: 'profile',
    desc: 'Registra tu fecha de nacimiento (DD/MM/AAAA) para calcular tu edad y cumpleaños.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!args[0]) return m.reply(`*${config.visuals.emoji2} \`FALTAN DATOS\` ${config.visuals.emoji2}*\n\nUso: #setbirth DD/MM/AAAA\n\n> ¡Registra tu origen en la matriz!`);

            const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
            const match = args[0].match(regex);
            if (!match) return m.reply(`*${config.visuals.emoji2} \`FORMATO INVÁLIDO\` ${config.visuals.emoji2}*\n\nUsa: DD/MM/AAAA`);

            const day = parseInt(match[1]);
            const month = parseInt(match[2]);
            const year = parseInt(match[3]);
            const age = 2026 - year;

            if (age < 8 || age > 85) return m.reply(`*${config.visuals.emoji2} \`RANGO INVÁLIDO\` ${config.visuals.emoji2}*\n\nSolo de 8 a 85 años.`);

            db[user] = { birth: `${day}/${month}/${year}`, age: age };
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            m.reply(`*${config.visuals.emoji3} \`CRONOLOGÍA FIJADA\` ${config.visuals.emoji3}*\n\nFecha: *${day}/${month}/${year}*\nEdad: *${age} años*\n\n> ¡Tu lugar en el tiempo ha sido asegurado!`);
        } catch (e) {
            m.reply('✘ Error en la matriz de tiempo.');
        }
    }
};

export default setBirth;
