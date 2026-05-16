const cooldown = new Map();

export const detectHandler = (conn) => {
    conn.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        const chat = global.db.data.chats[id];
        if (chat && chat.detect === false) return;

        const metadata = await conn.groupMetadata(id).catch(() => null);
        if (!metadata) return;

        for (const user of participants) {
            let jid = typeof user === 'string' ? user : user.id;
            if (!jid) continue;
            const userNumber = jid.split('@')[0].split(':')[0];

            const isAdmin = metadata.participants.some(p => p.id === jid && (p.admin === 'admin' || p.admin === 'superadmin'));

            if (action === 'promote' && isAdmin) {
                const key = `${id}-promote-${jid}`;
                if (cooldown.has(key)) continue;
                cooldown.set(key, Date.now());
                setTimeout(() => cooldown.delete(key), 5000);

                let txt = `*⚡ NUEVO ADMINISTRADOR ⚡*\n\n`;
                txt += `> @${userNumber} ha sido ascendido como administrador.\n`;
                txt += `> ¡Felicidades! 🫡`;
                await conn.sendMessage(id, { text: txt, mentions: [jid] });
            } 
            
            else if (action === 'demote' && !isAdmin) {
                const key = `${id}-demote-${jid}`;
                if (cooldown.has(key)) continue;
                cooldown.set(key, Date.now());
                setTimeout(() => cooldown.delete(key), 5000);

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

            const metadata = await conn.groupMetadata(id).catch(() => null);
            if (!metadata) continue;

            if (move.subject && move.subject !== metadata.subject) {
                let txt = `*📝 NOMBRE ACTUALIZADO*\n\n`;
                txt += `> El nombre del grupo ha cambiado a:\n`;
                txt += `> *${move.subject}*`;
                await conn.sendMessage(id, { text: txt });
            } 

            else if (move.desc && move.desc !== metadata.desc) {
                let txt = `*📄 DESCRIPCIÓN ACTUALIZADA*\n\n`;
                txt += `> La nueva descripción es:\n`;
                txt += `> ${move.desc}`;
                await conn.sendMessage(id, { text: txt });
            } 

            else if (move.announce !== undefined && move.announce !== metadata.announce) {
                let txt = move.announce ? `*🔒 GRUPO CERRADO*\n\n` : `*🔓 GRUPO ABIERTO*\n\n`;
                txt += move.announce ? `> Solo administradores pueden escribir.` : `> Todos pueden escribir ahora.`;
                await conn.sendMessage(id, { text: txt });
            } 

            else if (move.restrict !== undefined && move.restrict !== metadata.restrict) {
                let txt = move.restrict ? `*⚙️ EDICIÓN RESTRINGIDA*\n\n` : `*⚙️ EDICIÓN LIBRE*\n\n`;
                txt += move.restrict ? `> Solo admins editan ajustes.` : `> Todos pueden editar ajustes.`;
                await conn.sendMessage(id, { text: txt });
            }
        }
    });
};