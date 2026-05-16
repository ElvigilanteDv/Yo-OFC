export const detectHandler = (conn) => {
    conn.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        const chat = global.db.data.chats[id];
        if (chat && chat.detect === false) return;

        for (const user of participants) {
            let jid = typeof user === 'string' ? user : user.id;
            if (!jid) continue;
            const userNumber = jid.split('@')[0].split(':')[0];

            if (action === 'promote') {
                let txt = `*⚡ NUEVO ADMINISTRADOR ⚡*\n\n`;
                txt += `> @${userNumber} ha sido ascendido como administrador.\n`;
                txt += `> ¡Felicidades! 🫡`;
                await conn.sendMessage(id, { text: txt, mentions: [jid] });
            } else if (action === 'demote') {
                let txt = `*⚠️ ADVERTENCIA DE RANGO ⚠️*\n\n`;
                txt += `> @${userNumber} ha sido removido de la administración.\n`;
                txt += `> Ya no tiene poder en el grupo.`;
                await conn.sendMessage(id, { text: txt, mentions: [jid] });
            }
        }
    });

    conn.ev.on('groups.update', async (update) => {
        for (const move of update) {
            const id = move.id;
            const chat = global.db.data.chats[id];
            if (chat && chat.detect === false) return;

            if (move.subject) {
                let txt = `*📝 NOMBRE ACTUALIZADO*\n\n`;
                txt += `> El nombre del grupo ha cambiado a:\n`;
                txt += `> *${move.subject}*`;
                await conn.sendMessage(id, { text: txt });
            }

            if (move.desc) {
                let txt = `*📄 DESCRIPCIÓN ACTUALIZADA*\n\n`;
                txt += `> La nueva descripción es:\n`;
                txt += `> ${move.desc}`;
                await conn.sendMessage(id, { text: txt });
            }

            if (move.announce !== undefined) {
                let txt = move.announce ? `*🔒 GRUPO CERRADO*\n\n` : `*🔓 GRUPO ABIERTO*\n\n`;
                txt += move.announce ? `> Solo administradores pueden escribir.` : `> Todos pueden escribir ahora.`;
                await conn.sendMessage(id, { text: txt });
            }

            if (move.restrict !== undefined) {
                let txt = move.restrict ? `*⚙️ EDICIÓN RESTRINGIDA*\n\n` : `*⚙️ EDICIÓN LIBRE*\n\n`;
                txt += move.restrict ? `> Solo admins editan ajustes.` : `> Todos pueden editar ajustes.`;
                await conn.sendMessage(id, { text: txt });
            }
        }
    });
};
