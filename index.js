const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ChannelType,
    MessageFlags  
  } = require('discord.js');
  
  // Inicializa el cliente
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
  });
  
  // Token del bot que lo asocia con el bot creado en la pagina de desarrolladores de discord
  const TOKEN = 'colocar token aqui';
  client.on('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`); //cuando el bot se conecta nos regresa por la consola "Bot conectado como "nombre del bot"
  });
  
  client.on('messageCreate', async (message) => {
    // Ignorar mensajes escritos por el bot para evitar recursividad de comandos
    if (message.author.bot) return;

/****************************************************************************************************************************************************************************************************************************************** */
/****************************************************************************************************************************************************************************************************************************************** */
/****************************************************************************************************************************************************************************************************************************************** */

// Para listar los comandos del bot
if (message.content.startsWith('*Comandos')) { //indicamos que la accion inicia cuando se escriba la secuencia *comandos
  const commandsMessage = `
1) !Embed = Crea un embed y lo envía a un canal específico.
2) !Mensaje = Envía un mensaje a un canal específico.
  `; //aqio guardamos la lista de comando en una constante
  

  await message.channel.send({ // esta linea se usa para enviar un mensaje en el canal que se ejecuta el comando y se usa "content": para indicar el contenido del mensaje, y flags: MEssageFlags.ephimeral para que el mensaje enviado solo lo vea quien ejecuto el comando
    content: commandsMessage,
    flags: MessageFlags.Ephemeral, //hacemos que la respuesta con los comandos solo se vean para el usuario que ejecuto el comando desaparece a los 15 seg
  });
}
 
/****************************************************************************************************************************************************************************************************************************************** */
/****************************************************************************************************************************************************************************************************************************************** */
/****************************************************************************************************************************************************************************************************************************************** */
// Comando para crear y enviar un embed
if (message.content.startsWith('!Embed')) {
  const filter = (response) => response.author.id === message.author.id; // para que el bot acepte solo respuestas del usuario que ejecuto el comando

  try {
    // Paso 1: Solicitar el título del embed
    await message.channel.send('Por favor, ingresa el título del embed:');
    const collectedTitle = await message.channel.awaitMessages({ filter, max: 1, time: 120000, errors: ['time'] });
    const userTitle = collectedTitle.first().content;

    // paso 2: pedir descripcion
    await message.channel.send('Por favor, ingresa una descripcion del embed:');
    const collectedDescription = await message.channel.awaitMessages({ filter, max: 1, time: 180000, errors: ['time'] });
    const userDescription = collectedDescription.first().content;

    //pase 3: pedir url miniatura de arriba a la derecha
    await message.channel.send('Por favor, el url de la imagen que deseas mostrar como miniatura (arriba a la derecha):');
    const collectedMinimg = await message.channel.awaitMessages({ filter, max: 1, time: 120000, errors: ['time'] });
    const userMinimg = collectedMinimg.first().content;

    //pase 3: pedir url imagen principal
    await message.channel.send('Por favor, ingresa el URL de la imagen principal:');
    const collectedImgPrincipal = await message.channel.awaitMessages({ filter, max: 1, time: 120000, errors: ['time'] });
    const userImgPrincipal = collectedImgPrincipal.first().content;

    // paso 4: ingresa el txto que ira en el pie de foto
    await message.channel.send('Por favor, ingresa el texto del pie de foto');
    const collectedPiedeFoto = await message.channel.awaitMessages({ filter, max: 1, time: 120000, errors: ['time'] });
    const userPiedeFoto = collectedPiedeFoto.first().content;
    
    // paso 5: ingresa el URL de la imagen de pie de foto
    await message.channel.send('Por favor, ingresa el URL de la imagen del pie de foto:');
    const collectedImgfooter = await message.channel.awaitMessages({ filter, max: 1, time: 120000, errors: ['time'] });
    const userImgFooter = collectedImgfooter.first().content;

    // Paso 6: Crear el embed preliminar con el título proporcionado "no se mostarra hasta que lo enviamos al canal elegido"
    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle(userTitle)
      .setDescription(userDescription)
      .setAuthor({
        name: message.client.user.username,
        iconURL: message.client.user.displayAvatarURL(),
      })
      .setThumbnail(userMinimg)
      .setImage(userImgPrincipal)
      .setFooter({
        text: userPiedeFoto,
        iconURL: userImgFooter,
      });

      try {
      // Paso 7: Solicitar la mención de un canal
      await message.channel.send('Menciona el canal donde deseas enviar el mensaje (usa `#` para autocompletar):');
      const collectedChannel = await message.channel.awaitMessages({ filter, max: 1, time: 120000, errors: ['time'] }); //aqui indicamos el tiempo de espera del bot para una respuesta del usuario antes de cancelar la accion
      const mentionedChannel = collectedChannel.first().mentions.channels.first();  // gaurdamos el canal seleccionado en una constante
  
      // Verificar si se mencionó un canal válido
      if (!mentionedChannel) {
        return message.channel.send({
          content: 'No mencionaste un canal válido. El comando ha sido cancelado.',
          flags: MessageFlags.Ephemeral,
      });
      }
  
      // Verificar permisos antes de enviar el mensaje
      if (!mentionedChannel.permissionsFor(message.guild.members.me).has('SEND_MESSAGES')) {
        return message.channel.send({
          content: `No tengo permisos para enviar mensajes en el canal: ${mentionedChannel.name}.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      // Enviar el embed al canal seleccionado

        await mentionedChannel.send({ embeds: [embed] }); //enviamos el embed al canal seleccionado pasando dicho canal por la constante donde lo habiamos almacenado
        await message.channel.send(`El embed ha sido enviado al canal: ${mentionedChannel.name}.`); // mensaje de verificacion
      } catch (error) {
        console.error('Error al enviar el embed:', error);
        await message.channel.send('Hubo un problema al enviar el embed. Verifica los permisos del bot.');
      }

  } catch (error) {
    message.channel.send('No respondiste a tiempo. El comando ha sido cancelado.');
  }
}
 /****************************************************************************************************************************************************************************************************************************************** */
  /****************************************************************************************************************************************************************************************************************************************** */
   /****************************************************************************************************************************************************************************************************************************************** */
    // Comando para iniciar el flujo
    if (message.content.startsWith('!Mensaje')) {
      const filter = (response) => response.author.id === message.author.id;
    
      try {
        // Pregunta al usuario el mensaje que desea enviar
        await message.channel.send('Por favor, ingresa el mensaje que deseas enviar:');
        const collectedMensaje = await message.channel.awaitMessages({ filter, max: 1, time: 120000, errors: ['time'] });
        const mensajeFinal = collectedMensaje.first().content;
    
        // Paso 2: Solicitar la mención de un canal
        await message.channel.send('Menciona el canal donde deseas enviar el mensaje (usa `#` para autocompletar):');
        const collectedChannel = await message.channel.awaitMessages({ filter, max: 1, time: 120000, errors: ['time'] });
        const mentionedChannel = collectedChannel.first().mentions.channels.first();
    
        // Verificar si se mencionó un canal válido
        if (!mentionedChannel) {
          return message.channel.send('No mencionaste un canal válido. El comando ha sido cancelado.');
        }
    
        // Verificar permisos antes de enviar el mensaje
        if (!mentionedChannel.permissionsFor(message.guild.members.me).has('SEND_MESSAGES')) {
          return message.channel.send(`No tengo permisos para enviar mensajes en el canal: ${mentionedChannel.name}.`);
        }
    
        // Enviar el mensaje al canal mencionado
        await mentionedChannel.send({ content: mensajeFinal });
        await message.channel.send(`El mensaje ha sido enviado al canal: ${mentionedChannel.name}.`);
      } catch (error) {
        console.error('Error al procesar el comando:', error);
        message.channel.send('Hubo un problema al procesar el comando. Inténtalo de nuevo.');
      }
    }
    
  });
    // Inicia el bot
    client.login(TOKEN);
  