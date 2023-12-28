const { Events } = require('discord.js');
const applications = require('../applications.js');

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