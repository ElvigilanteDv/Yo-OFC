import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const groupDbPath = path.resolve('./jsons/grupos.json');

export default async (conn) => {
    conn.ev.on('group-participants.update', async (anu) => {
        try {
            const { id, participants, action } = anu;

            if (!fs.existsSync(groupDbPath)) return;
            const groupDb = JSON.parse(fs.readFileSync(groupDbPath, 'utf-8'));

            const chatConfig = groupDb[id];
            if (!chatConfig || !chatConfig.welcome) return;

            const metadata = await conn.groupMetadata(id).catch(() => null);
            if (!metadata) return;

            for (const jid of participants) {
                const phone = jid.split('@')[0];
                let pp;
                try {
                    pp = await conn.profilePictureUrl(jid, 'image');
                } catch {
                    pp = 'https://i.ibb.co/mJR6NBs/avatar.png';
                }

                if (action === 'add') {
                    const welcomeTxt = `*${config.visuals.emoji3} \`NUEVO INTEGRANTE\` ${config.visuals.emoji3}*
                    
*USUARIO:* @${phone}
*GRUPO:* ${metadata.subject}

¡Hola! Te damos la bienvenida a nuestro grupo. Disfruta de tu estancia y no olvides respetar los protocolos del grupo.

> *Escribe #menu para ver mis comandos.*
> *Actualmente somos ${metadata.participants.length} en el sector.*`;

                    await conn.sendMessage(id, { 
                        image: { url: pp }, 
                        caption: welcomeTxt, 
                        mentions: [jid] 
                    });
                }

                if (action === 'remove' || action === 'leave') {
                    const goodbyeTxt = `*${config.visuals.emoji2} \`UN USUARIO MENOS\` ${config.visuals.emoji2}*

*USUARIO:* @${phone}
*GRUPO:* ${metadata.subject}

Una baja más en el equipo. Esperamos que su camino sea productivo fuera de este sector. 

> *Quedamos ${metadata.participants.length} participantes en el grupo.*`;

                    await conn.sendMessage(id, { 
                        image: { url: pp }, 
                        caption: goodbyeTxt, 
                        mentions: [jid] 
                    });
                }
            }
        } catch (err) {
            console.log('Error en Welcome System:', err);
        }
    });
};