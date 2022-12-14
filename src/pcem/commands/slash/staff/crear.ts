import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, CacheType, Client, ChannelType } from "discord.js";
import ms from "ms";
import { estadisticas } from "../../..";
import { botDB } from "../../../db";
import { alliancesModel, botModel, collaboratorsModel, rafflesModel, surveysModel } from "../../../models";
import { setSlashError, setSlashErrors, createEmbedMessage } from "../../../../utils/functions";

export const crearScb = new SlashCommandBuilder()
.setName("crear")
.setDescription(`¡Crea!`)
.addSubcommand(alianza=> 
  alianza.setName(`alianza`)
  .setDescription(`🤝 !Crea una alianza¡.`)
  .addBooleanOption(ping=> ping.setName("notificación").setDescription(`🔔 Notifica a los miembros que tienen el rol de alianza.`).setRequired(true))
  .addUserOption(us=> us.setName("aliado").setDescription("🧑 Proporciona el aliado (el miembro con el que has creado la alianza).").setRequired(false))
)

.addSubcommand(colaborador=> 
  colaborador.setName(`colaborador`)
  .setDescription(`💎 Crea un canal para el colaborador y le agrega el rol.`)
  .addUserOption(usuario=> usuario.setName(`colaborador`).setDescription(`🧑 El nuevo colaborador.`).setRequired(true))
  .addStringOption(nombre=> nombre.setName(`nombre`).setDescription(`🔖 Nombre del canal para el colaborador.`).setRequired(true))
)

.addSubcommand(encuesta => 
  encuesta.setName(`encuesta`)
  .setDescription(`📊 Crea una encuesta.`)
  .addStringOption(titulo=> 
    titulo.setName(`titulo`)
    .setDescription(`🔖 El titulo del embed de la encuesta.`)
    .setRequired(true)
  )
  .addStringOption(tiempo=> 
    tiempo.setName(`tiempo`)
    .setDescription(`⏱️ El tiempo que durara la encuesta.`)
    .setRequired(true)
  )
  .addStringOption(descripcion=> 
    descripcion.setName(`descripción`)
    .setDescription(`📄 Descripción del embed de la encuesta.`)
    .setRequired(false)
  )
  .addChannelOption(canal=> 
    canal.setName(`canal`)
    .setDescription(`📚 Canal en el cual se enviara la encuesta.`)
    .setRequired(false)
  )
  .addStringOption(opcion1=> opcion1.setName(`opción1`).setDescription(`1️⃣ Agrega la opción 1.`).setRequired(false))
  .addStringOption(opcion2=> opcion2.setName(`opción2`).setDescription(`2️⃣ Agrega la opción 2.`).setRequired(false))
  .addStringOption(opcion3=> opcion3.setName(`opción3`).setDescription(`3️⃣ Agrega la opción 3.`).setRequired(false))
  .addStringOption(opcion4=> opcion4.setName(`opción4`).setDescription(`4️⃣ Agrega la opción 4.`).setRequired(false))
  .addStringOption(opcion5=> opcion5.setName(`opción5`).setDescription(`5️⃣ Agrega la opción 5.`).setRequired(false))
  .addStringOption(opcion6=> opcion6.setName(`opción6`).setDescription(`6️⃣ Agrega la opción 6.`).setRequired(false))
)

.addSubcommand(sorteo => 
  sorteo.setName(`sorteo`)
  .setDescription(`🎉 Crea un sorteo.`)
  .addStringOption(titulo=> titulo.setName(`titulo`)
    .setDescription(`🔖 El titulo del embed del sorteo.`)
    .setRequired(true)
  )
  .addStringOption(tiempo=> 
    tiempo.setName(`tiempo`)
    .setDescription(`⏱️ El tiempo que durara el sorteo activo.`)
    .setRequired(true)
  )
  .addIntegerOption(ganadores=> 
    ganadores.setName(`ganadores`)
    .setDescription(`👥 Cantidad de ganadores del sorteo.`)
    .setRequired(true)
  )
  .addStringOption(descripcion=> 
    descripcion.setName(`descripción`)
    .setDescription(`📄 Descripción del embed del sorteo.`)
    .setRequired(false)
  )
  .addChannelOption(canal=> 
    canal.setName(`canal`)
    .setDescription(`📚 Canal en el cual se enviara el sorteo.`)
    .setRequired(false)
  )
).toJSON()


export const crearSlashCommand = async (int: ChatInputCommandInteraction<CacheType>, client: Client) => {
  const { options, guild, user } = int, subCommand = options.getSubcommand(true), { serverId, emoji, color } = botDB, author = guild?.members.cache.get(user.id)
  const dataBot = await botModel.findById(client.user?.id || '')
  // const {} = PermissionFlagsBits

  if(subCommand == "alianza"){
    estadisticas.comandos++
    const dataAli = await alliancesModel.findById(serverId), arrayMi = dataAli?.miembros, arraySv = dataAli?.servidores
    const channel = guild?.channels.cache.get('826863938057797633'), channelLog = guild?.channels.cache.get(dataBot?.logs.alliances || '941880387020419083')
    const notificacion = int.options.getBoolean("notificación", true), aliado = int.options.getUser("aliado")
    let enviado = false

    if(guild?.ownerId != int.user.id && !author?.permissions.has('Administrator') && !author?.roles.cache.has('887444598715219999')) return setSlashError(int, 'No eres miembro de soporte del servidor, por lo tanto no puedes utilizar el comando.')


    const embAdvertencia = new EmbedBuilder()
    .setTitle(`${emoji.warning} Advertencia`)
    .setDescription(`Tienes **30** segundos para proporcionar la plantilla.`)
    .setColor(guild?.members.me?.displayHexColor || 'White')
    int.reply({embeds: [embAdvertencia], ephemeral: true})
   
    setTimeout(()=>{
      if(!enviado){
        const embTiempoAgotado = new EmbedBuilder()
        .setTitle(`${emoji.warning} Tiempo agotado`)
        .setDescription(`Se te ha terminado el tiempo para enviar la plantilla.`)
        .setColor('Yellow')
        int.editReply({embeds: [embTiempoAgotado]}).catch(c=> console.log(c))
      }
    }, 30000)


    const colector = int.channel?.createMessageCollector({filter: u=> u.author.id == int.user.id, time: 30000, max: 1})

    colector?.on("collect", async (m) => {
      async function alianzaSystem (des1: string, des2: string, des3: string, contenido: string) {
        const embPlantilla = new EmbedBuilder()
        .setAuthor({name: int.user.tag, iconURL: int.user.displayAvatarURL()})
        .setDescription(des1)
        .setColor(guild?.roles.cache.get("840704364158910475")?.hexColor || 'White')
        if(channel?.type == ChannelType.GuildText) channel.send({content: contenido}).then(mc=>{
          const embEnviada = new EmbedBuilder()
          .setTitle(`${emoji.afirmative} Alianza creada`)
          .setDescription(des2)
          .setColor(guild?.members.me?.displayHexColor || 'White')
          .setTimestamp()
          
          mc.reply({embeds: [embPlantilla]})
          enviado = true
          
          int.editReply({embeds: [embEnviada]})
          if(aliado) guild?.members.cache.get(aliado.id)?.roles.add("895394175481159680")
        })

        const embRegistro = new EmbedBuilder()
        .setAuthor({name: int.user.tag, iconURL: int.user.displayAvatarURL()})
        .setTitle(`${emoji.afirmative} Alianza creada`)
        .setDescription(des3)
        .setColor(guild?.roles.cache.get("840704364158910475")?.hexColor || 'White')
        .setTimestamp()
        if(aliado) embRegistro.setFooter({text: aliado.tag, iconURL: aliado.displayAvatarURL()})
        
        if(channelLog?.type == ChannelType.GuildText) channelLog.send({embeds: [embRegistro]})

        if(arrayMi?.some(s=> s.id == int.user.id)){
          let miembro = arrayMi.find(f=> f.id == int.user.id)
          if(miembro){
            miembro.cantidad++
            miembro.tag = int.user.tag
          }
          
        }else{
          arrayMi?.push({tag: int.user.tag, id: int.user.id, cantidad: 1})
        }
        await alliancesModel.findByIdAndUpdate(serverId, {miembros: arrayMi})
      }

      if(m){
        let plantilla = m.content.replace(/@/g, "")
        setTimeout(()=>{
          m.delete().catch(c=>c)
        }, 400)

        if(!["discord.gg/", "discord.com/invite/"].some(s=> plantilla.includes(s))) return setSlashError(int, `La plantilla que has proporcionado no es una plantilla de un servidor ya que no contienen ningún enlace de invitación a un servidor de Discord.`)

        client.fetchInvite(plantilla.split(/ +/g).find(f=> ["discord.com/invite/", "discord.gg/"].some(s=> f.includes(s))) || '').then(async invite=> {
          if(arraySv?.some(s=> s.id == invite.guild?.id)){
            let servidor = arraySv?.find(f=> f.id==invite.guild?.id)
            
            if(servidor){
              if(servidor.tiempo >= Math.floor(Date.now()-ms("7d"))) return int.editReply({embeds: [
                createEmbedMessage(
                  `${emoji.negative} Error`, 
                  `Ya se ha echo alianza con ese servidor y esa alianza se ha echo **<t:${Math.floor((servidor?.tiempo || 0)/1000)}:R>** así que no se puede renovar por ahora.`, 
                  color.negative
                )
              ]})
              
              servidor.nombre = invite.guild?.name || ''
              servidor.tiempo = Date.now()
              servidor.invitacion = invite.url
              servidor.miembros = invite.memberCount
            }
            
          }else{
            arraySv?.push({nombre: invite.guild?.name || '', id: invite.guild?.id || '', tiempo: Date.now(), invitacion: invite.url, miembros: invite.memberCount})
          }
          await alliancesModel.findByIdAndUpdate(serverId, {servidores: arraySv})

          if(aliado){
            if(setSlashErrors(int, [
              [
                Boolean(aliado.bot),
                `Un bot no puede ser un aliado.`
              ],
              [
                Boolean(aliado.id == int.user.id),
                `Tu mismo no puedes elegirte como aliado, si quieres hacer una alianza con el servidor deja que otro miembro publique la plantilla te añada como aliado.`
              ]
            ])) return

            if(notificacion){
              alianzaSystem(`*Alianza creada por ${int.user} y por el aliado <@${aliado.id}>*\n**¿Quieres hacer una alianza?**, utiliza el comando de barra diagonal \`\`/información allianzas\`\` al utilizarlo obtendrás la información necesaria para crear una alianza.`, 
              `Plantilla enviada al canal <#${channel?.id}>, gracias por la alianza de ${aliado}.`,
              `Alianza creada por ${int.user}, gracias al aliado ${aliado}, se ha utilizado el ping <@&840704364158910475>.`,
              `${plantilla}\n<@&840704364158910475>`
              )

            }else{
              alianzaSystem(`*Alianza creada por ${int.user} y por el aliado <@${aliado.id}>*\n**¿Quieres hacer una alianza?**, utiliza el comando de barra diagonal \`\`/información allianzas\`\` al utilizarlo obtendrás la información necesaria para crear una alianza.`, 
              `Plantilla enviada al canal <#${channel?.id}>, gracias por la alianza de ${aliado}.`,
              `Alianza creada por ${int.user}, gracias al aliado ${aliado}, *no se ha utilizado ping*.`,
              plantilla
              )

            }
          }else{
            if(notificacion){
              alianzaSystem(`*Alianza creada por ${int.user}*\n**¿Quieres hacer una alianza?**, utiliza el comando de barra diagonal \`\`/información allianzas\`\` al utilizarlo obtendrás la información necesaria para crear una alianza.`, 
              `Plantilla enviada al canal <#${channel?.id}>, gracias por la alianza.`,
              `Alianza creada por ${int.user} que ha utilizado el ping <@&840704364158910475>.`,
              `${plantilla}\n<@&840704364158910475>`
              )

            }else{
              alianzaSystem(`*Alianza creada por ${int.user}*\n**¿Quieres hacer una alianza?**, utiliza el comando de barra diagonal \`\`/información allianzas\`\` al utilizarlo obtendrás la información necesaria para crear una alianza.`, 
              `Plantilla enviada al canal <#${channel?.id}>, gracias por la alianza.`,
              `Alianza creada por ${int.user}, *no se ha utilizado ping*.`,
              plantilla
              )

            }
          }
        }).catch(error=> {
          setSlashError(int, `Lo ciento no he podido obtener información de la invitación de la plantilla, puede ser que la invitación haya expirado o no sea real.`)
        })
        // console.log("No paso nada", plantilla)
      }
    })
  }

  if(subCommand == "colaborador"){
    estadisticas.comandos++
    const dataCol = await collaboratorsModel.findById(serverId), arrayCo = dataCol?.colaboradores, member = guild?.members.cache.get(options.getUser('colaborador', true).id), channelName  = int.options.getString('nombre', true)
    
    if(setSlashErrors(int, [
      [
        Boolean(!author?.permissions.has('Administrator')),
        `¡No eres administrador del servidor!, no puede utilizar el comando.`
      ],
      [
        Boolean(member?.user.bot),
        `El miembro que has proporcionado *(${member})* es un bot, un bot no puede ser colaborador.`
      ],
      [
        Boolean(member?.id == user.id),
        `El miembro que has proporcionado *(${member})* eres tu, no te puedes otorgar los veneficios como colaborador.`
      ],
      [
        Boolean(member?.id == guild?.ownerId),
        `El miembro que has proporcionado *(${member})* es el sueño del servidor no tiene sentido que sea colaborador.`
      ]
    ])) return

    if(arrayCo?.some(s=>s.id == member?.id)){
      const colaborador = arrayCo.find(f=>f.id == member?.id)

      if(colaborador?.colaborador){
        const embEscolaborador = new EmbedBuilder()
        .setTitle(`💎 Es colaborador`)
        .setDescription(`El miembro ${member} ya es colaborador del servidor.`)
        .setColor(member?.displayHexColor || 'White')
        int.reply({ephemeral: true, embeds: [embEscolaborador]})

      }else if(colaborador){
        member?.roles.add(dataCol?.datos.rolID || '')
        guild?.channels.create({name: `『』${channelName}`, parent: dataCol?.datos.categoriaID || '', permissionOverwrites: [{id: member?.id || '', deny: 'ManageRoles', allow: ['CreateInstantInvite', 'ManageChannels', 'AddReactions', 'ViewChannel', 'SendMessages', 'SendTTSMessages', 'ManageMessages', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'MentionEveryone', 'UseExternalEmojis', 'ManageWebhooks', 'UseApplicationCommands', 'ManageThreads', 'SendMessagesInThreads', 'CreatePublicThreads', 'CreatePrivateThreads', 'UseExternalStickers']}]}).then(async tc=>{
          const embCanalCreado = new EmbedBuilder()
          .setTitle(`<a:afirmativo:856966728806432778> Canal creado`)
          .setDescription(`El canal ${tc} ha sido creado para el colaborador ${member} y se le ha agregado el rol <@&${dataCol?.datos.rolID}>.`)
          .setColor(guild?.members.me?.displayHexColor || 'White')
          int.reply({content: `<@${member?.id}>`, embeds: [embCanalCreado]})
          colaborador.id = member?.id || ''
          colaborador.tag = member?.user.tag || ''
          colaborador.canalID = tc.id
          colaborador.fecha = Date.now()
          colaborador.colaborador = true
          colaborador.tiempo = false
          colaborador.notificado = true
          await collaboratorsModel.findByIdAndUpdate(serverId, {colaboradores: arrayCo})
        })
      }
    }else{
      member?.roles.add(dataCol?.datos.rolID || '')
      guild?.channels.create({name: `『』${channelName}`, parent: dataCol?.datos.categoriaID, permissionOverwrites: [{id: member?.id || '', deny: "ManageRoles", allow: ['CreateInstantInvite', 'ManageChannels', 'AddReactions', 'ViewChannel', 'SendMessages', 'SendTTSMessages', 'ManageMessages', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'MentionEveryone', 'UseExternalEmojis', 'ManageWebhooks', 'UseApplicationCommands', 'ManageThreads', 'SendMessagesInThreads', 'CreatePublicThreads', 'CreatePrivateThreads', 'UseExternalStickers']}]}).then(async tc=>{
        const embCanalCreado = new EmbedBuilder()
        .setTitle(`${emoji.afirmative} Canal creado`)
        .setDescription(`El canal ${tc} ha sido creado para el nuevo colaborador ${member} y se le ha agregado el rol <@&${dataCol?.datos.rolID}>.`)
        .setColor(guild?.members.me?.displayHexColor || 'White')
        int.reply({content: `<@${member?.id}>`, embeds: [embCanalCreado]})
        arrayCo?.push({id: member?.id || '', tag: member?.user.tag || '', canalID: tc.id, fecha: Date.now(), tiempo: false, colaborador: true, notificado: true})
        await collaboratorsModel.findByIdAndUpdate(serverId, {colaboradores: arrayCo})
      })
    }
  }

  if(subCommand == "encuesta"){
    estadisticas.comandos++
    const dataEnc = await surveysModel.findById(serverId), arrayEn = dataEnc?.encuestas
    const colorEb = guild?.roles.cache.get(dataEnc?.datos.rolID || '')?.hexColor
    const title = int.options.getString("titulo", true), tiempo = int.options.getString("tiempo", true), description = int.options.getString("descripción") || undefined, canal = guild?.channels.cache.get(options.getChannel("canal")?.id || '') || int.channel, opcion1 = options.getString("opción1"), opcion2 = options.getString("opción2"), opcion3 = options.getString("opción3"), opcion4 = options.getString("opción4"), opcion5 = options.getString("opción5"), opcion6 = options.getString("opción6")
    let cantidadOpciones = 0, posicion = 0, opciones: {emoji: string, opcion: string, votos: number}[] = []

    ;[opcion1, opcion2, opcion3, opcion4, opcion5, opcion6].forEach(option=> {
      if(option){
        cantidadOpciones++
        opciones.push({emoji: dataEnc?.datos.emojis[posicion] || '', opcion: option, votos: 0})
        posicion++
      }
    })
    
    if(setSlashErrors(int, [
      [
        Boolean(!author?.permissions.has('Administrator')),
        `¡No eres administrador del servidor!, no puede utilizar el comando.`
      ],
      [
        Boolean(title.length > 200),
        `El tamaño del titulo *(${title.length})* supera el limite de **200** caracteres, proporciona un titulo más pequeño.`
      ],
      [
        Boolean(!isNaN(Number(tiempo))),
        `El tiempo proporcionado *(${tiempo})* no es valido ya que solo son números, también proporciona una letra que indique si son minutos, horas o días.`
      ],
      [
        Boolean(!ms(tiempo)),
        `El tiempo proporcionado *(${tiempo})* es in correcto.\nEjemplos:\n**Minutos:** 3m, 5m, 20m, 60m, etc\n**Horas:** 1h, 4h, 10h, 24h, etc\n**Días:** 1d, 2d, 4d, etc.`
      ],
      [
        Boolean(ms(tiempo) > ms("10d")),
        `La cantidad de tiempo que has proporcionado *(${tiempo})* supera el limite de tiempo que un sorteo puede estar activo, proporciona un tiempo menor.`
      ],
      [
        Boolean(!opcion1 && !opcion2 && !opcion3 && !opcion4 && !opcion5 && !opcion6),
        `No has proporcionado ninguna opción para la encuesta, no se puede realizar una encuesta sin opciones.`
      ],
      [
        Boolean(cantidadOpciones < 2),
        `Solo has proporcionado **1** opción, una encuesta debe de tener mínimo **2** opciones.`
      ],
      [
        Boolean(description && description.length > 600),
        `El tamaño de la descripción *(${description?.length})* supera el limite de **600** caracteres, proporciona una descripción más pequeña.`
      ]
    ])) return

    const embEncuesta = new EmbedBuilder({title, description})
    .setAuthor({name: `⏸️ Encuesta en curso`})
    .addFields(
      {name: `🧩 **Opciones**`, value:`${opciones.map(m=> `${m.emoji} ${m.opcion}`).join("\n")}`},
      {name: `${emoji.information} **Información**`, value: `¡Selecciona una opción!\nFinaliza: <t:${Math.floor((Date.now()+ms(tiempo))/1000)}:R> *(<t:${Math.floor((Date.now()+ms(tiempo))/1000)}:F>)*\nCreada por: ${int.user}.`}
    )
    .setColor(colorEb || 'White')

    const embEnviado = new EmbedBuilder()
    .setTitle(`${emoji.afirmative} Encuesta creada`)
    .setDescription(`La encuesta ha sido creada en este canal.`)
    .setColor(color.afirmative)

    if(canal && (canal.type == ChannelType.GuildText || canal.type == ChannelType.GuildAnnouncement)){
      canal.send({embeds: [embEncuesta], content: `**¡Nueva encuesta <@&${dataEnc?.datos.rolID}>!**`}).then(async ts=>{
        if(canal.id != int.channelId) embEnviado.setDescription(`La encuesta ha sido creada en el canal ${canal}.`)
        for(let r=0; r<opciones.length; r++){
          if(dataEnc) ts.react(dataEnc.datos.emojis[r])
        }
        int.reply({ephemeral: true, embeds: [embEnviado]})
        arrayEn?.push({id: ts.id, canalID: canal.id, finaliza: Math.floor(Date.now()+ms(tiempo)), autorID: int.user.id, creado: Date.now(), activa: true, opciones: opciones})
        await surveysModel.findByIdAndUpdate(serverId, {encuestas: arrayEn})
      })
    }
  }

  if(subCommand == "sorteo"){
    estadisticas.comandos++
    let dataSor = await rafflesModel.findById(serverId), arraySo = dataSor?.sorteos, colorEb = guild?.roles.cache.get(dataSor?.datos.rolID || '')?.hexColor
    const title = options.getString("titulo", true), tiempo = options.getString("tiempo", true), preGanadores = options.getInteger("ganadores"), ganadores = preGanadores ? Math.floor(preGanadores) : null, description = options.getString("descripción") || undefined, canal = guild?.channels.cache.get(options.getChannel("canal")?.id || '') || int.channel 

    if(setSlashErrors(int, [
      [
        Boolean(!author?.permissions.has('Administrator')),
        `¡No eres administrador del servidor!, no puede utilizar el comando.`
      ],
      [
        Boolean(title.length > 200),
        `El tamaño del titulo *(${title.length})* supera el limite de **200** caracteres, proporciona un titulo mas pequeño.`
      ],
      [
        Boolean(!isNaN(Number(tiempo))),
        `El tiempo proporcionado *(${tiempo})* no es valido ya que solo son números, también proporciona una letra que indique si son minutos, horas o días.`
      ],
      [
        Boolean(!ms(tiempo)),
        `El tiempo proporcionado *(${tiempo})* es in correcto.\nEjemplos:\n**Minutos:** 3m, 5m, 20m, 60m, etc\n**Horas:** 1h, 4h, 10h, 24h, etc\n**Días:** 1d, 2d, 4d, etc.`
      ],
      [
        Boolean(ms(tiempo) > ms("10d")),
        `La cantidad de tiempo que has proporcionado *(${tiempo})* supera el limite de tiempo que un sorteo puede estar activo, proporciona un tiempo menor.`
      ],
      [
        Boolean(ganadores && ganadores > 10),
        `La cantidad de ganadores *(${ganadores})* supera el limite de ganadores de un sorteo.`
      ],
      [
        Boolean(description && description.length > 600),
        `El tamaño de la descripción *(${description?.length})* supera el limite de **600** caracteres, proporciona una descripción mas pequeña.`
      ]
    ])) return

    const embSorteo = new EmbedBuilder({title, description})
    .setAuthor({name: `⏸️ Sorteo en curso`})
    .addFields(
      {name: `\u200B`, value: `¡Reacciona a ${emoji.confetti} para participar!\nFinaliza: <t:${Math.floor((Date.now()+ms(tiempo))/1000)}:R> *(<t:${Math.floor((Date.now()+ms(tiempo))/1000)}:F>)*\nGanadores: ${ganadores==1 ? `solo **1**`: `**${ganadores}**`}\nCreado por: ${int.user}.`}
    )
    .setColor(colorEb || 'White')
    .setFooter({text: guild?.name || 'undefined', iconURL: guild?.iconURL() || undefined})
    .setTimestamp()

    const embEnviado = new EmbedBuilder()
    .setTitle(`${emoji.afirmative} Sorteo creado`)
    .setDescription(`El sorteo ha sido creado este canal.`)
    .setColor(color.afirmative)
    
    if(canal && (canal.type == ChannelType.GuildText || canal.type == ChannelType.GuildAnnouncement)){
      canal.send({embeds: [embSorteo], content: `**¡Nuevo sorteo <@&${dataSor?.datos.rolID}>**!`}).then(async ts=>{
        if(canal.id != int.channelId) embEnviado.setDescription(`El sorteo ha sido creado en el canal ${canal}.`)
        ts.react("974801702307901490")
        int.reply({ephemeral: true, embeds: [embEnviado]})
        arraySo?.push({id: ts.id, canalID: canal.id, finaliza: Math.floor(Date.now()+ms(tiempo)), ganadores: ganadores || 1, autorID: int.user.id, creado: Date.now(), activo: true, participantes: []})
        await rafflesModel.findByIdAndUpdate(serverId, {sorteos: arraySo})
      })
    }
  }
} // Linea 460 a