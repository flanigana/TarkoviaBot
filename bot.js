require("dotenv").config();
const Discord = require('discord.js');
const client = new Discord.Client();

const defaultWiki = require('wikijs').default;
const wiki = defaultWiki({
    apiUrl: 'https://escapefromtarkov.gamepedia.com/api.php'
});

const tools = require('./tools/tools');
const { TarkovWiki } = require('./wiki/tarkovWiki');

let tarkovWiki;

async function loadCategoryPages() {
    async function getFilteredCategories() {
        const ignore = RegExp('(icons|images|templates|deletion).?$', 'gi');
        return wiki.allCategories().then(categories => {
            return categories.filter(cat => {return !ignore.test(cat);});
        });
    }
    function getFilteredPages(pages) {
        return pages.filter(page => {
            return !page.toLowerCase().startsWith("category:");
        });
    }

    const categories = await getFilteredCategories();
    let promises = [];
    let pagesByCategory = {};
    for (const cat of categories) {
        promises.push(wiki.pagesInCategory('Category:'+cat).then(pages => {
            const filteredPages = getFilteredPages(pages);
            if (filteredPages.length > 0) {
                pagesByCategory[cat] = filteredPages;
            }
            return true;
        }));
    }

    return Promise.all(promises).then(() => {
        return pagesByCategory;
    }).catch(console.error);
}

async function initialize() {
    let promises = [];
    let pageTitles = [];
    let pagesByCategory = {};
    promises.push(wiki.allPages().then(pages => {pageTitles = pages; return true;}));
    promises.push(loadCategoryPages().then(pages => {pagesByCategory = pages; return true;}));

    return Promise.all(promises).then(() => {
        return new TarkovWiki(wiki, pageTitles, pagesByCategory);
    }).catch(console.error);
}

client.once('ready', async () => {
    initialize().then(tarkov => {
        tarkovWiki = tarkov;
        console.log('Ready!');
    });
});

client.on('message', async msg => {
    if (!msg.content.startsWith('-')) {
        return;
    }

    const command = tools.getCommand(msg.content.toLowerCase());
    const subCommand = tools.getSubCommand(msg.content.toLowerCase());
    let embed;
    let response;

    switch (command) {
        case 'search':
            if (subCommand) {
                embed = await tarkovWiki.searchInCategory(msg.content, subCommand);
            } else {
                embed = await tarkovWiki.search(msg.content);
            }
            break;
        case 'find':
            if (subCommand) {
                embed = await tarkovWiki.findPageInCategory(msg.content, subCommand);
            } else {
                embed = await tarkovWiki.findPage(msg.content);
            }
            break;
        case 'keys':
        case 'keylist':
        case 'key_list':
        case 'keyslist':
        case 'keys_list':
            response = "https://i.imgur.com/ti2Ax5A.png";
            break;
        case 'ammo':
        case 'ammochart':
        case 'ammo_chart':
            response = "https://tarkov.ascheron.dev";
            break;
        case 'quests':
        case 'questlist':
        case 'quest_list':
            response = "https://escapefromtarkov.gamepedia.com/Quests";
            break;
        case 'questitems':
        case 'quest_items':
        case 'questitem':
        case 'quest_item':
            response = "https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/1/19/QuestItemRequirements.png/revision/latest";
            break;
    }
    
    if (embed) {
        msg.channel.send(embed);
    }
    if (response) {
        msg.channel.send(response);
    }
});

client.login(process.env.discordToken);