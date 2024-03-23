const chalk = require('chalk');
const { EmbedBuilder, Collection } = require('discord.js');
const config = require('../../settings/config.json')

module.exports = {
	name: 'interactionCreate',
	async execute(interaction, client) {

		const command = interaction.client.commands.get(interaction.commandName);

		global.command = command;

		if (interaction.isCommand()) {

			if (!command) return;

			const { cooldowns } = interaction.client;
			if (!cooldowns.has(command.data.name)) {
				cooldowns.set(command.data.name, new Collection());
			}

			const now = Date.now();
			const timestamps = cooldowns.get(command.data.name);
			const defaultCooldownDuration = 3;
			const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

			if (timestamps.has(interaction.user.id)) {
				const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
				global.expirationTime = expirationTime;

				if (now < expirationTime) {
					const expiredTimestamp = Math.round(expirationTime / 1_000);
					const embed = new EmbedBuilder()
						.setColor(config.embed_fail)
						.setDescription(`> คุณจะใช้ \`${command.data.name}\` ได้ในอีก <t:${expiredTimestamp}:R> วินาที.`);

					return interaction.reply({ embeds: [embed], ephemeral: true });
				}
			}
			timestamps.set(interaction.user.id, now);
			setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'Error trying to executing this command.', ephemeral: true });
			}

			console.log(`[${chalk.bold.greenBright('COMMAND')}] ${interaction.user.tag} ${chalk.greenBright('Used')} ${interaction.commandName} ${chalk.greenBright('in')} ${interaction.guild.name}${chalk.greenBright('(')}${interaction.guild.id}${chalk.greenBright(')')}`);

		} else if (interaction.isAutocomplete()) {

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.autocomplete(interaction, client);
			} catch (error) {
				console.error(error);
			}
		}
	},
};