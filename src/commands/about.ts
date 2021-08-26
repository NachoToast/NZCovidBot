import { invite } from '../config.json';
import Command from '../interfaces/Command';
import { Message, MessageEmbed, Permissions } from 'discord.js';

const about: Command = {
    execute: async ({ message, myPerms }: { message: Message; myPerms: Permissions }) => {
        if (!myPerms.has(Permissions.FLAGS.EMBED_LINKS)) {
            message.channel.send(
                `Created by NachoToast#9000\nOpen Source: <https://github.com/NachoToast/NZCovidBot>\nInvite Link: ${invite}\nGive me \`Embed Messages\` permissions for a more detailed information.`
            );
            return;
        }

        const embed = new MessageEmbed()
            .setColor('#ffcc00')
            .setTitle('About NZ Covid Bot')
            .setDescription(
                `NZ Covid Bot provides updates about new locations of interest and enables searching through them.
            It is being developed by <@240312568273436674> and is open source on [GitHub](https://github.com/NachoToast/NZCovidBot).
            You can invite the bot to your server using this [invite link](${invite} 'Invite Link').`
            )
            .setFooter('NZ Covid Bot', 'https://cdn.discordapp.com/attachments/879001616265650207/879001636100534382/iconT.png');

        message.channel.send({ embeds: [embed] });
    },
    help: async ({ message }: { message: Message }) => {
        message.channel.send(
            `Gives information about the bot.\nAliases: \`${['invite', 'source', 'src', 'inv'].join('`, `')}\`,`
        );
    },
};

export default about;
