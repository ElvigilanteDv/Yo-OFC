import { config } from '../config.js';

const setGenre = {
    name: 'setgenre',
    alias: ['genero'],
    category: 'profile',
    desc: 'Define tu identidad (hombre/mujer) para habilitar funciones como el matrimonio.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const userJid = m.sender.replace(/:.*@/g, '@');
            if (!global.db.data.users[userJid]) global.db.data.users[userJid] = {};
            const userDb = global.db.data.users[userJid];

            const genreInput = args[0]?.toLowerCase();

            if (userDb.genre) return m.reply(`*${config.visuals.emoji2} \`IDENTIDAD FIJADA\` ${config.visuals.emoji2}*\n\nTu género ya es *${userDb.genre}*.\n\n> ¡Usa #delgenre si deseas resetear tu identidad!`);

            if (genreInput !== 'hombre' && genreInput !== 'mujer') return m.reply(`*${config.visuals.emoji2} \`FORMATO ERRÓNEO\` ${config.visuals.emoji2}*\n\nDebes especificar: #setgenre hombre/mujer`);

            const nuevoGenero = genreInput === 'hombre' ? 'Hombre' : 'Mujer';
            userDb.genre = nuevoGenero;

            if (userDb.marry) {
                const parejaJid = userDb.marry.replace(/:.*@/g, '@');
                const parejaDb = global.db.data.users[parejaJid];
                
                if (parejaDb && parejaDb.genre === nuevoGenero) {
                    delete userDb.marry;
                    delete parejaDb.marry;
                    
                    const aviso = `*♰ \`DIVORCIO AUTOMÁTICO\` ♰*\n\nSimetría de géneros detectada. El vínculo ha sido anulado.`;
                    await conn.sendMessage(userJid, { text: aviso });
                    await conn.sendMessage(parejaJid, { text: aviso });
                }
            }
            m.reply(`*${config.visuals.emoji3} \`GÉNERO ESTABLECIDO\` ${config.visuals.emoji3}*\n\nTu identidad ha sido guardada como: *${nuevoGenero}* ✦`);
        } catch (e) {
            console.error(e);
            m.reply('✘ Error en la matriz de identidad.');
        }
    }
};

export default setGenre;