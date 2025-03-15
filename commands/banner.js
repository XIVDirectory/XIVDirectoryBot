const { ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
  name: 'banner',
  description: 'Display a banner for the XIV Directory, for use in external link channels',
  options: [],
  
  executeInteraction: async(interaction) => {
    var embed = {
      title: 'Looking for something else?',
      description: 'Take a look at XIV Directory. Discover new communities and resources for Final Fantasy XIV.',
      color: 0xde153a
    };

    var row = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('XIV Directory').setStyle('Link').setURL('https://xiv.directory'))

    interaction.reply({ embeds:[embed], components: [row] });
  }
};