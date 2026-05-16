import { config } from '../config.js';

const welcomeConfig = {
    name: 'welcome',
    alias: ['bienvenida'],
    category: 'group',
    desc: 'Activa o desactiva los mensajes de bienvenida.',
    isAdmin: true,
    isGroup: true,

    run: async (conn, m, { args }) => {
        try {
            const chatJid = m.chat;
            
            if (!global.db.data.chats[chatJid]) {
                global.db.data.chats[chatJid] = {};
            }

            const chatData = global.db.data.chats[chatJid];
            const text = args[0]?.toLowerCase();

            if (text === 'on') {
                chatData.welcome = true;
                return m.reply(`*${config.visuals.emoji3} BIENVENIDA ACTIVADA*\n\nA partir de ahora, saludaré a los nuevos integrantes.\n\n> Estado: ✅ ON`);
            } 
            
            if (text === 'off') {
                chatData.welcome = false;
                return m.reply(`*${config.visuals.emoji2} BIENVENIDA DESACTIVADA*\n\nYa no enviaré mensajes cuando alguien se una.\n\n> Estado: ❌ OFF`);
            }

            m.reply(`*${config.visuals.emoji1} CONFIGURACIÓN*\n\nDebes especificar un estado:\n› \`welcome on\`\n› \`welcome off\``);
            
        } catch (e) {
            console.error('Error en comando welcome:', e);
            m.reply(`*${config.visuals.emoji2}* Hubo un fallo interno al ejecutar el comando.`);
        }
    }
};

export default welcomeConfig;