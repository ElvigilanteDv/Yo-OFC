import { config } from '../config.js';

const welcomeConfig = {
    name: 'welcome',
    alias: ['bienvenida'],
    category: 'group',
    desc: 'Activa o desactiva los mensajes de bienvenida en el grupo.',
    isAdmin: true,
    isGroup: true,

    run: async (conn, m, { args }) => {
        if (!global.db.data.chats[m.chat]) {
            global.db.data.chats[m.chat] = { welcome: false };
        }

        const chat = global.db.data.chats[m.chat];
        const action = args[0]?.toLowerCase();

        if (action === 'on') {
            chat.welcome = true;
            m.reply(`*${config.visuals.emoji3} BIENVENIDA ACTIVADA*\n\nA partir de ahora, saludaré a los nuevos integrantes.\n\n> Estado: ✅ ON`);
        } else if (action === 'off') {
            chat.welcome = false;
            m.reply(`*${config.visuals.emoji2} BIENVENIDA DESACTIVADA*\n\nYa no enviaré mensajes cuando alguien se una.\n\n> Estado: ❌ OFF`);
        } else {
            m.reply(`*${config.visuals.emoji1} CONFIGURACIÓN DE BIENVENIDA*\n\nUso correcto:\n› \`${config.allPrefixes[0]}welcome on\`\n› \`${config.allPrefixes[0]}welcome off\``);
        }
    }
};

export default welcomeConfig;