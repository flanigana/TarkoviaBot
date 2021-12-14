const Discord = require('discord.js');
const cheerio = require('cheerio');

function addEmbedFieldsFromInfo(embed, info) {
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
}

async function addImageMatchingRegex(page, embed, regex) {
	return page
		.images()
		.then((images) => {
			for (const image of images) {
				if (regex.test(image)) {
					embed = embed.setImage(image);
					return embed;
				}
			}
			return embed;
		})
		.catch(console.error);
}

function getLocationMap($, info) {
	outerLoop: for (const h of $('h2')) {
		if ($('span', h)?.text()?.startsWith('Maps')) {
			let nextEle = h.next.next;
			while (nextEle && nextEle.name != 'table' && nextEle.name != 'h2') {
				if (!nextEle.name) {
					nextEle = nextEle.next;
					continue;
				}
				const image = $('a > img', nextEle);
				if (image) {
					const imageSrc = image.attr('data-src');
					if (imageSrc) {
						info.Image = imageSrc;
						break outerLoop;
					}
				}
				nextEle = nextEle.next;
			}
		}
	}
	return info;
}

function getQuestData($, info) {
	function getInnerText(e) {
		if (e.type == 'text') {
			return e.data;
		} else {
			let bullet = '';
			for (const c of e.children) {
				bullet += getInnerText(c);
			}
			return bullet;
		}
	}

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
			if (
				bullet != '' &&
				!bullet.match(/^\d+,?\d+ (roubles|dollars|euros) with Intelligence Center Level \d$/gi)
			) {
				bullets.push(bullet);
			}
		}
	}
	if (section) {
		info[section] = bullets;
		bullets = [];
	}
	return info;
}

function getMainTableInfo($) {
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
}

async function getPageInfo(page) {
	return page.html().then((html) => {
		const $ = cheerio.load(html);
		let info = getMainTableInfo($);
		if (info.isQuest) {
			info = getQuestData($, info);
			info.Guide = `${page.raw.fullurl}#Guide`;
		}
		if (page.raw.title.match(/customs|woods|factory|interchange|shoreline|reserve|lighthouse|the lab|labs|lab/gi)) {
			info = getLocationMap($, info);
			let interactiveLinkEnd;
			if (page.raw.title.trim().match(/the lab|labs|lab/)) {
				interactiveLinkEnd = 'lab';
			} else {
				interactiveLinkEnd = page.raw.title.toLowerCase();
			}
			info['Interactive Map Available'] = `[Here](https://mapgenie.io/tarkov/maps/${interactiveLinkEnd})`;
			info['More Maps Available'] = `[Here](${page.raw.fullurl}#Maps)`;
		}

		return info;
	});
}

async function addDefaultPageInfo(embed, page) {
	let promises = [];
	promises.push(
		page.mainImage().then((image) => {
			embed = embed.setThumbnail(image);
		})
	);
	promises.push(
		page.summary().then((summary) => {
			embed = embed.setDescription(summary);
		})
	);
	return Promise.all(promises)
		.then(() => {
			return embed;
		})
		.catch(console.error);
}

function setFooter(embed) {
	return embed.setTimestamp().setFooter('Source: escapefromtarkov.fandom.com');
}

async function buildEmbedFromPage(page) {
	let promises = [];
	let embed = new Discord.MessageEmbed().setTitle(page.raw.title).setURL(page.raw.fullurl);
	embed = setFooter(embed);

	promises.push(addDefaultPageInfo(embed, page));
	promises.push(
		getPageInfo(page).then((info) => {
			let innerPromises = [];
			innerPromises.push(addEmbedFieldsFromInfo(embed, info));

			if (info.Image && info.Image.match(/^https?/gi)) {
				embed = embed.setImage(info.Image);
			} else if (info.Type && info.Type.match(/chest rig/gi)) {
				innerPromises.push(addImageMatchingRegex(page, embed, RegExp('slots|inside|internal|layout', 'gi')));
			}

			return Promise.all(innerPromises).catch(console.error);
		})
	);

	return Promise.all(promises)
		.then(() => {
			return embed;
		})
		.catch(console.error);
}

async function buildEmbedFromSearch(searchRes, cat) {
	const title = `Top Search Results${cat ? ' in ' + cat : ''}:`;
	let embed = new Discord.MessageEmbed()
		.setTitle(title)
		.setThumbnail(
			'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/b/bc/Wiki.png/revision/latest/scale-to-width-down/320?cb=20200612143203'
		);
	embed = setFooter(embed);

	let description = '';
	for (let i = 0; i < searchRes.length && i < 10; ++i) {
		description += `${searchRes[i]}\n`;
	}

	return embed.setDescription(description);
}

module.exports = {
	buildEmbedFromPage,
	buildEmbedFromSearch,
};
