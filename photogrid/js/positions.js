/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* 
    Created on : Aug 30, 2015, 7:57:58 PM
    Author     : mike_newell
*/
"use strict";
var positions = {
    tileWidth: 100,
    tileHeight: 100,
    gutter: 5,
    tilePadding: 10,
    tilesPerRow: 0,
    numTiles: 0,
    numRows: 0,
    tiles: [],
    grid: {},
    world: {},
    tools: {},
    imageNames: [
        'http://iwearshorts.com/wp-content/uploads/2015/08/1x1.png',
        'http://iwearshorts.com/wp-content/uploads/2015/08/2x1.png',
        'http://iwearshorts.com/wp-content/uploads/2015/08/1x2.png',
        'http://iwearshorts.com/wp-content/uploads/2015/08/2x2.png'
    ],

    generate: function(tilesPer, images) {
        if(images && Array.isArray(images)) {
            // don't sort, use include
            this.imageNames = images;
//            this.imageNames = images.sort();
        }
        
        this.instantiate(tilesPer);
    },
    
    instantiateFromLocal: function(tilesPer) {
        var arr = this.getLocal();
        if(Array.isArray(arr)) {
            this.imageNames = arr;
        }
        
        this.instantiate(tilesPer);
    },
    
    instantiate: function(tilesPer) {
        this.tilesPerRow = tilesPer;
        this.numTiles = this.imageNames.length;
        this.numRows = Math.ceil(tilesPer / this.numTiles);
        this.grid = document.querySelector('.grid');
        this.world = document.querySelector('.world');
        this.tools = document.querySelector('.tools');
        for(var i = 0; i < this.numTiles; i++) {
            var id = Math.round(11111 * i);
            this.tiles.push(new Tile(id, this.imageNames[i]));
        }
        this.update();
    },
    
    moveFromTo: function(fromId, toId) {
        if(fromId === toId) {
            this.update();
            return;
        }

        // get index of tiles from id
        var fromIdx = this.getIndexFromId(fromId),
            toIdx = this.getIndexFromId(toId);

        if(fromIdx === null || toIdx === null) {
            console.warn('moveFromTo() reported a null index');
            console.log({fromIdx: fromIdx, toIdx: toIdx});
            
            // return to original space
            if(fromIdx !== null) {
                this.update();
            }
            
            return;
        }

        var displaced = this.emptyAt(fromIdx);
        this.sortToAndInsert(displaced, toIdx);
        this.update();
    },

    sortToAndInsert: function (tile, idx) {
        var __ = this;
        var displaced = this.tiles[idx];
        this.tiles[idx] = tile;

        var nullIdx = findNull();
        var needle = nullIdx;
        if(nullIdx < idx) {
            sortUp(needle);
        } else {
            sortDown(needle);
        }

        function findNull() {
            for(var i = 0, len = __.tiles.length; i < len; i++) {
                if(__.tiles[i] === null && typeof __.tiles[i] === 'object') {
                    return i;
                }
            }
        }

        function sortUp(i) {
            // look right
            if(Math.round(i + 1) === Math.round(idx)) {
                __.tiles[i] = displaced;
                return;
            }
            forwardNull(i, Math.round(i + 1));
            sortUp(i + 1);
        }

        function sortDown(i) {
            // look left
            if(Math.round(i - 1) === Math.round(idx)) {
                __.tiles[i] = displaced;
                return;
            }
            forwardNull(i, Math.round(i - 1));
            sortDown(i - 1);
        }

        function forwardNull(current, ahead) {
            var tmp = __.tiles[ahead];
            __.tiles[current] = tmp;
            __.tiles[ahead] = null;
        }

    },
    emptyAt: function (idx) {
        var displaced = this.tiles[idx];
        this.tiles[idx] = null;
        return displaced;
    },
    getIndexFromId: function(id) {
        for(var i = 0, len = this.tiles.length; i < len; i++) {
            var tile = this.tiles[i];
            if(Math.round(tile.id) === Math.round(id)) {
                return i;
            }
        }
        return null;
    },
    
    hasLocal: function() {
        return window.localStorage.hasOwnProperty('APPLE_PHOTO_GRID');
    },
    /**
     * 
     * @returns {Array|Object}
     */
    getLocal: function() {
        return JSON.parse(window.localStorage.getItem('APPLE_PHOTO_GRID'));
    },
    /**
     * 
     * @param {Array} arr
     * @returns {undefined}
     */
    setLocal: function(arr) {
        var json = JSON.stringify(arr);
        window.localStorage.setItem('APPLE_PHOTO_GRID', json);
    },
    deleteLocal: function() {
        window.localStorage.removeItem('APPLE_PHOTO_GRID');
    },
    getBackgroundImage: function(elem) {
        var style = window.getComputedStyle(elem);
        if(style.hasOwnProperty('backgroundImage')) {
            return style.backgroundImage.replace('url(', '').replace(')', '');
        }
    },
    update: function() {
        
        this.numTiles = this.tiles.length;
        this.numRows = Math.ceil(this.numTiles / this.tilesPerRow);
        
        var order = [];

        for(var i = 0; i < this.tiles.length; i++) {
            var tile = this.tiles[i];
            var bg = this.getBackgroundImage(tile.elem);
            order.push(bg);
            
            if(tile) {
                var pos = {
                    row: Math.floor(i/this.tilesPerRow),
                    col: i % this.tilesPerRow
                };
                tile.updatePosition(pos, i);
            }
        }
        
        // store for later
        if(order.length > 0) {
            this.setLocal(order);
        }
    }
};