import { config } from '../config.js';

const setAge = {
    name: 'setage',
    alias: ['edad'],
    category: 'profile',
    desc: 'Registra tu edad actual en tu perfil (Rango: 8 - 85 años).',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const userJid = m.sender.replace(/:.*@/g, '@');
            if (!global.db.data.users[userJid]) global.db.data.users[userJid] = {};
            const userDb = global.db.data.users[userJid];

            if (!args[0]) return m.reply(`*${config.visuals.emoji2} \`FALTAN DATOS\` ${config.visuals.emoji2}*\n\nUso: #setage [número]`);

            const age = parseInt(args[0]);
            if (isNaN(age) || age < 8 || age > 85) return m.reply(`*${config.visuals.emoji2} \`RANGO EXCEDIDO\` ${config.visuals.emoji2}*\n\nSolo de 8 a 85 años.`);

            const estimatedYear = 2026 - age;
            userDb.birthday = { 
                date: `01/01/${estimatedYear}`, 
                age: age 
            };

            m.reply(`*${config.visuals.emoji3} \`EDAD REGISTRADA\` ${config.visuals.emoji3}*\n\nEdad: *${age} años*\n\n> ¡Tu perfil ha sido actualizado!`);
        } catch (e) {
            console.error(e);
            m.reply('✘ Error al procesar edad.');
        }
    }
};

export default setAge;