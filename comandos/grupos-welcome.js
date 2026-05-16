import { config } from '../config.js';

export function welcomeHandler(conn) {
    conn.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;

        if (action !== 'add') return;

        try {
            const groupMetadata = await conn.groupMetadata(id).catch(() => null);
            if (!groupMetadata) return;

            const groupName = groupMetadata.subject || 'el grupo';

            for (const user of participants) {
                let profilePicUrl;
                try {
                    profilePicUrl = await conn.profilePictureUrl(user, 'image');
                } catch (err) {
                    profilePicUrl = 'https://upload.yotsuba.giize.com/u/VPpgV7Bn.jpeg';
                }

                if (!profilePicUrl) {
                    profilePicUrl = 'https://upload.yotsuba.giize.com/u/VPpgV7Bn.jpeg';
                }

                const userTag = `@${user.split('@')[0]}`;
                const prefix = config.allPrefixes?.[0] || '#';

                const welcomeText = `*${config.visuals.emoji3} \`WELCOME USER\` ${config.visuals.emoji3}*\n\n› ${userTag}\n\n> ¡Hola!, bienvenido al grupo *${groupName}*, esperamos que la pases de lo mejor y que disfrutes de tu estadía.\n\n» Para ver mis funciones, usa el comando \`${prefix}help\``;

                await conn.sendMessage(id, {
                    image: { url: profilePicUrl },
                    caption: welcomeText,
                    mentions: [user]
                });
            }
        } catch (e) {}
    });
}