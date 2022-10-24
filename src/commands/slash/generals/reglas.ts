import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, CacheType, Client } from "discord.js";
import { sendMessageSlash } from "../../../utils/functions";

export const reglasScb = new SlashCommandBuilder()
.setName("reglas")
.setDescription(`📜 Te muestra las reglas del servidor.`).toJSON()

export const reglasSlashCommand = async (int: ChatInputCommandInteraction<CacheType>, client: Client) => {
  await int.deferReply()
  
  const embReglas = new EmbedBuilder()
  .setAuthor({name: "📜 Reglas"})
  // .setDescription(`> **1. Respetarse, no insultarse, aquí todos estamos para ayudarnos entre nosotros.**\n\n> **2. No usar palabras obscenas u ofensivas o seras advertido o directamente Baneado.**\n\n> 3. **Respetar la categoría de los canales** *(Ejemplo si son para promocionar solo se podrá promocionar o si son para hablar solo se usaran para hablar).*\n\n> **4. No hacer menciones como @user, @everyone, @here, a menos que se les permita por un rol, canal o un admin.**\n\n> **5.No mencionar a los admins, mods, helpers y usuario si no es por una buena razón y solo es por diversión.**\n\n> **6. No enviar spam al MD de las personas sin antes la persona lo aya permitido** *(ejemplo: primero preguntarle y si acepta ya mandarle el spam de lo contrario es sancionable).*\n\n> **7. No enviar su promoción *(spam)***, en un canal y salir del servidor si lo haces tu promocion sera eliminada.**\n\n> **8. Esta prohibido el contenido NSFW o +18 en canales los cuales no están creados para ese fin.**`)
  .setDescription(`> **1. __Flood__**\n> Inundación de mensajes o mejor conocido como *flood* esta acción esta prohibida, se considera flood cuando envías el mismo mensaje mas de 3 veces en un corto lapso de tiempo.\n\n> **2. __Spam al MD__**\n> Se considera *spam al MD* a la acción de enviar por mensaje directo un mensaje de promoción no deseado al miembro, esta acción esta prohibida.\n\n> **3. __Respeto mutuo__**\n> Respetarse entre ustedes, no hay necesidad de conflictos si algún usuario le molesta no haga conflicto haga un reporte al usuario creando un ticket en el canal <#830165896743223327>.\n\n> **4. __Contenido NSFW__**\n> El contenido explicito o contenido NSFW esta prohibido en la mayoría de canales.\n\n> **5. __Información personal__**\n> Tu información personal es valiosa para ti, por ello en el servidor no esta permitido actos de revelación de datos personales o de otro miembro.\n\n> **6. __Promoción en grupo__**\n> Esta acción es cuando **2** o mas miembro del servidor publican el mismo contenido ya sea un servidor, YT, etc, esa acción es sancionable. \n\n> **7. __Publicar y salir del servidor__**\n> En el caso de que entres al servidor, publiques tu promoción y salgas del servidor tu publicación será eliminada.\n\n> **8. __Respetar la función de cada canal.__**\n> Respetar si el canal es solo para publicar contenido de YouYube o si es solo para usar un bot en concreto, normalmente en la descripción del canal te informa la finalidad del canal.\n\n> **9. __Menciones en masa o menciones masivas__**\n>  Consiste en mencionar repetidas veces a un miembro o rol, esa acción esta prohibida. \n\n> **10. __Usar el sentido común__**\n> Compórtate adecuadamente, no hagas cosas que aunque no estén en las reglas están mal, en todo caso si el equipo de soporte se ve en la necesidad de sancionarte lo hará.\n\n> **11. __Términos y condiciones de Discord__**\n> No incumplir el [**ToS**](https://discord.com/terms) de Discord.`)
  .setColor(int.guild?.members.me?.displayHexColor || 'White')
  .setFooter({text: int.guild?.name || 'undefined', iconURL: int.guild?.iconURL() || undefined})
  .setTimestamp()

  sendMessageSlash(int, {embeds: [embReglas]})
}