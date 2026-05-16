import { config } from '../config.js';

export function welcomeHandler(conn) {
    conn.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;

        // Solo actuar si alguien entra
        if (action !== 'add') return;

        // Verificar si la bienvenida está activada para este grupo en la DB
        if (!global.db.data.chats[id]?.welcome) return;

        try {
            const groupMetadata = await conn.groupMetadata(id).catch(() => null);
            if (!groupMetadata) return;

            const groupName = groupMetadata.subject || 'el grupo';

            for (const user of participants) {
                let profilePicUrl;
                try {
                    // Intentamos obtener la foto real
                    profilePicUrl = await conn.profilePictureUrl(user, 'image');
                } catch (err) {
                    // Si no tiene o es privada, usamos tu link de respaldo
                    profilePicUrl = 'https://upload.yotsuba.giize.com/u/VPpgV7Bn.jpeg';
                }

                const userTag = `@${user.split('@')[0]}`;
                const prefix = config.allPrefixes?.[0] || '#';

                const welcomeText = `*${config.visuals.emoji3} \`WELCOME USER\` ${config.visuals.emoji3}*\n\n› ${userTag}\n\n> ¡Hola!, bienvenido al grupo *${groupName}*, esperamos que la pases de lo mejor y que disfrutes de tu estadía.\n\n» Para ver mis funciones, usa el comando \`${prefix}help\``;

                // Enviamos la imagen de forma simple para evitar detección de bots
                await conn.sendMessage(id, {
                    image: { url: profilePicUrl },
                    caption: welcomeText,
                    mentions: [user]
                });
            }
        } catch (e) {
            console.log('Error en welcomeHandler:', e);
        }
    });
}