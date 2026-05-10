import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

const configOnOff = {
    name: 'config',
    alias: ['detect', 'antilink', 'pokemon'],
    category: 'grupo',
    desc: 'Configura las funciones del grupo con on/off.',
    isAdmin: true,
    isGroup: true,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        const from = m.chat;
        let feature = '';
        let action = '';

        if (commandName === 'config') {
            feature = args[0]?.toLowerCase();
            action = args[1]?.toLowerCase();
        } else {
            feature = commandName.toLowerCase();
            action = args[0]?.toLowerCase();
        }

        const validFeatures = ['detect', 'antilink', 'pokemon'];
        if (!validFeatures.includes(feature)) {
            return m.reply(`*${config.visuals.emoji2}* \`Opción Inválida\`\n\nFunciones disponibles:\n*${config.visuals.emoji3}* \`${usedPrefix}detect on/off\`\n*${config.visuals.emoji3}* \`${usedPrefix}antilink on/off\`\n*${config.visuals.emoji3}* \`${usedPrefix}pokemon on/off\``);
        }

        if (!action || !['on', 'off'].includes(action)) {
            return m.reply(`*${config.visuals.emoji2}* \`Falta Estado\`\n\nEspecifica si quieres activar o desactivar *${feature}*.\n\n> Ejemplo: *${usedPrefix}${feature} on*`);
        }

        const enabled = (action === 'on');

        try {
            if (!fs.existsSync(path.resolve('./jsons'))) {
                fs.mkdirSync(path.resolve('./jsons'), { recursive: true });
            }

            let db = {};
            if (fs.existsSync(databasePath)) {
                db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            }

            if (!db[from]) {
                db[from] = { detect: true, antilink: false, pokemon: false };
            }

            if (db[from][feature] === enabled) {
                return m.reply(`*${config.visuals.emoji3}* \`Aviso\`\n\nLa función *${feature.toUpperCase()}* ya se encuentra *${enabled ? 'activada' : 'desactivada'}*.`);
            }

            db[from][feature] = enabled;
            fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));

            const statusText = enabled ? 'ACTIVADA' : 'DESACTIVADA';
            await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji3}* \`AJUSTE DE GRUPO\`\n\nLa función *${feature.toUpperCase()}* ha sido *${statusText}* correctamente.\n\n> ¡Configuración actualizada!` 
            }, { quoted: m });

        } catch (err) {
            m.reply(`*${config.visuals.emoji2}* Error al guardar la configuración en la base de datos.`);
        }
    }
};

export default configOnOff;