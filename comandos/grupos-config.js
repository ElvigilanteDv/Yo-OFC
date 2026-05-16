export default {
    name: 'config',
    alias: ['grupos', 'setup'],
    noPrefix: false,
    async run(conn, m) {
        const body = (
            m.message.conversation || 
            m.message.extendedTextMessage?.text || 
            m.message.imageMessage?.caption || 
            m.message.videoMessage?.caption || ""
        ).trim();

        const args = body.split(/ +/).slice(1);
        
        if (!m.chat.endsWith('@g.us')) {
            return m.reply('Este comando solo se puede usar en grupos.');
        }

        const { isAdmin, isBotAdmin } = await conn.getAdminStatus(m.chat, m.sender);
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

        if (args.length < 2) {
            const statusWelcome = chatConfig.welcome ? 'Activado ✅' : 'Desactivado ❌';
            const statusAntilink = chatConfig.antilink ? 'Activado ✅' : 'Desactivado ❌';
            const statusDetect = chatConfig.detect ? 'Activado ✅' : 'Desactivado ❌';
            
            const txtMenu = `⚙️ *CONFIGURACIÓN DEL GRUPO* ⚙️\n\n📌 *Opciones disponibles:*\n• welcome [on/off]\n• antilink [on/off]\n• detect [on/off]\n\n📊 *Estado actual:*\n👋 Welcome: ${statusWelcome}\n🔗 Antilink: ${statusAntilink}\n👁️ Detect: ${statusDetect}\n\n📝 _Ejemplo de uso: #setup antilink off_`;
            return m.reply(txtMenu);
        }

        const feature = args[0].toLowerCase();
        const action = args[1].toLowerCase();

        if (!['welcome', 'antilink', 'detect'].includes(feature)) {
            return m.reply('Esa opción no es válida. Elige entre: welcome, antilink o detect.');
        }

        if (!['on', 'off'].includes(action)) {
            return m.reply('Estado incorrecto. Usa "on" para activar o "off" para desactivar.');
        }

        const isTrue = action === 'on';

        if (chatConfig[feature] === isTrue) {
            return m.reply(`La función *${feature}* ya se encuentra ${isTrue ? 'activada ✅' : 'desactivada ❌'}.`);
        }

        chatConfig[feature] = isTrue;
        return m.reply(`Se ha modificado la configuración.\n\n⚙️ *${feature.toUpperCase()}* ahora está: ${isTrue ? 'Activado ✅' : 'Desactivado ❌'}`);
    }
};