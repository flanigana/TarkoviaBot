# Tarkovia Bot

## About

Tarkovia bot is a Discord bot for Escape from Tarkov. It can be used to access wiki pages and other common resources, such as an ammo chart, useful keys, and a quest items image.

## Getting Started

Using Tarkovia Bot in your own server is as easy as clicking [here](https://discord.com/oauth2/authorize?client_id=791692260038279198&scope=bot&permissions=511040) to invite it into your server. From there, you should be able to start using commands.

## Commands

-   Retrieve search results from the wiki with given query
    ```sh
      -search query
    ```
-   Retrieve search results from the wiki with given query and filtered by category
    ```sh
      -search:chosen_category query
    ```
-   Retrieve the closest page result with given query
    ```sh
      -find query
    ```
-   Retrieve the closest page result with given query and filtered by category
    ```sh
      -find:chosen_category query
    ```
-   Retrieve a [link](https://tarkov.ascheron.dev/) to ascheron's interactive ammo chart
    ```sh
      -ammo
    ```
-   Retrieve a [link](https://escapefromtarkov.gamepedia.com/Quests) to the wiki's "Quests" page
    ```sh
      -quests
    ```
-   Retrieve an [image](https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/1/19/QuestItemRequirements.png/revision/latest) containing all the required quest items
    ```sh
      -questitems
    ```
-   Retrieve an [image](https://i.imgur.com/ti2Ax5A.png) containing the best keys for loot for each map (from Pestily)
    ```sh
      -keys
    ```

## Usage Examples

-   Basic search

![Basic search](https://i.imgur.com/hoIhiPO.png)

-   Search in category

![Search by category](https://i.imgur.com/lpSnh37.png)

-   Basic find (Chest Rig)

![Basic find (Chest Rig)](https://i.imgur.com/8UHnkYR.png)

-   Basic find (Map)

![Basic find (Map)](https://i.imgur.com/kH2GPNp.png)

-   Basic find (Quest)

![Basic find (Quest)](https://i.imgur.com/LixA42g.png)

-   Find in category

![Find in category](https://i.imgur.com/jQGvmgz.png)

-   Find in category without query
    -   This can be done with search as well

![Find in category without query](https://i.imgur.com/D14oUvQ.png)
