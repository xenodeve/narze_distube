const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../settings/config.json');

module.exports = {
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('autoplay')
        .setDescription('เพิ่มคิวอัตโนมัติ'),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        const clientvoiceChannel = interaction.guild.members.me.voice.channel
        const queue = interaction.client.distube.getQueue(interaction);
        const player = interaction.client.manager.get(interaction.guild.id)

        console.log('100')

        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(config.embed_fail)
                .setDescription(`> \`❌\`กรุณาเข้าห้องเสียงด้วย`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (!queue || !player) {
            const embed = new EmbedBuilder()
                .setColor(config.embed_fail)
                .setDescription(`> \`❌\`ไม่มีเพลงที่เล่นอยู่`)

            return interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (voiceChannel !== clientvoiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(config.embed_fail)
                .setDescription(`> \`❌\`คุณต้องอยู่ในห้องเดียวกับบอท`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            if (player.get('autoplay') === undefined || player.get('autoplay') === false) {
                player.set('autoplay', true);
            } else if(player.get('autoplay') === true) {
                player.set('autoplay', false);
            }
        }

        console.log('player_g :', player.get('autoplay'))
        
        if (player.get('autoplay') === true) {
            await interaction.deferReply({ ephemeral: false });
            console.log('200')
            if (queue.songs.length === 1) {
                const yt = require('youtube-sr').default;

                const autoplay_url = `https://music.youtube.com/watch?v=${queue.songs[0].id}&list=RD${queue.songs[0].id}`;
                const results = await player.search(autoplay_url, interaction.author);
                console.log('result :', results)
                const yt_url = results.tracks[1].uri;

                console.log('autoplay_comm :', 'on')
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

            const embed = new EmbedBuilder()
                .setDescription(`> \`📻\` | *เล่นอัตโนมัติ ได้ถูก:* \` 'เปิดการใช้งาน' \``)
                .setColor(config.embed_color)

            return interaction.editReply({ embeds: [embed] });
        } else if (player.get('autoplay') === false) {

            const embed = new EmbedBuilder()
                .setDescription(`> \`📻\` | *เล่นอัตโนมัติ ได้ถูก:* \` 'ปิดการใช้งาน' \``)
                .setColor(config.embed_color)

            return interaction.reply({ embeds: [embed] });
        }
    }
}
