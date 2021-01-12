const queryMatcher = require('./queryMatcher');
const embedBuilder = require('./wikiEmbedBuilder');

class TarkovWiki {
    constructor(wiki, pageTitles, pagesByCategory) {
        this.wiki = wiki;
        this.pageTitles = pageTitles;
        this.pagesByCategory = pagesByCategory;
    }

    // methods
    async search(msg) {
        let query = queryMatcher.getQueryFromFullMessage(msg);
        return this.wiki.search(query).then(res => {
            return embedBuilder.buildEmbedFromSearch(res.results);
        }).catch(console.error);
    }
    
    async searchInCategory(msg, subCommand) {
        let query = queryMatcher.getQueryFromFullMessage(msg);
        let cat = queryMatcher.getCategory(this.pagesByCategory, subCommand);
        if (query == '') {
            return embedBuilder.buildEmbedFromSearch(this.pagesByCategory[cat], cat);
        } else {
            query = queryMatcher.findBestPageFromQuery(this.pagesByCategory[cat], query);
            return this.wiki.search(query).then(res => {
                res = queryMatcher.filterListByCategory(this.pagesByCategory[cat], res.results);
                return embedBuilder.buildEmbedFromSearch(res, cat);
            }).catch(console.error);
        }
    }
    
    async findPage(msg) {
        let query = queryMatcher.getQueryFromFullMessage(msg);
        query = queryMatcher.findBestPageFromQuery(this.pageTitles, query);
        return this.wiki.page(query).then(res => {
            return embedBuilder.buildEmbedFromPage(res);
        }).catch(console.error);
    }
    
    async findPageInCategory (msg, subCommand) {
        let query = queryMatcher.getQueryFromFullMessage(msg);
        let cat = queryMatcher.getCategory(this.pagesByCategory, subCommand);
        query = queryMatcher.findBestPageFromQuery(this.pagesByCategory[cat], query);
        return this.wiki.page(query).then(res => {
            return embedBuilder.buildEmbedFromPage(res);
        }).catch(console.error);
    }
}

module.exports = {
    TarkovWiki
};