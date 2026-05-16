export default function welcomeHandler(conn) {
    conn.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;

        const chat = global.db.data.chats[id];
        if (chat && chat.welcome === false) return;

        const metadata = await conn.groupMetadata(id).catch(() => null);
        if (!metadata) return;

        for (const user of participants) {
            let jid = typeof user === 'string' ? user : user.id;
            const userNumber = jid.split('@')[0].split(':')[0];

            let pp;
            try {
                pp = await conn.profilePictureUrl(jid, 'image');
            } catch {
                pp = 'https://upload.yotsuba.giize.com/u/VPpgV7Bn.jpeg';
            }

            if (action === 'add') {
                const welcomeCaption = `┏━━━━━━━━━━━━━━━━━━┓\n┃ ✨ ¡BIENVENIDO(A)! ✨\n┗━━━━━━━━━━━━━━━━━━┛\n\n👋 Hola @${userNumber}\n\n🎊 Bienvenido a *${metadata.subject}*\n\n> 📜 Lee las reglas para evitar problemas.\n> 🛡️ Diviértete con nuestra comunidad.`;
                
                await conn.sendMessage(id, { 
                    image: { url: pp }, 
                    caption: welcomeCaption, 
                    mentions: [jid] 
                });
            } else if (action === 'remove') {
                const goodbyeCaption = `┏━━━━━━━━━━━━━━━━━━┓\n┃ 👋 ¡ADIÓS VAQUERO! 👋\n┗━━━━━━━━━━━━━━━━━━┛\n\nSe nos fue @${userNumber}\n\n> 💨 Una persona menos en *${metadata.subject}*.\n> ✨ ¡Esperamos que vuelvas pronto!`;
                
                await conn.sendMessage(id, { 
                    image: { url: pp }, 
                    caption: goodbyeCaption, 
                    mentions: [jid] 
                });
            }
        }
    });
}