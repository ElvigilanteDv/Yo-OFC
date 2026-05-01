import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

const databasePath = path.join(process.cwd(), 'jsons', 'preferencias.json');
const prefixPath = path.join(process.cwd(), 'jsons', 'prefix.json');

export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;
        const chat = m.key.remoteJid;
        if (chat === 'status@broadcast') return;

        const myJid = conn.user.id.split('@')[0].split(':')[0].replace(/\D/g, '');
        
        const subSessionsPath = path.resolve('./sesiones_subbots');
        const moodSessionsPath = path.resolve('./sesiones_moods');
        let sessionFolder = '';

        if (fs.existsSync(path.join(subSessionsPath, myJid))) {
            sessionFolder = path.join(subSessionsPath, myJid);
        } else if (fs.existsSync(path.join(moodSessionsPath, myJid))) {
            sessionFolder = path.join(moodSessionsPath, myJid);
        }

        if (sessionFolder) {
            const selfFilePath = path.join(sessionFolder, 'self_status.json');
            if (fs.existsSync(selfFilePath)) {
                const selfData = JSON.parse(fs.readFileSync(selfFilePath, 'utf-8'));
                if (selfData.selfMode && !m.key.fromMe) return; 
            }
        }

        const sender = m.sender;
        const isGroup = chat.endsWith('@g.us');

        const ownerNumbers = config.owner.map(id => (typeof id === 'string' ? id : id[0]).replace(/\D/g, ''));
        const senderNumber = sender.split('@')[0].replace(/\D/g, '');

        const isRealOwner = senderNumber === ownerNumbers[0];
        const isListedOwner = ownerNumbers.includes(senderNumber) || m.key.fromMe;

        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : '';

        if (!body && !m.quoted) return;

        let activePrefixes = config.allPrefixes || ['#', '!', '.'];
        if (fs.existsSync(prefixPath)) {
            try {
                const prefixData = JSON.parse(fs.readFileSync(prefixPath, 'utf-8'));
                if (prefixData.selected) activePrefixes = [prefixData.selected];
            } catch (e) {}
        }

        const foundPrefix = activePrefixes.find(p => body.startsWith(p));
        const usedPrefix = foundPrefix ? foundPrefix : '';

        let commandName = foundPrefix 
            ? body.slice(foundPrefix.length).trim().split(/ +/).shift().toLowerCase()
            : body.trim().split(/ +/).shift().toLowerCase();

        if (!isGroup && !isRealOwner) {
            const allowedPrivateCmds = ['code', 'codemood', 'setname', 'setbanner', 'self'];
            if (!allowedPrivateCmds.includes(commandName)) return; 
        }

        if (isGroup) {
            const comandosGestion = ['setprimary', 'delprimary', 'sockets', 'bots', 'codemood'];
            if (!comandosGestion.includes(commandName)) {
                if (fs.existsSync(databasePath)) {
                    let db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
                    if (db[chat]) {
                        const primaryNumber = db[chat].replace(/\D/g, '');
                        if (myJid !== primaryNumber) return; 
                    }
                }
            }
        }

        const args = body.trim().split(/ +/).slice(1);
        let text = args.join(' ');
        if (!text && m.quoted && m.quoted.text) text = m.quoted.text;

        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (foundPrefix && !cmd) {
            if (!isGroup && !isRealOwner) return;
            return m.reply(`*${config.visuals.emoji2}* El comando \`${usedPrefix}${commandName}\` no fue encontrado.\n> Para ver mi lista completa de comandos usa:\n» *${usedPrefix}help*`);
        }

        if (!cmd) return;
        if (!foundPrefix && !cmd.noPrefix) return;

        if (cmd.isOwner && !isRealOwner && !isListedOwner) {
            return m.reply(`*${config.visuals.emoji2}* \`ACCESO RESTRINGIDO\` *${config.visuals.emoji2}*\n\n> Esta función es exclusiva para los desarrolladores del sistema.`);
        }

        if (cmd.isGroup && !isGroup) {
            return m.reply(`*${config.visuals.emoji4}* \`SÓLO PARA GRUPOS\` *${config.visuals.emoji4}*\n\n> Este comando requiere una comunidad activa para ser ejecutado.`);
        }

        const subPath = path.join(subSessionsPath, myJid, 'settings.json');
        const moodPath = path.join(moodSessionsPath, myJid, 'settings.json');
        let sessionSettings = {};
        if (fs.existsSync(subPath)) sessionSettings = JSON.parse(fs.readFileSync(subPath, 'utf-8'));
        else if (fs.existsSync(moodPath)) sessionSettings = JSON.parse(fs.readFileSync(moodPath, 'utf-8'));

        global.dynamicBotConfig = {
            botName: sessionSettings.shortName || config.botName || 'Kazuma',
            botLongName: sessionSettings.longName || config.botName || 'Kazuma',
            botBanner: sessionSettings.banner || config.visuals.img1
        };

        await cmd.run(conn, m, args, usedPrefix, commandName, text);

    } catch (err) {
        console.error(chalk.red('[ERROR PIXEL]'), err);
    }
};