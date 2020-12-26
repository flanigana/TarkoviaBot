const Discord = require('discord.js');
const cheerio = require('cheerio');

addEmbedFieldsFromInfo = (embed, info) => {
    const keys = Object.keys(info);
    for (const key of keys) {
        if (key.match(/image|isQuest/gi)) {
            continue;
        }
        if (key.match(/previous/gi)) {
            embed = embed.addField('-', '-', false);
        }
        if (key.match(/type|material|penalties|objectives|rewards/gi) || info[key].length > 30) {
            embed = embed.addField(key, info[key], false);
        } else {
            embed = embed.addField(key, info[key], true);
        }
    }
    return embed;
};

addImageMatchingRegex = async (page, embed, regex) => {
    return page.images().then(images => {
        for (const image of images) {
            if (regex.test(image)) {
                embed = embed.setImage(image);
                return embed;
            }
        }
        return embed;
    }).catch(console.error);
};

getLocationMap = ($, info) => {
    const ps = $('p');
    for (const p of ps) {
        const label = $('b', p).text();
        if (label.match(/interactive map/gi)) {
            info['Interactive Map'] = `https://escapefromtarkov.gamepedia.com${$('a', p).attr('href')}`;
        }
        if (label.match(/2D Map|3D Map|expansion/gi)) {
            info.Image = $('a > img', p).attr('src');
            break;
        }
    }
    return info;
};

getQuestData = ($, info) => {
    getInnerText = e => {
        if (e.type == 'text') {
            return e.data;
        } else {
            let bullet = '';
            for (const c of e.children) {
                bullet += getInnerText(c);
            }
            return bullet;
        }
    };

    const elements = $('h2,li');
    let section;
    let bullets = [];
    for (const e of elements) {
        if (e.name == 'h2') {
            if (section) {
                info[section] = bullets;
                bullets = [];
            }
            const heading = $('.mw-headline', e);
            if (heading.text && heading.text().match(/objectives|rewards/gi)) {
                section = heading.text();
            } else {
                section = undefined;
            }

        } else if (section) {
            bullet = getInnerText(e);
            if (bullet != '' && !bullet.match(/^\d+,?\d+ (roubles|dollars|euros) with Intelligence Center Level \d$/gi)) {
                bullets.push(bullet);
            }
        }
    }
    if (section) {
        info[section] = bullets;
        bullets = [];
    }
    return info;
};

getMainTableInfo = $ => {
    let info = {};
    const mainTableRow = $('#va-infobox0-content > .va-infobox-cont > .va-infobox-group > tbody > tr');
    for (const row of mainTableRow) {
        const header = $('th.va-infobox-header', row).text();
        const label = $('td.va-infobox-label', row);
        const content = $('td.va-infobox-content', row);

        if (header && header.match(/quest/gi)) {
            info.isQuest = true;
        }
        if (content.length == 1) {
            if (label.text() && content.text()) {
                info[label.text()] = content.text();
            }
        } else {
            for (const contentItem of content) {
                let list = [];
                for (const item of $('a', contentItem)) {
                    if (item.children[0] && item.children[0].type == 'text') {
                        list.push(item.children[0].data);
                    }
                }
                if (list.length > 0) {
                    if (contentItem.children[0] && contentItem.children[0].type == 'text') {
                        info[contentItem.children[0].data] = list;
                    }
                }
            }
        }
    }
    return info;
};

getPageInfo =  async page => {
    return page.html().then(html => {
        const $ = cheerio.load(html);
        let info = getMainTableInfo($);
        if (info.isQuest) {
            info = getQuestData($, info);
            info['Guide'] = `${page.raw.fullurl}#Guide`;
        } 
        if (info.Type && info.Type.match(/location/gi)) {
            info = getLocationMap($, info);
            info['For More Maps'] = `${page.raw.fullurl}#Maps`;
        }

        return info;
    });
};

addDefaultPageInfo = async (embed, page) => {
    let promises = [];    
    promises.push(page.mainImage().then(image => {
        embed = embed.setThumbnail(image);
    }));
    promises.push(page.summary().then(summary => {
        embed = embed.setDescription(summary);
    }));
    return Promise.all(promises).then(() => {
        return embed;
    }).catch(console.error);
};

module.exports.buildEmbedFromPage = async page => {
    let promises = [];
    let embed = new Discord.MessageEmbed()
        .setTitle(page.raw.title)
        .setURL(page.raw.fullurl);

    promises.push(addDefaultPageInfo(embed, page));
    promises.push(getPageInfo(page).then(info => {
        let innerPromises = [];
        innerPromises.push(addEmbedFieldsFromInfo(embed, info));

        if (info.Image) {
            embed = embed.setImage(info.Image);
        } else if (info.Type && info.Type.match(/chest rig/gi)) {
            innerPromises.push(addImageMatchingRegex(page, embed, RegExp('slots|inside|internal|layout', 'gi')));
        }

        return Promise.all(innerPromises).catch(console.error);
    }));

    
    
    return Promise.all(promises).then(() => {
        return embed;
    }).catch(console.error);
};

module.exports.buildEmbedFromSearch = async (searchRes, cat) => {
    const title = `Top Search Results${cat ? (' in ' + cat) : ''}:`;
    let embed =  new Discord.MessageEmbed()
        .setTitle(title)
        .setThumbnail('https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/b/bc/Wiki.png/revision/latest/scale-to-width-down/320?cb=20200612143203');

    let description = '';
    for (let i=0; i<searchRes.length && i<10; ++i) {
        description += `${searchRes[i]}\n`;
    }

    return embed.setDescription(description);
};