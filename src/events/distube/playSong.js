const { EmbedBuilder } = require('discord.js');
const config = require('../../../settings/config.json');
const chalk = require('chalk');

module.exports = {
    name: 'playSong',
    async execute(queue, song) {

        let userAvatar = global.userAvatar;
        let interaction = global.interactionPlayer;
        let voiceChannel = global.voiceChannel;
        let player = global.player;

        console.log('trackFirst', player.get('trackFirst'))

        if (player.get('trackFirst') === true) return;
        if (global.com_skip === true) {
            return global.com_skip = false
        }

        console.log(queue)

        console.log(`[${chalk.bold.greenBright('DISTUBE')}] ${chalk.greenBright('Play')} ${song.name} ${chalk.greenBright('in Channel:')} ${global.channel.name} ${chalk.greenBright('Server:')} ${voiceChannel.guild.name}${chalk.greenBright('(')}${interaction.guild.id}${chalk.greenBright(')')}`);

        console.log('firstSong :', player.get('firstSong'))
        console.log('playlist', player.get('playlist'))

        if (player.get('playlist') === false && player.get('firstSong') === true) {
            const embed = new EmbedBuilder()
                .setColor(config.embed_color)
                .setAuthor({ name: 'Go to Page', iconURL: userAvatar, url: song.url })
                .setDescription(`▶️┃**${song.name}** \n\`⌛: ${song.formattedDuration} \``)
                .setThumbnail(song.thumbnail)

            player.set('firstSong', false);

            return interaction.editReply({ embeds: [embed] });
        } else if ((player.get('firstSong') === false && player.get('playlist') === false) && (global.com_skip === false || global.com_skip === undefined)) {
            const embed = new EmbedBuilder()
                .setColor(config.embed_color)
                .setAuthor({ name: 'Go to Page', iconURL: userAvatar, url: song.url })
                .setDescription(`▶️┃**${song.name}** \n\`⌛: ${song.formattedDuration} \``)
                .setThumbnail(song.thumbnail)
                .setTimestamp();

            console.log('1')

            return queue.textChannel.send({ embeds: [embed] });
        } else if (global.com_skip === false || global.com_skip === undefined) {
            const embed = new EmbedBuilder()
                .setColor(config.embed_color)
                .setAuthor({ name: 'Go to Page', iconURL: userAvatar, url: song.url })
                .setDescription(`▶️┃**${song.name}** \n\`⌛: ${song.formattedDuration} \``)
                .setThumbnail(song.thumbnail)
                .setTimestamp();

            console.log('2')
            player.set('playlist', false);
            player.set('firstSong', false);

            return queue.textChannel.send({ embeds: [embed] });
        }

        if (player.get('autoplay') === true && queue.songs.length === 1) {
            const yt = require('youtube-sr').default;
            const autoplay_url = `https://music.youtube.com/watch?v=${queue.songs[0].id}&list=RD${queue.songs[0].id}`;
            const result = await yt.search(autoplay_url);
            const yt_url = `https://music.youtube.com/watch?v=${result[1].videoId}`;

            console.log('autoplay :', 'on')
            await interaction.client.distube.play(voiceChannel, yt_url, {
                textChannel: interaction.channel,
                member: interaction.member
            }).catch(error => {
                console.log(error)
                console.log(`[${chalk.bold.greenBright('DISTUBE')}] ${chalk.greenBright('Fail to Autoplay')} ${query} ${chalk.greenBright('in Channel:')} ${global.channel.name} ${chalk.greenBright('Server:')} ${voiceChannel.guild.name}${chalk.greenBright('(')}${interaction.guild.id}${chalk.greenBright(')')}`);
                const embed = new EmbedBuilder()
                    .setColor(config.embed_fail)
                    .setDescription(`> \`❌\`ไม่สามารถเข้าถึงเพลงได้`);

                return queue.textChannel.send({ embeds: [embed], ephemeral: true });
            });
        }
    }
}
