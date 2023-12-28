const { Client, Collection, IntentsBitField, ApplicationCommandType } = require('discord.js');
const { MeiliSearch } = require('meilisearch');
const fs = require('fs');
const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildInvites],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

const api = require('./api.js')
const auth = require('./auth.json');

const { MongoClient } = require('mongodb');

client.once('ready', async () => {
  client.user.setActivity("From Alphinaud to Zenos");
  
  client.api = api.setup(auth.apiEndpoint);
  client.mongo = new MongoClient(auth.mongodb).db();
  client.meili = new MeiliSearch({ host: auth.meili, apiKey: auth.meiliKey });
  
  // Register commands
  client.commands = new Collection();
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

  // Discord does not like us authenticating with bot tokens, so we need a bearer token instead
  const params = new URLSearchParams();
  params.append('client_id', auth.clientId);
  params.append('client_secret', auth.clientSecret);
  params.append('grant_type', 'client_credentials');
  params.append('scope', 'identify');

  var tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', { method: 'POST', body: params, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
  var token = await tokenResponse.json();
  
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    
    if (command.guilds) {
      // Register guild application slash commands
      for (const guildDetail of command.guilds) {
        var guild = client.guilds.resolve(guildDetail.guild);

        if (guild)
        {
          var newCommand = await guild.commands.create({
            name: command.name,
            description: command.description,
            options: command.options,
            type: command.type || ApplicationCommandType.ChatInput,
            defaultPermission: false,
          });
          
          await fetch(`https://discord.com/api/v10/applications/${client.application.id}/guilds/${guildDetail.guild}/commands/${newCommand.id}/permissions`, {
              method: 'POST',
              headers: { Authentication: `Bearer ${token.access_token}` },
              body: {
                permissions: guildDetail.permittedRoles.map(x => ({ id: x, type: /* Role */ 1, permission: true }))
              }
            });
        }
      }
    }
    else {
      // Register application slash commands
      client.application.commands.create({
        name: command.name,
        description: command.description,
        options: command.options,
        type: ApplicationCommandType.ChatInput,
        defaultPermission: true,
      });
    }
  }
  
  // Register event handlers
  client.events = new Collection();
  const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
  
  for (const file of eventFiles) {
    const eventLogic = require(`./events/${file}`);
    client.on(eventLogic.name, (...eventArgs) => eventLogic.execute(client, eventArgs));
  }
 
  console.log(`Logged in as ${client.user.tag} @ ${new Date().toLocaleString()}!`);
});

client.login(auth.discord);