/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var CustomVideo = function(container) {
    var __ = this;
    
    __.container = container;
    __.isFirstTimePlaying = true;
    __.isPlaying = false;
    __.canPlayThrough = false;
    
    return __;
};

(function($) {
    
    CustomVideo.prototype.init = function() {
        var __ = this;
        
        // find the video elements
        __.video = $(__.container).children('video')[0];
        __.glyph = $(__.container).find('.glyphicon');
        __.touchLayer = $(__.container).children('a')[0];
        
        // prepare the presentation of the player
        var src = $(__.video).prop('poster');
        if(src) {
            var img = new Image();
            img.onload = function() {
                $(img).css({ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 });
                $(__.touchLayer).prepend(img);
            };
            img.src = src;
            __.posterImage = img;
        }
        
        // define the play and pause timelines for later
        TweenLite.set(__.touchLayer, {
            perspective: 500,
            transformStyle: "preserve-3d"
        });
        __.glyphTL = new TimelineMax();
        __.glyphTL.stop();
        __.glyphTL.set(__.video, { z: -200, opacity: 1 });
        __.glyphTL.set(__.glyph, { z: -200, opacity: 1 });
        __.glyphTL.to(__.glyph, 0.5, { opacity: 0, z: 0.001, ease: Power1.easeOut });
        
        // private
        function handleTouchLayerClicked(evt) {
            evt.preventDefault();
            
            if(__.isFirstTimePlaying) {
                TweenLite.to(__.posterImage, 1.5, { opacity: 0, ease: Power2.easeOut });
                __.isFirstTimePlaying = false;
                ga('send', 'event', 'video', 'play', 'first time');
            }
            
            if(__.isPlaying) {
                __.glyph.removeClass('glyphicon-play').addClass('glyphicon-pause');
                __.glyphTL.restart();
                __.glyphTL.play();
                __.video.pause();
                ga('send', 'event', 'video', 'pause', 'was playing');
            } else {
                __.glyph.removeClass('glyphicon-pause').addClass('glyphicon-play');
                __.glyphTL.restart();
                __.glyphTL.play();
                __.video.play();
                ga('send', 'event', 'video', 'play', 'was paused');
            }
        }
        
        // set up events
        $(__.touchLayer).on('click', handleTouchLayerClicked);
//        if(isMobile) {
//            var gestureTouchLayer = new Hammer(__.touchLayer);
//            gestureTouchLayer.on('tap', handleTouchLayerClicked);
//        } else {
//            $(__.touchLayer).on('click', handleTouchLayerClicked);
//        }
            
        $(__.video).on('ended', function(evt) {
            console.log('ended')
            __.isPlaying = false;
            __.isFirstTimePlaying = true;
            __.showReadyPlay();
        });
        
        $(__.video).on('pause', function(evt) {
            __.isPlaying = false;
            
        });
        
        $(__.video).on('play', function(evt) {
            __.isPlaying = true;
//            $(__.video).css({opacity: 0});
        });
        
        $(__.video).on('playing', function(evt) {
            __.isPlaying = true;
        });
        
        $(__.video).on('canplaythrough', function(evt) {
            __.canPlayThrough = true;
        });
    };
    
    CustomVideo.prototype.showReadyPlay = function() {
        var __ = this;
        console.log(this);
        __.glyph.removeClass('glyphicon-pause').addClass('glyphicon-play');
        TweenLite.to(__.glyph, 1, { opacity: 0.7, fontSize: 94, ease: Power1.easeInOut });
        TweenLite.to(__.posterImage, 1.5, { opacity: 1, ease: Power2.easeOut });
    };
    
})(jQuery);