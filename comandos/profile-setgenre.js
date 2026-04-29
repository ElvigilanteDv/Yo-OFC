import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const genrePath = path.resolve('./config/database/profile/genres.json');
const marryPath = path.resolve('./config/database/profile/casados.json');

const setGenre = {
    name: 'setgenre',
    alias: ['genero'],
    category: 'profile',
    desc: 'Define tu identidad (hombre/mujer) para habilitar funciones como el matrimonio.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const genre = args[0]?.toLowerCase();

            if (!fs.existsSync(genrePath)) fs.writeFileSync(genrePath, JSON.stringify({}));
            let genres = JSON.parse(fs.readFileSync(genrePath, 'utf-8'));

            if (genres[user]) return m.reply(`*${config.visuals.emoji2} \`IDENTIDAD FIJADA\` ${config.visuals.emoji2}*\n\nTu género ya es *${genres[user]}*.\n\n> ¡Usa #delgenre si deseas resetear tu identidad!`);

            if (genre !== 'hombre' && genre !== 'mujer') return m.reply(`*${config.visuals.emoji2} \`FORMATO ERRÓNEO\` ${config.visuals.emoji2}*\n\nDebes especificar: #setgenre hombre/mujer`);

            const nuevoGenero = genre === 'hombre' ? 'Hombre' : 'Mujer';
            genres[user] = nuevoGenero;
            fs.writeFileSync(genrePath, JSON.stringify(genres, null, 2));

            if (fs.existsSync(marryPath)) {
                let casados = JSON.parse(fs.readFileSync(marryPath, 'utf-8'));
                if (casados[user]) {
                    const pareja = casados[user];
                    if (genres[pareja] === nuevoGenero) {
                        delete casados[user];
                        delete casados[pareja];
                        fs.writeFileSync(marryPath, JSON.stringify(casados, null, 2));
                        const aviso = `*♰ \`DIVORCIO AUTOMÁTICO\` ♰*\n\nSimetría de géneros detectada. El vínculo ha sido anulado.`;
                        await conn.sendMessage(m.sender, { text: aviso });
                        await conn.sendMessage(pareja + '@s.whatsapp.net', { text: aviso });
                    }
                }
            }
            m.reply(`*${config.visuals.emoji3} \`GÉNERO ESTABLECIDO\` ${config.visuals.emoji3}*\n\nTu identidad ha sido guardada como: *${nuevoGenero}* ✦`);
        } catch (e) {
            m.reply('✘ Error en la matriz de identidad.');
        }
    }
};

export default setGenre;