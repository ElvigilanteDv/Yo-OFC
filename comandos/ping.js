let handler = async (m, { conn }) => {
  let inicio = Date.now()
  await conn.sendMessage(m.chat, { text: ' 🎧 Calculando velocidad... ' }, { quoted: m })
  let fin = Date.now()
  let ping = fin - inicio

  let estado = ''
  if (ping < 100) estado = '🔖 Excelente'
  else if (ping < 200) estado = '📚 Normal'
  else estado = '📒 Lento'

  await m.reply(`*Velocidad*\n\nTiempo: ${ping}ms\nEstado: ${estado}`)
}

handler.help = ['ping']
handler.tags = ['main']
handler.command = ['ping', 'p', 'speed']
handler.desc = 'Mide la velocidad de respuesta del bot'

export default handler
