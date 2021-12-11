/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* 
    Created on : Aug 30, 2015, 7:57:58 PM
    Author     : mike_newell
*/

// for reference - used in styles
//                __.elem.style.padding = positions.tilePadding + 'px';
//                __.elem.style.backgroundSize = 'cover';
//                __.elem.style.backgroundPosition = 'center center';
//                __.elem.style.position = 'absolute';
//                __.elem.style.left = '0px';
//                __.elem.style.top = '0px';
//                __.elem.style.webkitTransform = 'translate3d(0.1px,0.1px,1px)';
//                __.elem.style.cursor = 'move';
//                __.elem.style.zIndex = '100';

/* global positions */

"use strict";

// this global because html5 drag spec does not give 
// access to data ondragenter
var CURRENTLY_DRAGGING = null;
function Tile(id, imgUrl) {
    var __ = this;
    var transitions = [
        'opacity 0.85s ease-in-out',
        '-webkit-transform 0.6s ease-in-out',
        '-webkit-filter 0.4s ease-in-out'
    ];
    var fastTransitions = [
        'opacity 0.55s ease-in-out',
        '-webkit-transform 0.2s ease-in-out'
    ];
    var paddingOffset = (2 * positions.tilePadding);
    __.id = id;

//    var tn = document.createTextNode(id);
    __.elem = document.createElement('div');
//    __.elem.appendChild(tn);
    __.elem.className = 'tile';
    __.elem.setAttribute('draggable', true);
    setWidth();
    setHeight();
    __.elem.style.backgroundImage = 'url('+imgUrl+')';
    __.elem.style.webkitTransition = transitions.join();
    __.elem.addEventListener('drag', drag, false);
    __.elem.addEventListener('dragstart', dragStart, false);
    __.elem.addEventListener('dragend', dragEnd, false);
    __.elem.addEventListener('dragenter', dragEnter, false);
    __.elem.addEventListener('dragover', dragOver, false);
    __.elem.addEventListener('drop', drop, false);
    // mobile
    __.elem.addEventListener("touchstart", touchStart, false);
    __.elem.addEventListener("touchend", touchEnd, false);
    __.elem.addEventListener("touchmove", touchMove, false);
    positions.world.insertBefore(__.elem, positions.tools);
    
    
    // TOUCHES
    function touchStart(evt) {
        __.elem.style.webkitTransition = 'none';
        __.elem.style.zIndex = 200;
    }
    
    function touchEnd(evt) {
        console.log('touchEnd');
        console.log(evt);
        var offset = getOffsets(evt);
        var x = evt.changedTouches[0].clientX - offset.tileX - offset.left;
        var y = evt.changedTouches[0].clientY - offset.tileY - offset.top;
        
        // TODO: find whatever element this is over
        var dropId = findDrop(x,y);
        positions.moveFromTo(__.id, dropId);
        __.elem.style.webkitTransition = transitions.join();
        setTimeout(function() {
            __.elem.style.zIndex = 0;
        }, 500);
    }
    
    function touchMove(evt) {
        var offset = getOffsets(evt);
        
        evt.preventDefault();
        var x = evt.targetTouches[0].clientX - offset.tileX - offset.left;
        var y = evt.targetTouches[0].clientY - offset.tileY - offset.top;
        __.elem.style.webkitTransform = 'translate3d('+x+'px,'+y+'px,0.1px)';
    }
    
    function getOffsets(evt) {
        var offsetTop = evt.target.parentNode.offsetTop;
        var offsetLeft = evt.target.parentNode.offsetLeft;
        var tileOffsetX = Math.round((positions.tileWidth + (2 * positions.tilePadding))/2);
        var tileOffsetY = Math.round((positions.tileHeight + (2 * positions.tilePadding))/2);
        return {
            top: offsetTop,
            left: offsetLeft,
            tileX: tileOffsetX,
            tileY: tileOffsetY
        };
    }
    
    function findDrop(x, y) {
        for(var i = 0, len = positions.tiles.length; i < len; i++) {
            var col = i % positions.tilesPerRow;
            var row = Math.floor(i/positions.tilesPerRow);
            var lowerX = col *  positions.tileWidth;
            var upperX = (col * positions.tileWidth) + positions.tileWidth;
            var lowerY = row * positions.tileHeight;
            var upperY = (row * positions.tileHeight) + positions.tileHeight;
            
            if(x < lowerX || x > upperX) {
                continue;
            }
            
            if(y < lowerY || y > upperY) {
                continue;
            }
            
            // otherwise we have a match
            return positions.tiles[i].id;
            
        }
    }
    
    // DRAG
    function drag(evt) {        
//        console.log(evt)
//        var x = evt.x - __.clone.specialOffsets.tileX - __.clone.specialOffsets.left;
//        var y = evt.y - __.clone.specialOffsets.tileY - __.clone.specialOffsets.top;
        if(__.clone !== null) {
            var x = evt.pageX - __.clone.specialOffsets.left - __.clone.initialOffsetX;
            var y = evt.pageY - __.clone.specialOffsets.top - __.clone.initialOffsetY;
            __.clone.style.webkitTransform = 'translate3d('+x+'px,'+y+'px,0.1px)';
        }
    }

    function dragStart(evt) {
//        console.log(evt)
        
        // if we already have a clone when the next drag starts
        if(__.clone && __.clone !== null) {
            __.elem.parentNode.removeChild(__.clone);
            __.clone = null;
        }
        
        
        // clone and hide
        __.clone = clone();
        __.clone.specialOffsets = getOffsets(evt);
        __.clone.initialOffsetX = evt.offsetX;
        __.clone.initialOffsetY = evt.offsetY;
        __.clone.style.zIndex = 200;
        __.clone.style.pointerEvents = 'none';
        __.clone.style.webkitTransition = 'none';
        __.elem.parentNode.insertBefore(__.clone, __.elem);
        __.elem.style.opacity = 0;

        // NOTE: dataTransfer cant be accessed on dragenter so we need a global
        evt.dataTransfer.clearData('text');
        evt.dataTransfer.setData('text', __.id.toString());
        CURRENTLY_DRAGGING = __.id;
    }

    function dragEnd(evt) {
        __.elem.style.webkitTransition = 'none';
        if(__.clone !== null) {
            __.clone.style.webkitTransition = fastTransitions.join();
        }
        
        var idx = getCurrentTileIdx();
        if(typeof idx === 'number' && idx !== null) {
            var pos = getRowColFromIdx(idx);
            moveCloneTo(pos);
        }
        
        setTimeout(function() {
            __.elem.style.opacity = 1;
            if(__.clone !== null) {
                __.clone.style.webkitTransition = 'none';
                __.clone.style.opacity = 0;
            }
            setTimeout(function() {
                __.elem.style.webkitTransition = transitions.join();
                
                if(__.clone && __.clone !== null) {
                    __.elem.parentNode.removeChild(__.clone);
                    __.clone = null;
                }
            }, 100);
        }, 500);
        
    }
    
    function getCurrentTileIdx() {
        var idx = null;
        for(var i = 0, len = positions.tiles.length; i < len; i++) {
            var tile = positions.tiles[i];
            if(tile.id === __.id) {
                idx = i;
                break;
            }
        }
        return idx;
    }
    
    function getRowColFromIdx(idx) {
        return {
            row: Math.floor(idx/positions.tilesPerRow),
            col: idx % positions.tilesPerRow
        };
    }
    
    function moveCloneTo(pos) {
        if(__.clone === null) {
            return;
        }
        var x = (pos.col * (positions.tileWidth + paddingOffset ));
        var y = (pos.row * (positions.tileHeight + paddingOffset ));
        __.clone.style.webkitTransform = 'translate3d('+x+'px,'+y+'px,0.1px)';
    }

    function dragEnter(evt) {
        positions.moveFromTo(CURRENTLY_DRAGGING, __.id);
    }

    function dragOver(evt) {
        evt.preventDefault();
    }

    function drop(evt) {
        evt.preventDefault();
        CURRENTLY_DRAGGING = null;
    }

    function clone() {
        var clone = __.elem.cloneNode(true);
        return clone;
    }

    function setWidth() {
        __.elem.style.width = positions.tileWidth + 'px';
    }

    function setHeight() {
        __.elem.style.height = positions.tileHeight + 'px';
    }

    __.updatePosition = function(pos) {
        var x = (pos.col * (positions.tileWidth + paddingOffset ));
        var y = (pos.row * (positions.tileHeight + paddingOffset ));
        setWidth();
        setHeight();
        __.elem.style.webkitTransform = 'translate3d('+x+'px,'+y+'px,0.1px)';
    };

    return __;
}