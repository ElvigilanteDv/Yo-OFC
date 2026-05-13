import { config } from '../config.js';

const delAge = {
    name: 'delage',
    alias: ['borraredad'],
    category: 'profile',
    desc: 'Elimina tu registro de edad y cumpleaños de la base de datos.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const userJid = m.sender.replace(/:.*@/g, '@');
            const userDb = global.db.data.users[userJid];

            if (!userDb || !userDb.birthday) {
                return m.reply(`*${config.visuals.emoji2} \`DATO INEXISTENTE\` ${config.visuals.emoji2}*\n\nNo hay edad registrada.`);
            }

            delete userDb.birthday;
            
            m.reply(`*${config.visuals.emoji3} \`EDAD PURGADA\` ${config.visuals.emoji3}*\n\nEdad eliminada del registro.\n\n> ¡Vuelve a ser joven eternamente!`);
        } catch (e) {
            console.error(e);
            m.reply('✘ Error al eliminar edad.');
        }
    }
};

export default delAge;