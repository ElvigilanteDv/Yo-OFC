import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const genrePath = path.resolve('./config/database/profile/genres.json');
const marryPath = path.resolve('./config/database/profile/casados.json');
const proposals = new Map();

const marry = {
    name: 'marry',
    alias: ['casar', 'acceptmarry'],
    category: 'profile',
    desc: 'Propón matrimonio a otro usuario o acepta una propuesta respondiendo al mensaje.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            if (!fs.existsSync(marryPath)) fs.writeFileSync(marryPath, JSON.stringify({}));
            let casados = JSON.parse(fs.readFileSync(marryPath, 'utf-8'));

            if (args[0] === 'accept') {
                if (!m.quoted || !proposals.has(m.quoted.id)) return m.reply(`*${config.visuals.emoji2} \`SIN PROPUESTAS\` ${config.visuals.emoji2}*\n\nNo tienes peticiones de matrimonio pendientes.\n\n> ¡Sigue buscando a tu persona ideal!`);
                const prop = proposals.get(m.quoted.id);
                if (m.sender !== prop.to) return m.reply(`*${config.visuals.emoji2}* No puedes aceptar un pacto ajeno.`);
                
                casados[user] = prop.from;
                casados[prop.from] = user;
                fs.writeFileSync(marryPath, JSON.stringify(casados, null, 2));
                proposals.delete(m.quoted.id);
                return m.reply(`*${config.visuals.emoji3} \`VÍNCULO SELLADO\` ${config.visuals.emoji3}*\n\n¡Felicidades! Ahora estás casado con @${prop.from}.\n\n> ¡Que este pacto dure por siempre! 💍`, { mentions: [m.sender, prop.fromJid] });
            }

            if (casados[user]) return m.reply(`*${config.visuals.emoji2} \`VÍNCULO ACTIVO\` ${config.visuals.emoji2}*\n\nYa posees un matrimonio registrado.\n\n> ¡Usa #divorce si deseas recuperar tu libertad!`);

            const targetJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
            if (!targetJid) return m.reply(`*${config.visuals.emoji2} \`ERROR DE OBJETIVO\` ${config.visuals.emoji2}*\n\nDebes mencionar a alguien para la propuesta.\n\n> ¡Inténtalo de nuevo etiquetando a alguien!`);
            const target = targetJid.split('@')[0].split(':')[0];

            if (casados[target]) return m.reply(`*${config.visuals.emoji2}* El objetivo ya posee un vínculo activo.`);
            
            let genres = fs.existsSync(genrePath) ? JSON.parse(fs.readFileSync(genrePath, 'utf-8')) : {};
            if (!genres[user] || !genres[target]) return m.reply(`*${config.visuals.emoji2} \`REGISTRO NECESARIO\` ${config.visuals.emoji2}*\n\nAmbos requieren definir su identidad (#setgenre).\n\n> ¡Sin género no hay matrimonio!`);
            if (genres[user] === genres[target]) return m.reply(`*${config.visuals.emoji2} \`PACTO DENEGADO\` ${config.visuals.emoji2}*\n\nSolo se permite la unión de géneros opuestos.\n\n> ¡Reglas del servidor Kazuma!`);

            const sent = await conn.sendMessage(m.chat, { 
                text: `*💍 \`PROPUESTA DE MATRIMONIO\` 💍*\n\n@${user} solicita un pacto eterno contigo. Responde a este mensaje con *#marry accept* para sellarlo.\n\n> ¡Elige sabiamente con quién compartes tu vida!`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

            proposals.set(sent.key.id, { from: user, fromJid: m.sender, to: targetJid });
        } catch (e) {
            m.reply('✘ Error en el sistema de vínculos.');
        }
    }
};

export default marry;
