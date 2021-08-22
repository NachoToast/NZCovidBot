import Command from '../../interfaces/Command';
import { Message, MessageEmbed } from 'discord.js';
import GuildConfigManager from '../../modules/guildConfigManager.module';

const showConfig: Command = {
    execute: async ({ message, settings }: { settings: GuildConfigManager; message: Message }) => {
        if (message.guildId === null) return;

        const outputEmbed = new MessageEmbed().setColor('#ffcc00').setTitle('Server Configuration');
        let output = '';

        const channel = settings.getChannel(message.guildId);
        const prefixes = settings.getPrefixes(message.guildId);

        outputEmbed.addField('Bot Prefixes', `covid, ${prefixes.join(', ')}`);
        output += `\n${channel !== false ? `Announcing new locations in <#${channel}>` : 'Not announcing new locations.'}`;

        outputEmbed.setDescription(output);

        message.channel.send({ embeds: [outputEmbed] });
    },
    help: async ({ message }: { message: Message }) => {
        message.channel.send(`Lists server-specific config, usage: \`covid prefix <prefix>\`\nAdmin use only.`);
    },
};

export default showConfig;
