import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} from '@whiskeysockets/baileys'

let handler = async (m, { conn, usedPrefix: _p }) => {
  let user = global.db.data.users[m.sender]
  if (!user) {
    user = { exp: 0, level: 0 }
    global.db.data.users[m.sender] = user
  }

  let totalreg = Object.keys(global.db.data.users).length
  let uptime = process.uptime()
  let uptimeStr = `${Math.floor(uptime / 86400)}d ${Math.floor(uptime % 86400 / 3600)}h ${Math.floor(uptime % 3600 / 60)}m ${Math.floor(uptime % 60)}s`

  let bannerFinal = 'https://files.catbox.moe/z2ij0x.jpeg'

  const media = await prepareWAMessageMedia(
    { image: { url: bannerFinal } },
    { upload: conn.waUploadToServer }
  )

  const sections = [
    {
      title: '📡 PRINCIPAL',
      rows: [
        { header: 'Menú Principal', title: 'VER COMANDOS', description: 'Muestra los comandos de Principal', id: `${_p}menu_main` }
      ]
    },
    {
      title: '📥 DOWNLOADER',
      rows: [
        { header: 'Menú Downloader', title: 'VER COMANDOS', description: 'Muestra los comandos de Downloader', id: `${_p}menu_downloader` }
      ]
    },
    {
      title: '👑 OWNER',
      rows: [
        { header: 'Menú Owner', title: 'VER COMANDOS', description: 'Muestra los comandos de Owner', id: `${_p}menu_owner` }
      ]
    }
  ]

  const interactiveMessage = proto.Message.InteractiveMessage.create({
    header: {
      title: 'YO OFC',
      subtitle: 'Menú Principal',
      hasMediaAttachment: true,
      imageMessage: media.imageMessage
    },
    body: {
      text: `*POWERED BY EL VIGILANTE*

> Hola, este es el menú de *YO OFC*

USUARIOS: ${totalreg}
UPTIME: ${uptimeStr}

Selecciona una categoría para ver sus comandos

© YO OFC - Bot`
    },
    footer: {
      text: 'YO OFC - Bot'
    },
    nativeFlowMessage: {
      buttons: [
        {
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '📋 CATEGORÍAS',
            sections: sections
          })
        }
      ]
    }
  })

  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {},
        interactiveMessage
      }
    }
  }, { quoted: m })

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  await m.react('📋')
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return false

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id || data.selectedId || data.selectedRowId || null
    if (!id || !id.startsWith(`${global.prefix || '#'}menu_`)) return false

    let category = id.replace(`${global.prefix || '#'}menu_`, '')

    let text = ''
    if (category === 'main') {
      text = `*📡 COMANDOS PRINCIPALES*\n\n`

      let mainCommands = Object.values(global.plugins).filter(cmd => cmd.tags?.includes('main') && cmd.command)
      for (let cmd of mainCommands) {
        let commandName = Array.isArray(cmd.command) ? cmd.command[0] : cmd.command
        let desc = cmd.desc || 'Sin descripción'
        text += `#${commandName} - ${desc}\n`
      }
    } else if (category === 'downloader') {
      text = `*📥 COMANDOS DOWNLOADER*\n\n`

      let downloaderCommands = Object.values(global.plugins).filter(cmd => cmd.tags?.includes('downloader') && cmd.command)
      for (let cmd of downloaderCommands) {
        let commandName = Array.isArray(cmd.command) ? cmd.command[0] : cmd.command
        let desc = cmd.desc || 'Sin descripción'
        text += `#${commandName} - ${desc}\n`
      }
    } else if (category === 'owner') {
      text = `*👑 COMANDOS OWNER*\n\n`

      let ownerCommands = Object.values(global.plugins).filter(cmd => cmd.tags?.includes('owner') && cmd.command)
      for (let cmd of ownerCommands) {
        let commandName = Array.isArray(cmd.command) ? cmd.command[0] : cmd.command
        let desc = cmd.desc || 'Sin descripción'
        text += `#${commandName} - ${desc}\n`
      }
    }

    await conn.sendMessage(m.chat, { text: text }, { quoted: m })
    return true

  } catch (e) {
    console.log(e)
    return true
  }
}

handler.help = ['menu', 'menú', 'help']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help']
handler.register = false

export default handler
