import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbPath = path.resolve('./config/database/profile/birthdays.json');

const delAge = {
    name: 'delage',
    alias: ['borraredad'],
    category: 'profile',
    desc: 'Elimina tu registro de edad y cumpleaños de la base de datos.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            if (!fs.existsSync(dbPath)) return m.reply(`*${config.visuals.emoji2}* Sin registros.`);
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[user]) return m.reply(`*${config.visuals.emoji2} \`DATO INEXISTENTE\` ${config.visuals.emoji2}*\n\nNo hay edad registrada.`);

            delete db[user];
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            m.reply(`*${config.visuals.emoji3} \`EDAD PURGADA\` ${config.visuals.emoji3}*\n\nEdad eliminada del registro.\n\n> ¡Vuelve a ser joven eternamente!`);
        } catch (e) {
            m.reply('✘ Error al eliminar edad.');
        }
    }
};

export default delAge;