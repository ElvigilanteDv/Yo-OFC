export const detectHandler = (conn) => {
    conn.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        const chat = global.db.data.chats[id];
        if (chat && chat.detect === false) return;

        for (const user of participants) {
            const userNumber = user.split('@')[0];
            let txt = '';

            if (action === 'promote') {
                txt = `*⚡ NUEVO ADMINISTRADOR ⚡*\n\n`;
                txt += `> @${userNumber} ha sido ascendido como administrador.\n`;
                txt += `> ¡Felicidades! 🫡`;
                await conn.sendMessage(id, { text: txt, mentions: [user] });
            } else if (action === 'demote') {
                txt = `*⚠️ ADVERTENCIA DE RANGO ⚠️*\n\n`;
                txt += `> @${userNumber} ha sido removido de la administración.\n`;
                txt += `> Ya no tiene poder en el grupo.`;
                await conn.sendMessage(id, { text: txt, mentions: [user] });
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

            if (move.announce === true) {
                let txt = `*🔒 GRUPO CERRADO*\n\n`;
                txt += `> Ahora solo los administradores pueden enviar mensajes.`;
                await conn.sendMessage(id, { text: txt });
            }

            if (move.announce === false) {
                let txt = `*🔓 GRUPO ABIERTO*\n\n`;
                txt += `> Ahora todos los participantes pueden enviar mensajes.`;
                await conn.sendMessage(id, { text: txt });
            }

            if (move.restrict === true) {
                let txt = `*⚙️ EDICIÓN RESTRINGIDA*\n\n`;
                txt += `> Ahora solo los administradores pueden editar los ajustes del grupo.`;
                await conn.sendMessage(id, { text: txt });
            }

            if (move.restrict === false) {
                let txt = `*⚙️ EDICIÓN LIBRE*\n\n`;
                txt += `> Ahora todos los participantes pueden editar los ajustes del grupo.`;
                await conn.sendMessage(id, { text: txt });
            }
        }
    });
};