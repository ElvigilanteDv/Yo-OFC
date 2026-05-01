import fs from 'fs';
import path from 'path';

const stickerCommand = {
    name: 'self',
    alias: ['privado', 'soloyo'],
    category: 'sockets',
    desc: 'Activa/Desactiva el modo self (solo responde a la propia sesión).',
    isGroup: false,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix) => {
        // Validación estricta: Solo si el mensaje viene de "mí mismo" (la propia sesión)
        if (!m.key.fromMe) return;

        const myJid = conn.user.id.split('@')[0].split(':')[0].replace(/\D/g, '');
        const subSessionsPath = path.resolve('./sesiones_subbots');
        const moodSessionsPath = path.resolve('./sesiones_moods');
        
        let settingsPath = '';
        const subPath = path.join(subSessionsPath, myJid, 'settings.json');
        const moodPath = path.join(moodSessionsPath, myJid, 'settings.json');

        if (fs.existsSync(subPath)) settingsPath = subPath;
        else if (fs.existsSync(moodPath)) settingsPath = moodPath;
        else return m.reply('No se encontró el archivo de configuración para esta sesión.');

        let settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        const action = args[0]?.toLowerCase();

        if (action === 'on') {
            settings.selfMode = true;
            fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
            return m.reply('*Modo Self Activado*\nEl bot ahora ignorará todos los mensajes externos y no los mostrará en consola.');
        } else if (action === 'off') {
            settings.selfMode = false;
            fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
            return m.reply('*Modo Self Desactivado*\nEl bot volverá a responder a todos los usuarios normalmente.');
        } else {
            return m.reply(`Uso: *${usedPrefix}self on* o *${usedPrefix}self off*`);
        }
    }
};

export default stickerCommand;