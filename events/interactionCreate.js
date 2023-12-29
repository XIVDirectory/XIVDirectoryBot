const { Events, PermissionsBitField } = require('discord.js');
const applications = require('../applications.js');
const checkInvite = require ('../commands/checkInvite.js');
const common = require ('../common.js');

function noSuchCommand(client, interaction) {
  interaction.reply({ content: 'No such command', ephemeral: true })
    .catch(err => console.log(err));
}

async function commandInteraction(interaction, client) {
  var command = interaction.commandName;
  var response = '';
  var embed;

  if (!client.commands.has(command)) {
    noSuchCommand(client, interaction);
    return;
  }

  const clientCommand = client.commands.get(command);
  if (!clientCommand.executeInteraction) {
    noSuchCommand(client, interaction);
    return;
  }

  // Execute command by name from the 'commands/{command.name}.js' file
  try {
    clientCommand.executeInteraction(interaction, client);
  } catch (ex) {
    console.error(ex);
    if (interaction.deferred || interaction.replied) {
      interaction.editReply(ex);
    } else {
      interaction.reply(ex);
    }
  }
}

async function componentInteraction(interaction, client) {
  switch (interaction.customId) {
    case 'invite-channel':
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        await interaction.reply({ embeds: [common.styledEmbed('Error', 'This can only be used by someone with the "Manage Server" permission')], ephemeral: true });
        return;
      }
    
      var doc = await client.meili.index('listing').search(interaction.guild.id, { attributesToRetrieve: ['id'] });
      if (doc.hits.length) {
        await client.meili.index('listing').updateDocuments([{ id: doc.hits[0].id, defaultInviteChannel: interaction.values[0] }]);
        await interaction.deferUpdate();
        await common.delay(1000); // Meili needs a moment to process the request
        await checkInvite.processInteraction(interaction, client);
        return;
      }
  }

  // Acknolwedge the button press
  if (!interaction.deferred && !interaction.replied) {
    interaction.deferUpdate();
  }
}

module.exports = {
  name: Events.InteractionCreate,
  execute: async (client, args) => {
    let interaction = args[0]
    if (interaction.isCommand() || interaction.type === 2) {
      commandInteraction(interaction, client);
    }
    
    if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
      componentInteraction(interaction, client);
    }
  }
}