import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbPath = path.resolve('./config/database/profile/birthdays.json');

const setAge = {
    name: 'setage',
    alias: ['edad'],
    category: 'profile',
    desc: 'Registra tu edad actual en tu perfil (Rango: 8 - 85 años).',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!args[0]) return m.reply(`*${config.visuals.emoji2} \`FALTAN DATOS\` ${config.visuals.emoji2}*\n\nUso: #setage [número]\n\n> ¡Define tu etapa actual!`);

            const age = parseInt(args[0]);
            if (isNaN(age) || age < 8 || age > 85) return m.reply(`*${config.visuals.emoji2} \`RANGO EXCEDIDO\` ${config.visuals.emoji2}*\n\nSolo de 8 a 85 años.`);

            const estimatedYear = 2026 - age;
            db[user] = { birth: `01/01/${estimatedYear}`, age: age };
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            m.reply(`*${config.visuals.emoji3} \`EDAD REGISTRADA\` ${config.visuals.emoji3}*\n\nEdad: *${age} años*\n\n> ¡Tu perfil ha sido actualizado!`);
        } catch (e) {
            m.reply('✘ Error al procesar edad.');
        }
    }
};

export default setAge;
