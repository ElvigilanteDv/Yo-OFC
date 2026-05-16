export const detectHandler = (conn) => {
    // ESTE EVENTO DETECTA PROMOTES Y DEMOTES (ADMINS)
    conn.ev.on('group-participants.update', async (anu) => {
        try {
            const id = anu.id;
            const chat = global.db.data.chats[id];
            if (chat && chat.detect === false) return;

            for (const p of anu.participants) {
                let jid = typeof p === 'string' ? p : p.id || p.jid;
                const userNumber = jid.split('@')[0].split(':')[0];

                if (anu.action === 'promote') {
                    const author = anu.author || id;
                    let txt = `*⚡ NUEVO ADMINISTRADOR ⚡*\n\n`;
                    txt += `> @${userNumber} ha sido ascendido por @${author.split('@')[0]}.\n`;
                    txt += `> ¡Felicidades! 🫡`;
                    await conn.sendMessage(id, { text: txt, mentions: [jid, author] });
                }

                if (anu.action === 'demote') {
                    const author = anu.author || id;
                    let txt = `*⚠️ ADVERTENCIA DE RANGO ⚠️*\n\n`;
                    txt += `> @${userNumber} ha sido removido por @${author.split('@')[0]}.\n`;
                    txt += `> Ya no tiene poder en el grupo.`;
                    await conn.sendMessage(id, { text: txt, mentions: [jid, author] });
                }
            }
        } catch (e) {}
    });

    // ESTE EVENTO DETECTA CAMBIOS DE NOMBRE, FOTO, DESC, ETC.
    conn.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.messageStubType) return;

        const id = m.key.remoteJid;
        const chat = global.db.data.chats[id];
        if (chat && chat.detect === false) return;

        const actor = m.key?.participant || m.participant || id;
        const actorNumber = actor.split('@')[0];

        const stubs = {
            21: `*📝 NOMBRE ACTUALIZADO*\n\n> @${actorNumber} cambió el nombre a:\n> *${m.messageStubParameters[0]}*`,
            22: `*🖼️ ICONO ACTUALIZADO*\n\n> @${actorNumber} cambió la foto del grupo.`,
            23: `*🔗 ENLACE ACTUALIZADO*\n\n> @${actorNumber} restableció el link del grupo.`,
            24: `*📄 DESCRIPCIÓN ACTUALIZADA*\n\n> @${actorNumber} cambió la descripción del grupo.`,
            25: `*⚙️ AJUSTES DE EDICIÓN*\n\n> @${actorNumber} hizo que ${m.messageStubParameters[0] == 'on' ? 'solo admins' : 'todos'} editen el grupo.`,
            26: `*🔒 ESTADO DEL CHAT*\n\n> @${actorNumber} hizo que ${m.messageStubParameters[0] == 'on' ? 'solo admins envíen mensajes.' : 'todos envíen mensajes.'}`
        };

        if (stubs[m.messageStubType]) {
            await conn.sendMessage(id, { text: stubs[m.messageStubType], mentions: [actor] });
        }
    });
};