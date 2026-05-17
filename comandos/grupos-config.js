import { database } from '../database.js';

const configCommand = {
    name: 'welcome',
    alias: ['antilink', 'detect', 'setup', 'config'],
    noPrefix: true,

    run: async (conn, m, args) => {
        if (!m.chat.endsWith('@g.us')) {
            return m.reply('Este comando solo se puede usar en grupos.');
        }

        const { isAdmin } = await conn.getAdminStatus(m.chat, m.sender);
        if (!isAdmin) {
            return m.reply('Necesitas ser administrador del grupo para usar este comando.');
        }

        let dbChat = await database.getChat(m.chat);
        if (!dbChat) {
            dbChat = { welcome: true, antilink: true, detect: true };
            await database.saveChat(m.chat, dbChat);
        }

        const body = (m.message.conversation || m.message.extendedTextMessage?.text || "").toLowerCase();
        
        let feature;
        let action;

        if (body.includes('setup') || body.includes('config')) {
            feature = args[0]?.toLowerCase();
            action = args[1]?.toLowerCase();
        } else {
            const prefixes = ['#', '!', '.'];
            const firstWord = body.split(/ +/)[0];
            const hasPrefix = prefixes.some(p => firstWord.startsWith(p));
            feature = hasPrefix ? firstWord.slice(1) : firstWord;
            action = args[0]?.toLowerCase();
        }

        if (!['welcome', 'antilink', 'detect'].includes(feature)) {
            const statusWelcome = dbChat.welcome ? 'Activado' : 'Desactivado';
            const statusAntilink = dbChat.antilink ? 'Activado' : 'Desactivado';
            const statusDetect = dbChat.detect ? 'Activado' : 'Desactivado';

            let txt = `*✿︎ \`CONFIGURACIÓN DEL GRUPO\` ✿︎*\n\n`;
            txt += `» 👋 *Welcome:* ${statusWelcome}\n`;
            txt += `» 🔗 *Antilink:* ${statusAntilink}\n`;
            txt += `» 👁️ *Detect:* ${statusDetect}\n\n`;
            txt += `> ✰ Usa la función seguida de on/off.\n`;
            txt += `> ✰ Ejemplo: welcome off`;
            return m.reply(txt);
        }

        if (!action || !['on', 'off'].includes(action)) {
            return m.reply(`*✿︎ \`ESTADO INCORRECTO\` ✿︎*\n\n» Para entender este comando, usa *off* para desactivar y *on* para activar.\n\n> ✰ Ejemplo: *#${feature} on*`);
        }

        const isTrue = action === 'on';

        if (dbChat[feature] === isTrue) {
            return m.reply(`*✿︎* La función *${feature}* ya se encuentra ${isTrue ? '*activada*' : '*desactivada*'}.`);
        }

        dbChat[feature] = isTrue;
        await database.saveChat(m.chat, dbChat);
        global.db.data.chats[m.chat] = { ...global.db.data.chats[m.chat], ...dbChat };

        let res = `*✿︎ \`CONFIG UPDATE\` ✿︎*\n\n`;
        res += `» Haz ${isTrue ? 'Activado' : 'Desactivado'} la función *${feature.toUpperCase()}*\n\n`;
        res += `> ✰ Cambio aplicado correctamente por el administrador.`;

        return m.reply(res);
    }
};

export default configCommand;