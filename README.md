<a href="https://www.patreon.com/vladimirkharlampidi"><img src="https://cdn.framework7.io/i/support-badge.png" height="20"></a>

# Framework7 Feeds Plugin

Framework7 Feeds plugin brings easy RSS feeds integration into Framework7 app.

Plugin comes with easy and powerful JS API to integrate and customize RSS feeds. But in most cases you will not need to use JavaScript at all.

## Installation

Just grab plugin files from `dist/` folder or using npm:

```
npm install framework7-plugin-feeds
```

And link them to your app right AFTER Framework7's scripts and styles:

```
<link rel="stylesheet" href="path/to/framework7.min.css">
<link rel="stylesheet" href="path/to/framework7.feeds.css">
...
<script src="path/to/framework7.min.js"></script>
<script src="path/to/framework7.feeds.js"></script>
```

## Usage

### Install & Enable Plugin

After you included plugin script file, you need to install plugin before you init app:

```js
// install plugin to Framework7
Framework7.use(Framework7Feeds);

// init app
var app = new Framework7({
  ...
})
```

### ES Module

This plugin comes with ready to use ES module:

```js
import Framework7 from 'framework7';
import Framework7Feeds from 'framework7-plugin-feeds';

// install plugin
Framework7.use(Framework7Feeds);

// init app
var app = new Framework7({
  ...
})
```

### API

Plugin extends initiliazed `app` instance with new methods:

  * `app.feeds.create(parameters)` - init Feeds. This method returns initialized Feeds instance.
  * `app.feeds.get(feedsEl)` - get Feeds instance by HTML element. Method returns initialized Feeds instance.
  * `app.feeds.destroy(feedsEl)` - destroy Feeds instance

### Feeds Parameters

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>el</b></td>
      <td>string<br>HTMLElement</td>
      <td></td>
      <td>Target List Block element. In case of string - CSS selector of list block element where to put parsed feeds list.</td>
    </tr>
    <tr>
      <td><b>feedUrl</b></td>
      <td>string</td>
      <td></td>
      <td>URL of RSS feed to parse and load</td>
    </tr>
    <tr>
      <td><b>openIn</b></td>
      <td>string</td>
      <td>page</td>
      <td>Could be `'page'` or `'popup'`. Defines how to open generated page of single feed item</td>
    </tr>
    <tr>
      <td><b>formatDate</b></td>
      <td>function (date)</td>
      <td></td>
      <td>Function to format RSS item date, this function should return string with formatted date</td>
    </tr>
    <tr>
      <td><b>virtualList</b></td>
      <td>object<br>boolean</td>
      <td>false</td>
      <td>Object with <a href="http://framework7.io/docs/virtual-list.html#virtual-list-parameters">Virtual List</a> parameters. If specified, then RSS feed will be loaded as Virtual List</td>
    </tr>
    <tr>
      <td><b>customItemFields</b></td>
      <td>array</td>
      <td>[]</td>
      <td>Array with additional item fields (xml tags) that also should be parsed from RSS, for example `['content:encoded', 'author']`. Such custom RSS tags with colon (:) will be parsed and available in template without colon, for example, the value of `content:encoded` tag will be available in templates as `contentencoded` property.</td>
    </tr>
    <tr>
      <td><b>renderVirtualListItem</b></td>
      <td>function(item, index)</td>
      <td></td>
      <td>Function to render virtual list item in case of enabled virtual list. Must return item HTML string</td>
    </tr>
    <tr>
      <td><b>renderList</b></td>
      <td>function(data)</td>
      <td></td>
      <td>Function to render feeds list. Must return list HTML string</td>
    </tr>
    <tr>
      <td><b>renderItemPage</b></td>
      <td>function(item)</td>
      <td></td>
      <td>Function to render single feeds item page. Must return page HTML string</td>
    </tr>
    <tr>
      <td><b>renderItemPopup</b></td>
      <td>function(item)</td>
      <td></td>
      <td>Function to render single feeds item popup. Must return popup HTML string</td>
    </tr>
    <tr>
      <td><b>routableModals</b></td>
      <td>boolean</td>
      <td>true</td>
      <td>Will add opened feeds item modal (when `openIn: 'popup'`) to router history which gives ability to close dynamic feeds item page by going back in router history and set current route to the feeds item modal</td>
    </tr>
    <tr>
      <td><b>url</b></td>
      <td>string</td>
      <td>feed/</td>
      <td>Feeds item URL that will be set as a current route url</td>
    </tr>
    <tr>
      <td><b>view</b></td>
      <td>object</td>
      <td></td>
      <td>Link to initialized View instance which is required for Feeds to work. By default, if not specified, it will be opened in parent View</td>
    </tr>
    <tr>
      <td><b>pageBackLinkText</b></td>
      <td>string</td>
      <td>Back</td>
      <td>Feeds item page back link text</td>
    </tr>
    <tr>
      <td><b>popupCloseLinkText</b></td>
      <td>string</td>
      <td>Close</td>
      <td>Feeds item popup close link text</td>
    </tr>
  </tbody>
</table>

<b>Usage example with manual initialization:</b>

```html
<div class="list my-feed"></div>
```
```js
var feed = app.feeds.create({
  el: '.my-feed',
  feedUrl: 'http://path-to-rss.com/rss.xml',
  openIn: 'popup'
});
```

### Automatic initialization

If you need minimal parser setup you may use automatic initialization without JavaScript at all. In this case you need to add additional `feeds-init` class to feeds container and specify all parameters from table above using `data-` attributes, for example:

```
<div class="list feeds-init" data-feed-url="http://path-to-rss.com/rss.xml" data-open-in="popup"></div>
```

### Feeds Events

<table>
  <thead>
    <tr>
      <th>Event</th>
      <th>Target</th>
      <th>Arguments</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ajaxStart</td>
      <td>feeds</td>
      <td>(feeds)</td>
      <td>Event will be triggered when right before XHR request to specified feed url</td>
    </tr>
    <tr>
      <td>feedsAjaxStart</td>
      <td>app</td>
      <td>(feeds)</td>
      <td>Event will be triggered when right before XHR request to specified feed url</td>
    </tr>
    <tr>
      <td>ajaxComplete</td>
      <td>feeds</td>
      <td>(feeds, response)</td>
      <td>Event will be triggered when when XHR request completed</td>
    </tr>
    <tr>
      <td>feedsAjaxComplete</td>
      <td>app</td>
      <td>(feeds)</td>
      <td>Event will be triggered when when XHR request completed</td>
    </tr>
    <tr>
      <td>open</td>
      <td>feeds</td>
      <td>(feeds)</td>
      <td>Event will be triggered when Feeds item starts its opening animation (page transiton on popup open transition)</td>
    </tr>
    <tr>
      <td>feedsOpen</td>
      <td>app</td>
      <td>(feeds)</td>
      <td>Event will be triggered when Feeds item starts its opening animation (page transiton on popup open transition)</td>
    </tr>
    <tr>
      <td>opened</td>
      <td>feeds</td>
      <td>(feeds)</td>
      <td>Event will be triggered after Feeds item completes its opening animation (page transiton on popup open transition)</td>
    </tr>
    <tr>
      <td>feedsOpened</td>
      <td>app</td>
      <td>(feeds)</td>
      <td>Event will be triggered after Feeds item completes its opening animation (page transiton on popup open transition)</td>
    </tr>
    <tr>
      <td>close</td>
      <td>feeds</td>
      <td>(feeds)</td>
      <td>Event will be triggered when Feeds item starts its closing animation (page transiton on popup open transition)</td>
    </tr>
    <tr>
      <td>feedsClose</td>
      <td>app</td>
      <td>(feeds)</td>
      <td>Event will be triggered when Feeds item starts its closing animation (page transiton on popup open transition)</td>
    </tr>
    <tr>
      <td>closed</td>
      <td>feeds</td>
      <td>(feeds)</td>
      <td>Event will be triggered after Feeds item completes its closing animation (page transiton on popup open transition)</td>
    </tr>
    <tr>
      <td>feedsClosed</td>
      <td>app</td>
      <td>(feeds)</td>
      <td>Event will be triggered after Feeds item completes its closing animation (page transiton on popup open transition)</td>
    </tr>
  </tbody>
</table>

### Usage with Pull To Refresh

Feeds plugin fully compatible with Pull To Refresh component, and will automatically refresh feed on pull to refresh. No additional actions or code are required.

## Demo

Plugin comes with demo example to see how it works and looks. To make demo works you need to run in terminal:

```
$ npm run prod
```


## Contribute

All changes should be done only in `src/` folder. This project uses `gulp` to build a distributable version.

First you need to install all dependencies:

```
$ npm install
```

Then to build plugin's files for testing run:
```
$ npm run build:dev
```

If you need a local server while you developing you can run:

```
$ gulp server
```
or
```
$ npm run dev
```

And working demo will be available at `http://localhost:3000/demo/`

## Live Preview

https://framework7io.github.io/framework7-plugin-feeds/
