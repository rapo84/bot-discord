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
  
  // Token del bot
  const TOKEN = 'colocar token aqui';
  client.on('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`);
  });
  
  client.on('messageCreate', async (message) => {
    // Ignorar mensajes del bot
    if (message.author.bot) return;
  
    // Comando para enviar un mensaje embed
if (message.content.startsWith('!Embed')) {
  // Pedirle al usuario que ingrese el título
  const filter = (response) => response.author.id === message.author.id; // Solo aceptar respuestas del usuario que ejecutó el comando
  // Enviar un mensaje directo al usuario para pedir el título
  message.channel.send('Por favor, ingresa el título del embed:');

  // Esperar la respuesta del usuario
  try {
    const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }); // 60 segundos de tiempo máximo
    const userTitle = collected.first().content; // Capturar el contenido del mensaje del usuario

    // Construir el embed con el título ingresado por el usuario
    const embed = new EmbedBuilder()
      .setColor(0x00FF00) // Color del borde del embed (verde en este caso)
      .setTitle(userTitle) // Usar el título ingresado por el usuario
      .setDescription('Aqui iria lo que seria el mensaje pricipal del mensaje embed.')
      .setAuthor({ 
        name: message.client.user.username, // Nombre del bot
        iconURL: message.client.user.displayAvatarURL() // Avatar del bot
      })    
      .setThumbnail('https://media.istockphoto.com/id/539244443/es/vector/tarea-de-la-primera-guerra-mundial-los-sacos-de-arena.jpg?s=2048x2048&w=is&k=20&c=1TjqLIvovJ9UkiVjHbekXtWNxHfUQQ-asNNTL4FYWts=') // imagen miniautura del titulo
      .addFields(
        { name: 'Campo 1', value: 'Este es el contenido del campo 1', inline: true },
        { name: 'Campo 2', value: 'Este es el contenido del campo 2', inline: true },
        { name: 'Campo 3', value: 'Este es el contenido del campo 3', inline: true },
      )
      .setImage('https://media.istockphoto.com/id/1629471685/es/vector/primera-l%C3%ADnea-al-atardecer.jpg?s=612x612&w=0&k=20&c=Wy598j6MHm5hEVnrcAbsCNzAVipv08xJDFib17nSm94=') // imagen principal del mensaje
      .setFooter({ text: 'Esto es un pie de página', iconURL: 'https://media.istockphoto.com/id/945878406/es/vector/la-escena-de-la-gran-guerra.jpg?s=612x612&w=0&k=20&c=KZz9BXrowwENcMXTB3-fn3K4_HxUNofM18BKkfc8XbE=' }) // imagen del pie de pagina 
      .setTimestamp(); // Agrega la fecha y hora actuales

    // Enviar el embed al canal donde se escribió el mensaje
    await message.channel.send({ embeds: [embed] });
  } catch (error) {
    // Si no responde en el tiempo límite
    message.channel.send('No respondiste a tiempo, el comando ha sido cancelado.');
  }
}
  
    // Comando para iniciar el flujo
      if (message.content.startsWith('!NewOrder')) {
        // Obtén los canales disponibles
        const channels = message.guild.channels.cache.filter(
            (ch) => ch.type === ChannelType.GuildText || ch.type === ChannelType.GuildNews
          ) && ch.name;
    
        if (!channels.size) {
          return message.reply('No hay canales disponibles para enviar mensajes.');
        }
    
        // Construye un menú de selección de canales
        const menu = new StringSelectMenuBuilder()
          .setCustomId('select_channel')
          .setPlaceholder('Selecciona un canal')
          .addOptions(
            channels.map((channel) => ({
              label: channel.name,
              value: channel.id,
            }))
          );
    
        // Crea un componente con el menú
        const row = new ActionRowBuilder().addComponents(menu);
    
        // Envía un mensaje con el menú al usuario
        await message.reply({
          content: 'Selecciona el canal donde deseas enviar el mensaje:',
          components: [row],
        });
      }
    });
    
    // Evento cuando se selecciona un canal
    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isStringSelectMenu() || interaction.customId !== 'select_channel') return;
    
      // Obtén el canal seleccionado
      const selectedChannelId = interaction.values[0];
      const channel = interaction.guild.channels.cache.get(selectedChannelId);
    
      // Pregunta al usuario el mensaje que desea enviar
      await interaction.reply({
        content: `Has seleccionado el canal: ${channel.name}. ¿Qué mensaje deseas enviar? Responde a este mensaje.`,
        flags: MessageFlags.Ephemeral, // Solo visible para el usuario
      });
    
      // Escucha el siguiente mensaje del usuario
      const filter = (m) => m.author.id === interaction.user.id;
      const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
    
      collector.on('collect', async (collectedMessage) => {
        const content = collectedMessage.content;
    
        // Envía el mensaje al canal seleccionado
        try {
          await channel.send(content);
          await interaction.followUp({
            content: `El mensaje ha sido enviado al canal: ${channel.name}.`,
            flags: MessageFlags.Ephemeral,
          });
        } catch (error) {
          console.error(error);
          await interaction.followUp({
            content: 'Hubo un error al enviar el mensaje. Por favor, verifica los permisos del bot.',
            flags: MessageFlags.Ephemeral,
          });
        }
      });
    
      collector.on('end', (collected) => {
        if (collected.size === 0) {
          interaction.followUp({
            content: 'No proporcionaste un mensaje. El proceso ha sido cancelado.',
            flags: MessageFlags.Ephemeral,
          });
        }
      });
    });
    
    // Inicia el bot
    client.login(TOKEN);
  