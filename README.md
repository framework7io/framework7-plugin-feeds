[![devDependency Status](https://david-dm.org/nolimits4web/framework7-feeds/dev-status.svg)](https://david-dm.org/nolimits4web/framework7-feeds#info=devDependencies)
[![Flattr this git repo](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=nolimits4web&url=https://github.com/nolimits4web/framework7-feeds/&title=Framework7+Feeds&language=JavaScript&tags=github&category=software)

Framework7 Feeds
===================

Framework7 Feeds plugin brings easy RSS feeds integration into Framework7 app.

Plugin comes with easy and powerful JS API to integrate and customize RSS feeds. But in most cases you will not need to use JavaScript at all.

## Installation

Just grab plugin files from `dist/` folder or using bower:

```
bower install framework7-feeds
```

And link them to your app's right AFTER Framework7's scripts and styles:

```
<link rel="stylesheet" href="path/to/framework7.min.css">
<link rel="stylesheet" href="path/to/framework7.feeds.css">
...
<script src="path/to/framework7.min.js"></script>
<script src="path/to/framework7.feeds.js"></script>
```
## Usage

### Manual initialization

Plugin extends initiliazed `app` instance with new `.feeds()` method:
```
myApp.feeds(container, parameters);
```
* `container` - HTMLElement or string (with CSS Selector) of container HTML element with parsed RSS feed. Required
* `parameters` - object with Slider parameters. Optional

*This method returns initialized Feeds instance*

<b>Parameters:</b>
<table>
  <tbody>
    <tr>
      <td><b>url</b></td>
      <td>string</td>
      <td>URL of RSS feed to parse and load</td>
    </tr>
    <tr>
      <td><b>openIn</b></td>
      <td>string</td>
      <td>Could be `'page'` or `'popup'`. Defines how to open generated page of single feed item</td>
    </tr>
    <tr>
      <td><b>formatDate</b></td>
      <td>function (date)</td>
      <td>Function to format RSS item date, this function should return string with formatted date</td>
    </tr>
    <tr>
      <td><b>virtualList</b></td>
      <td>object</td>
      <td>Object with <a href="http://www.idangero.us/framework7/docs/virtual-list.html#virtual-list-parameters">Virtual List</a> parameters. If specified, then RSS feed will be loaded as Virtual List</td>
    </tr>
    <tr>
      <td><b>customItemFields</b></td>
      <td>array</td>
      <td>Array with additional item fields (xml tags) that also should be parsed from RSS, for example `['content:encoded', 'author']`. Such custom RSS tags with colon (:) will be parsed and available in template without colon, for example, the value of `content:encoded` tag will be available in templates as `contentencoded` property.</td>
    </tr>
    <tr>
      <td><b>listTemplate</b></td>
      <td>string/function</td>
      <td>Template7 template for list with RSS items</td>
    </tr>
    <tr>
      <td><b>itemPageTemplate</b></td>
      <td>string/function</td>
      <td>Template7 template for single RSS item page</td>
    </tr>
    <tr>
      <td><b>itemPopupTemplate</b></td>
      <td>string/function</td>
      <td>Template7 template for single RSS item popup</td>
    </tr>
    <tr>
      <td><b>onAjaxStart</b></td>
      <td>function(feeds)</td>
      <td>Callback function that will be executed right before Ajax request to RSS feed</td>
    </tr>
    <tr>
      <td><b>onAjaxComplete</b></td>
      <td>function(feeds, response)</td>
      <td>Callback function that will be executed when Ajax request to RSS feed will be completed</td>
    </tr>
  </tbody>
</table>

<b>Usage example with manual initialization:</b>

```
<div class="list-block my-feed"></div>
```
```
var myFeed = myApp.feeds('.my-feed', {
  url: 'http://path-to-rss.com/rss.xml',
  openIn: 'popup'
});
```

### Automatic initialization

If you need minimal parser setup you may use automatic initialization without JavaScript at all. In this case you need to add additional `feeds-init` class to feeds container and specify all parameters from table above using `data-` attributes, for example:

```
<div class="list-block feeds-init" data-url="http://path-to-rss.com/rss.xml" data-openIn="page"></div>
```

## Usage with Pull To Refresh

Feeds plugin fully compatible with Pull To Refresh component, and will automatically refresh feed on pull to refresh. No additional actions or code are required.

## Demo

Plugin comes with demo example to see how it works and looks. To launch demo you need: 

* install bower dependencies. Go to `demo/` folder and execute in terminal `bower install`

Or check out <a href="http://www.idangero.us/framework7/plugins/">live demo</a>

## Contribute

All changes should be done only in `src/` folder. This project uses `gulp` to build a distributable version. 

First you need to install all dependencies:

```
$ npm install
```

Then to build plugin's files for testing run:
```
$ gulp build
```

If you need a local server while you developing you can run:

```
$ gulp server
```

And working demo will be available at `http://localhost:3000/demo/`