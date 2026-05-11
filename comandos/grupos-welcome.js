import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const groupDbPath = path.resolve('./jsons/grupos.json');

export async function welcomeHandler(sock, { id, participants, action }) {
    if (action !== 'add') return;

    try {
        if (!fs.existsSync(groupDbPath)) return;
        let groupDb = JSON.parse(fs.readFileSync(groupDbPath, 'utf-8'));
        
        if (!groupDb[id]?.welcome) return;

        let groupMetadata = await sock.groupMetadata(id);
        let groupName = groupMetadata.subject;

        for (let jid of participants) {
            let pp;
            try {
                pp = await sock.profilePictureUrl(jid, 'image');
            } catch {
                pp = 'https://i.ibb.co/mJR6NBs/avatar.png';
            }

            let user = jid.split('@')[0];
            
            let txt = `*${config.visuals.emoji3} \`NUEVO INTEGRANTE\` ${config.visuals.emoji3}*\n\n`;
            txt += `¡Hola @${user}! Bienvenido/a a *${groupName}*.\n\n`;
            txt += `> Recuerda leer las reglas del grupo para evitar inconvenientes.\n\n`;
            txt += `*¡Disfruta tu estancia!*`;

            await sock.sendMessage(id, {
                image: { url: pp },
                caption: txt,
                mentions: [jid]
            });
        }
    } catch (e) {
        console.error('Error en Welcome Handler:', e);
    }
}