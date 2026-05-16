export default function welcomeHandler(conn) {
    conn.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        const metadata = await conn.groupMetadata(id).catch(() => null);
        if (!metadata) return;

        for (const user of participants) {
            const userNumber = user.split('@')[0];
            if (action === 'add') {
                const welcomeText = `¡Bienvenido @${userNumber} al grupo ${metadata.subject}! Disfruta tu estadía.`;
                await conn.sendMessage(id, { text: welcomeText, mentions: [user] });
            } else if (action === 'remove') {
                const goodbyeText = `Se fue @${userNumber} del grupo. ¡Que le vaya bien!`;
                await conn.sendMessage(id, { text: goodbyeText, mentions: [user] });
            }
        }
    });
}