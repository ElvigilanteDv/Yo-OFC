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

    if (!conn.authState.creds.registered) {
        setTimeout(async () => {
            let input = await question(chalk.cyan('\n  [?] Introduce tu número con código de país:\n  > '));
            let phoneNumber = input.replace(/[^0-9]/g, '');
            try {
                let code = await conn.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log(chalk.black.bgCyan(`\n  CODIGO DE VINCULACIÓN: ${code}  \n`));
            } catch (error) {
                console.error(error);
            }
        }, 3000);
    }

    await global.loadCommands();

    try {
        if (detectModule.detectHandler) detectModule.detectHandler(conn);
        if (welcomeModule.welcomeHandler) welcomeModule.welcomeHandler(conn);
    } catch (e) {}

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                fs.rmSync(sessionDir, { recursive: true, force: true });
                process.exit();
            } else {
                setTimeout(() => startBot(), 5000);
            }
        } else if (connection === 'open') {
            process.stdout.write('\x1Bc');
            CFonts.say('KAZUMA', { font: 'block', align: 'center', colors: ['cyan', 'magenta'] });
            await loadAllSubBots(conn);
            await loadAllMoodBots(conn);
        }
    });

    conn.ev.on('group-participants.update', async (update) => {
        const { id } = update;
        const meta = await conn.groupMetadata(id).catch(() => null);
        if (meta) {
            conn.chats = conn.chats || {};
            conn.chats[id] = conn.chats[id] || {};
            conn.chats[id].metadata = meta;
        }
    });

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m || !m.message) return;
        if (m.key.remoteJid === 'status@broadcast') return;

        m.chat = m.key.remoteJid;
        m.sender = conn.decodeJid ? conn.decodeJid(m.key.participant || m.key.remoteJid) : (m.key.participant || m.key.remoteJid);
        const isGroup = m.chat.endsWith('@g.us');

        m.reply = async (text) => conn.sendMessage(m.chat, { text }, { quoted: m });

        if (isGroup) {
            conn.chats = conn.chats || {};
            conn.chats[m.chat] = conn.chats[m.chat] || {};
            let meta = conn.chats[m.chat].metadata;
            if (!meta) {
                meta = await conn.groupMetadata(m.chat).catch(() => null);
                if (meta) conn.chats[m.chat].metadata = meta;
            }
            if (meta) {
                const participant = meta.participants.find(p => p.id === m.sender);
                m.isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin' || false;
            }
        }

        const realOwnerNumber = (typeof config.owner[0] === 'string' ? config.owner[0] : config.owner[0][0]).replace(/\D/g, '');
        const isRealOwner = m.sender.split('@')[0].replace(/\D/g, '') === realOwnerNumber || m.key.fromMe;

        const body = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || "").trim();
        const prefixes = config.allPrefixes || ['#', '!', '.'];
        const usedPrefix = prefixes.find(p => body.startsWith(p)) || '';
        const commandName = body.slice(usedPrefix.length).trim().split(/ +/).shift().toLowerCase();
        const args = body.slice(usedPrefix.length + commandName.length).trim().split(/ +/).filter(v => v);
        const text = args.join(' ');

        const command = global.commands.get(commandName) || Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (command) {
            if (command.isGroup && !isGroup) return;
            if (command.isAdmin && !m.isAdmin && !isRealOwner) return;
            try {
                await command.run(conn, m, { args, text, usedPrefix, commandName });
            } catch (e) { console.error(e); }
        }

        if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { welcome: false };
        
        logger(m, conn);
        await antiLinkHandler(conn, m);
        await pixelHandler(conn, m, config);
    });
}

startBot();