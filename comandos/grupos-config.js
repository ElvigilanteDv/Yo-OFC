export default {
    name: 'welcome',
    alias: ['antilink', 'detect', 'setup', 'config'],
    noPrefix: true,
    async run(conn, m) {
        const body = (
            m.message.conversation || 
            m.message.extendedTextMessage?.text || 
            m.message.imageMessage?.caption || 
            m.message.videoMessage?.caption || ""
        ).trim();

        const prefixes = ['#', '!', '.'];
        const hasPrefix = prefixes.some(p => body.startsWith(p));
        const prefix = hasPrefix ? prefixes.find(p => body.startsWith(p)) : '';

        const fullCommand = hasPrefix ? body.slice(prefix.length).trim() : body;
        const splitCommand = fullCommand.split(/ +/);
        const commandUsed = splitCommand[0].toLowerCase();
        const args = splitCommand.slice(1);

        if (!m.chat.endsWith('@g.us')) {
            return m.reply('Este comando solo se puede usar en grupos.');
        }

        const { isAdmin } = await conn.getAdminStatus(m.chat, m.sender);
        if (!isAdmin) {
            return m.reply('Necesitas ser administrador del grupo para usar este comando.');
        }

        if (!global.db.data.chats[m.chat]) {
            global.db.data.chats[m.chat] = { 
                welcome: true,
                antilink: true,
                detect: true,
                rolls: {},
                rpg: {},
                gacha: {}
            };
        }

        const chatConfig = global.db.data.chats[m.chat];

        let feature;
        let action;

        if (commandUsed === 'setup' || commandUsed === 'config') {
            if (args.length < 2) {
                const statusWelcome = chatConfig.welcome ? 'Activado' : 'Desactivado';
                const statusAntilink = chatConfig.antilink ? 'Activado' : 'Desactivado';
                const statusDetect = chatConfig.detect ? 'Activado' : 'Desactivado';

                let txt = `*✿︎ \`CONFIGURACIÓN DEL GRUPO\` ✿︎*\n\n`;
                txt += `» 👋 *Welcome:* ${statusWelcome}\n`;
                txt += `» 🔗 *Antilink:* ${statusAntilink}\n`;
                txt += `» 👁️ *Detect:* ${statusDetect}\n\n`;
                txt += `> ✰ Usa ${hasPrefix ? prefix : ''}función on/off para cambiar los ajustes.\n`;
                txt += `> ✰ Ejemplo: ${hasPrefix ? prefix : ''}antilink off`;
                return m.reply(txt);
            }
            feature = args[0].toLowerCase();
            action = args[1].toLowerCase();
        } else {
            feature = commandUsed;
            action = args[0]?.toLowerCase();
        }

        if (!['welcome', 'antilink', 'detect'].includes(feature)) {
            return m.reply('Esa opción no es válida. Elige entre: welcome, antilink o detect.');
        }

        if (!['on', 'off'].includes(action)) {
            return m.reply('Estado incorrecto. Usa "on" para activar o "off" para desactivar.');
        }

        const isTrue = action === 'on';

        if (chatConfig[feature] === isTrue) {
            return m.reply(`*✿︎ \`AVISO\` ✿︎*\n\n» La función *${feature}* ya se encuentra ${isTrue ? 'activada' : 'desactivada'}.`);
        }

        chatConfig[feature] = isTrue;

        let res = `*✿︎ \`CONFIG UPDATE\` ✿︎*\n\n`;
        res += `» La función *${feature.toUpperCase()}* ahora está: ${isTrue ? 'Activada' : 'Desactivada'}\n\n`;
        res += `> ✰ Cambio aplicado correctamente por el administrador.`;

        return m.reply(res);
    }
};