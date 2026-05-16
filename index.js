import { 
    makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    DisconnectReason,
    Browsers,
    downloadMediaMessage
} from 'todleys';
import P from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createInterface } from 'readline';
import chalk from 'chalk';
import CFonts from 'cfonts';

import { config } from './config.js';
import { logger } from './config/print.js';
import { pixelHandler } from './pixel.js';

import * as detectModule from './comandos/grupos-detect.js';
import antiLinkHandler from './comandos/grupos-antilink.js';
import * as welcomeModule from './comandos/grupos-welcome.js';
import { loadAllSubBots } from './sockets/index.js';
import { loadAllMoodBots } from './sockets/SubMoods/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

global.commands = new Map();
global.lastMessageMap = new Map();
let startTime = Date.now();

const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

setInterval(() => {
    try {
        const files = fs.readdirSync(tmpDir);
        const now = Date.now();
        for (const file of files) {
            const filePath = path.join(tmpDir, file);
            const stat = fs.statSync(filePath);
            if (now - stat.mtimeMs > 5 * 60 * 1000) {
                fs.unlinkSync(filePath);
            }
        }
    } catch (e) {}
}, 60 * 1000);

global.db = {
    data: {
        chats: {},
        users: {},
        characters: {},
        settings: {}
    }
};

global.loadCommands = async () => {
    const commandsPath = path.resolve(__dirname, 'comandos');
    if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);
    global.commands.clear();
    const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    await Promise.all(files.map(async (file) => {
        try {
            const filePath = path.join(commandsPath, file);
            const fileUrl = pathToFileURL(filePath).href;
            const module = await import(`${fileUrl}?update=${Date.now()}`);
            if (module.default && module.default.name) {
                global.commands.set(module.default.name.toLowerCase(), module.default);
            }
        } catch (e) {}
    }));
};

async function startBot() {
    const sessionDir = './sesion_bot';
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        version,
        printQRInTerminal: false,
        logger: P({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
        },
        browser: Browsers.ubuntu('Chrome'),
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        getMessage: async (key) => { return null }
    });

    conn.newsletterMetadata = async (type, key, viewRole) => {
        return await conn.newsletterMetadata(type, key, viewRole);
    };

    conn.newsletterAction = async (jid, type) => {
        return await conn.newsletterAction(jid, type);
    };

    conn.newsletterFollow = (jid) => conn.newsletterFollow(jid);
    conn.newsletterUnfollow = (jid) => conn.newsletterUnfollow(jid);
    conn.newsletterMute = (jid) => conn.newsletterMute(jid);
    conn.newsletterUnmute = (jid) => conn.newsletterUnmute(jid);

    conn.newsletterReactMessage = async (jid, serverId, reaction) => {
        await conn.query({
            tag: 'message',
            attrs: {
                to: jid,
                ...(reaction ? {} : { edit: '7' }),
                type: 'reaction',
                server_id: serverId,
                id: conn.generateMessageTag()
            },
            content: [{ tag: 'reaction', attrs: reaction ? { code: reaction } : {} }]
        });
    };

    conn.communityMetadata = async (jid) => {
        return await conn.communityMetadata(jid);
    };

    conn.communityFetchAllParticipating = async () => {
        return await conn.communityFetchAllParticipating();
    };

    conn.communityLinkGroup = async (groupJid, parentCommunityJid) => {
        return await conn.communityLinkGroup(groupJid, parentCommunityJid);
    };

    conn.communityUnlinkGroup = async (groupJid, parentCommunityJid) => {
        return await conn.communityUnlinkGroup(groupJid, parentCommunityJid);
    };

    conn.communityRequestParticipantsList = async (jid) => {
        return await conn.communityRequestParticipantsList(jid);
    };

    conn.getAdminStatus = async (groupJid, senderJid) => {
        const botJid = conn.authState?.creds?.me?.id;
        const meta = await conn.groupMetadata(groupJid).catch(() => null);
        if (!meta || !Array.isArray(meta.participants)) {
            return { isAdmin: false, isBotAdmin: false };
        }
        const normalize = (j) => j.split('@')[0].split(':')[0];
        const senderNorm = normalize(senderJid);
        const botNorm = normalize(botJid);
        const isAdmin = meta.participants.some(p => normalize(p.id || p.jid) === senderNorm && (p.admin === 'admin' || p.admin === 'superadmin'));
        const isBotAdmin = meta.participants.some(p => normalize(p.id || p.jid) === botNorm && (p.admin === 'admin' || p.admin === 'superadmin'));
        return { isAdmin, isBotAdmin };
    };

    await global.loadCommands();

    try {
        if (detectModule.detectHandler) detectModule.detectHandler(conn);
        if (welcomeModule.welcomeHandler) welcomeModule.welcomeHandler(conn);
    } catch (e) {}

    if (!conn.authState.creds.registered) {
        setTimeout(async () => {
            let input = await question(chalk.cyan('\n  [?] Introduce tu número con código de país:\n  > '));
            let phoneNumber = input.replace(/[^0-9]/g, '');
            try {
                let code = await conn.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log(chalk.black.bgCyan(`\n  CODIGO DE VINCULACIÓN: ${code}  \n`));
            } catch (error) {
                console.error('Error al generar código:', error);
            }
        }, 3000);
    }

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.red('[!] Sesión cerrada. Elimina la carpeta sesion_bot.'));
                process.exit();
            } else {
                setTimeout(() => startBot(), 5000);
            }
        } else if (connection === 'open') {
            process.stdout.write('\x1Bc');
            CFonts.say('KAZUMA', { font: 'block', align: 'center', colors: ['cyan', 'magenta'] });
            console.log(chalk.greenBright.bold(`\n  [✨] ¡KAZUMA CONECTADO!\n  [⌚] Tiempo de carga: ${((Date.now() - startTime) / 1000).toFixed(2)}s`));
            await loadAllSubBots(conn);
            await loadAllMoodBots(conn);
        }
    });

    conn.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        if (!global.db.data.chats[id]) return;
        const meta = await conn.groupMetadata(id).catch(() => null);
        if (meta) {
            conn.chats = conn.chats || {};
            conn.chats[id] = conn.chats[id] || {};
            conn.chats[id].metadata = meta;
        }
        if (typeof global.groupParticipantsUpdateHandler === 'function') {
            await global.groupParticipantsUpdateHandler(conn, update);
        }
    });

    conn.ev.on('groups.update', async (updates) => {
        for (const update of updates) {
            const { id } = update;
            if (!id) continue;
            const meta = await conn.groupMetadata(id).catch(() => null);
            if (meta) {
                conn.chats = conn.chats || {};
                conn.chats[id] = conn.chats[id] || {};
                conn.chats[id].metadata = meta;
            }
        }
    });

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m || !m.message) return;
        if (m.key.remoteJid === 'status@broadcast') return;

        const messageTimestamp = (m.messageTimestamp?.low || m.messageTimestamp || Date.now()) * 1000;
        if ((Date.now() - messageTimestamp) > 180000) return;

        m.chat = m.key.remoteJid;
        m.sender = conn.decodeJid ? conn.decodeJid(m.key.participant || m.key.remoteJid) : (m.key.participant || m.key.remoteJid);
        const isGroup = m.chat.endsWith('@g.us');

        if (isGroup) {
            conn.chats = conn.chats || {};
            conn.chats[m.chat] = conn.chats[m.chat] || {};
            let meta = conn.chats[m.chat].metadata;
            if (!meta) {
                meta = await conn.groupMetadata(m.chat).catch(() => null);
                if (meta) conn.chats[m.chat].metadata = meta;
            }
            if (meta && Array.isArray(meta.participants)) {
                const participant = meta.participants.find(p => p.id === m.sender || (p.jid && p.jid === m.sender));
                m.isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin' || false;
                const myJid = conn.authState?.creds?.me?.id.split(':')[0] + '@s.whatsapp.net';
                const botParticipant = meta.participants.find(p => p.id === myJid || (p.jid && p.jid === myJid));
                m.isBotAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin' || false;
            } else {
                m.isAdmin = false;
                m.isBotAdmin = false;
            }
        } else {
            m.isAdmin = false;
            m.isBotAdmin = false;
        }

        const realOwnerNumber = (typeof config.owner[0] === 'string' ? config.owner[0] : config.owner[0][0]).replace(/\D/g, '');
        const senderNumber = m.sender.split('@')[0].replace(/\D/g, '');
        const isRealOwner = senderNumber === realOwnerNumber || m.key.fromMe;

        const msgType = Object.keys(m.message)[0];
        const msgContent = m.message[msgType];
        const contextInfo = msgContent?.contextInfo;

        if (contextInfo?.mentionedJid && Array.isArray(contextInfo.mentionedJid) && conn.signalRepository?.lidMapping) {
            for (let i = 0; i < contextInfo.mentionedJid.length; i++) {
                const jid = contextInfo.mentionedJid[i];
                if (jid.endsWith('@lid')) {
                    const pn = await conn.signalRepository.lidMapping.getPNForLID(jid).catch(() => null);
                    if (pn) {
                        contextInfo.mentionedJid[i] = pn;
                    }
                }
            }
        }

        const body = (
            m.message.conversation || 
            m.message.extendedTextMessage?.text || 
            m.message.imageMessage?.caption || 
            m.message.videoMessage?.caption || 
            m.message.buttonsResponseMessage?.selectedButtonId || 
            m.message.listResponseMessage?.singleSelectReply?.selectedRowId || 
            m.message.templateButtonReplyMessage?.selectedId || ""
        ).trim();

        const prefixes = config.allPrefixes || ['#', '!', '.'];
        const foundPrefix = prefixes.find(p => body.startsWith(p));
        const usedPrefix = foundPrefix || '';

        const commandName = body.slice(usedPrefix.length).trim().split(/ +/).shift().toLowerCase();

        if (!isGroup && !isRealOwner) {
            const allowedPrivateCmds = ['code', 'codemood', 'setname', 'setbanner'];
            if (!allowedPrivateCmds.includes(commandName)) return;
        }

        const isNoPrefixCmd = Array.from(global.commands.values()).some(cmd => 
            cmd.noPrefix && (
                body.toLowerCase().startsWith(cmd.name.toLowerCase()) || 
                (cmd.alias && cmd.alias.some(a => body.toLowerCase().startsWith(a.toLowerCase())))
            )
        );

        if (m.key.fromMe && !foundPrefix && !isNoPrefixCmd) return;

        if (!global.db.data.chats[m.chat]) {
            global.db.data.chats[m.chat] = { 
                rolls: {},
                rpg: {},
                gacha: {}
            };
        }

        if (!global.db.data.users[m.sender]) {
            global.db.data.users[m.sender] = {
                wallet: 0,
                bank: 0,
                daily: { lastClaim: 0, streak: 0 },
                inventory: {},
                marry: null,
                genre: 'No definido',
                birthday: { date: 'No definido', age: 'No definida' }
            };
        }

        global.lastMessageMap.set(m.sender, Date.now());

        m.reply = async (text) => conn.sendMessage(m.chat, { text }, { quoted: m });

        m.download = async () => {
            return await downloadMediaMessage(m, 'buffer', {}, { logger: P({ level: 'silent' }) });
        };

        if (contextInfo?.quotedMessage) {
            const type = Object.keys(contextInfo.quotedMessage)[0];
            const q = contextInfo.quotedMessage[type];
            m.quoted = {
                type, 
                msg: q, 
                id: contextInfo.stanzaId,
                mimetype: q?.mimetype || '',
                text: q?.text || q?.caption || contextInfo.quotedMessage.conversation || '',
                key: {
                    remoteJid: m.chat,
                    fromMe: contextInfo.participant === (conn.user.id.split(':')[0] + '@s.whatsapp.net'),
                    id: contextInfo.stanzaId,
                    participant: contextInfo.participant
                },
                message: contextInfo.quotedMessage,
                download: async () => {
                    const quotedMsg = { message: contextInfo.quotedMessage };
                    return await downloadMediaMessage(quotedMsg, 'buffer', {}, { logger: P({ level: 'silent' }) });
                }
            };
        } else {
            m.quoted = null;
        }

        logger(m, conn);
        await antiLinkHandler(conn, m);
        await pixelHandler(conn, m, config);
    });
}

startBot();