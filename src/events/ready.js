const chalk = require('chalk');

module.exports = { //ทำการให้บอทส่ง Event "Ready" ครั้งเดียว หลังบอทพร้อม (หลังโหลด Cache จากดิสเซิร์ฟทั้งหมดที่บอทใช้งาน)
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`[${chalk.bold.greenBright('SYSTEM')}] ${chalk.greenBright('All Green!')}\n[${chalk.bold.greenBright('WARN')}] ${client.user.tag} ${chalk.greenBright('Online!')}`);

        client.manager.init(client.user.id);

        let guilds = client.guilds.cache.size;
		let members = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);
		let channels = client.channels.cache.size;

		const activities = [
			`🛠️ Developing | xeno.2004`,
			// `🛠️ (Final Phase) | xeno.2004`,
			// `/help | ${guilds} servers`,
			//`/play <input> | ${members} users`,
			`🎧 /play <input>`,
			`✅ Youtube | xeno.2004`,
			`✅ Youtube Music | xeno.2004`,
			`✅ Spotify | xeno.2004`,
			`✅ SoundCloud | xeno.2004`,
			`✅ Deezer | xeno.2004`,
			`🤝 ${members} users used`,
			//`/filter <menu> | ${channels} channels`,
			// `/filter <menu>`,
			`🔊 ${channels} channels active`,
			// `xenodev | momo team`,
		]
		
		setInterval(() => {
			client.user.setPresence({
				activities: [{ name: `${activities[Math.floor(Math.random() * activities.length)]}`, type: 4 }],
				status: 'idle',
			});
		}, 15000)
    }
}
