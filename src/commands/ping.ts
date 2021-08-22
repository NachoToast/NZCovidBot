import { Client, Message } from 'discord.js';
import Command from '../interfaces/Command';

const ping: Command = {
    execute: async ({ message, args, client }: { message: Message; args: string[]; client: Client }) => {
        let response = `Pongers! (${Math.abs(Date.now() - message.createdTimestamp)}ms)`;
        if (args.includes('v')) {
            response += `\nAPI Latency: ${Math.round(client.ws.ping)}ms`;
        }

        message.channel.send(response);
    },
    help: async ({ message }: { message: Message }) => {
        message.channel.send(`Pings the bot to see if it's online, usage: \`covid ping\``);
    },
};

export default ping;
