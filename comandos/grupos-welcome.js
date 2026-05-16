export default function welcomeHandler(conn) {
    conn.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;

        const chat = global.db.data.chats[id];
        if (chat && chat.welcome === false) return;

        const metadata = await conn.groupMetadata(id).catch(() => null);
        if (!metadata) return;

        for (const user of participants) {
            let userNumber = typeof user === 'string' ? user.split('@')[0] : user.id ? user.id.split('@')[0] : 'nuevo';
            let jid = typeof user === 'string' ? user : user.id;

            if (action === 'add') {
                const welcomeText = `¡Bienvenido @${userNumber} al grupo ${metadata.subject}! Disfruta tu estadía.`;
                await conn.sendMessage(id, { 
                    text: welcomeText, 
                    mentions: [jid] 
                });
            } else if (action === 'remove') {
                const goodbyeText = `Se fue @${userNumber} del grupo. ¡Que le vaya bien!`;
                await conn.sendMessage(id, { 
                    text: goodbyeText, 
                    mentions: [jid] 
                });
            }
        }
    });
}