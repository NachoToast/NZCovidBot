import { Client, MessageEmbed, TextChannel } from 'discord.js';
import GuildConfigManager from '../../modules/guildConfigManager.module';
import LocationsManager from '../../modules/locationsManager.module';
const checkNew = async (locations: LocationsManager, client: Client, guildSettings: GuildConfigManager) => {
    const res = await locations.checkNewLocations();

    if (typeof res === 'string') {
        console.log(res);
        process.exit();
    }
    if (res.length !== 0) {
        locations.updateLocalLocations(); // update stored locations

        // construct embed payload
        let payload: MessageEmbed[];
        if (res.length <= 10) payload = res.map((e) => LocationsManager.makeLocationEmbed(e));
        else payload = [LocationsManager.makeMassLocationEmbed(res.slice(0, 10), res.length)];

        // make global broadcast
        const allGuilds = client.guilds.cache.map((e) => e.id);
        for (const id of allGuilds) {
            const targetChannelID = guildSettings.getChannel(id);
            if (targetChannelID !== false) {
                const channel = client.channels.cache.get(targetChannelID) as TextChannel;
                channel.send({ embeds: payload });
            }
        }
    }
    const hrs72 = (await locations.queryLocations('Added', '72hrs')).length;
    const hoursSplit = new Date().toLocaleTimeString().split(/[:\s]/);
    const time = `${hoursSplit[0]}:${hoursSplit[1]} ${hoursSplit[3]}`;
    client.user?.setActivity(
        `${locations.locationsMeta.number} Locations (${hrs72} Last 72 Hours) || ${client.guilds.cache.size} Servers || Updated: ${time}`,
        {
            type: 'WATCHING',
        }
    );
};

export default checkNew;
