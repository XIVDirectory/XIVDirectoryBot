const { ApplicationCommandOptionType } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'epoch',
  description: 'Get a timestamp for displaying with discord\'s time tag. Using without args will display the time now',
  options: [
    { type: ApplicationCommandOptionType.Integer, name: "year", description: "The 4-digit year of the timestamp" },
    { type: ApplicationCommandOptionType.Integer, name: "month", description: "The month of the timestamp (1-12)" },
    { type: ApplicationCommandOptionType.Integer, name: "date", description: "The date of the timestamp (1-31)" },
    { type: ApplicationCommandOptionType.Integer, name: "hour", description: "The 24-hour hour of the timestamp (0-23)" },
    { type: ApplicationCommandOptionType.Integer, name: "minute", description: "The minute of the timestamp (0-59)" },
    { type: ApplicationCommandOptionType.Integer, name: "second", description: "The second of the timestamp (0-59)" },
    { type: ApplicationCommandOptionType.Integer, name: "offset", description: "The UTC offset to use (i.e. 1 means UTC+1, -3 means UTC-3)" },
  ],
  ephemeral: true,
  
  executeInteraction: async(interaction) => {
    var date = new Date();
    var epoch = Date.now()
    if (interaction.options.data.length) {
      var year = interaction.options.getInteger('year') ?? date.getUTCFullYear()
      var month = interaction.options.getInteger('month') ?? date.getUTCMonth() + 1
      var date = interaction.options.getInteger('date') ?? date.getUTCDate()
      var hour = interaction.options.getInteger('hour') ?? 0
      var minute = interaction.options.getInteger('minute') ?? 0
      var second = interaction.options.getInteger('second') ?? 0
      var offset = interaction.options.getInteger('offset') ?? 0
      
      epoch = Date.UTC(year, month - 1, date, hour - offset, minute, second)
    }
    
    // Adjust for second-based timestamp
    epoch = Math.floor(epoch / 1000)

    var content = `\\<t:${epoch}> <t:${epoch}>
\\<t:${epoch}:f> <t:${epoch}:f>
\\<t:${epoch}:F> <t:${epoch}:F>
\\<t:${epoch}:d> <t:${epoch}:d>
\\<t:${epoch}:D> <t:${epoch}:D>
\\<t:${epoch}:t> <t:${epoch}:t>
\\<t:${epoch}:T> <t:${epoch}:T>
\\<t:${epoch}:R> <t:${epoch}:R>`

    interaction.reply({ content: content, ephemeral: true });
  }
};