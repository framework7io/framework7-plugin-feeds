Framework7.prototype.plugins.feeds = function (app, params) {
    'use strict';
    params = params || {enabled: true};
    var $ = window.Dom7;

    function appInit() {
        
    }
    
    function pageInit(page) {

    }

    function pageBeforeRemove(page) {

    }
    
    return {
        hooks : {
            pageInit: pageInit,
            pageBeforeRemove: pageBeforeRemove
        }
    };
};