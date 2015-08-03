/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var CustomVideo = function(container) {
    var __ = this;
    
    __.container = container;
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
            
            if(__.isPlaying) {
                console.log('pause')
                __.glyph.removeClass('glyphicon-play').addClass('glyphicon-pause');
                __.glyphTL.restart();
                __.glyphTL.play();
                __.video.pause();
            } else {
                __.glyph.removeClass('glyphicon-pause').addClass('glyphicon-play');
                __.glyphTL.restart();
                __.glyphTL.play();
                __.video.play();
            }
        }
        
        // set up events
        if(isMobile) {
            var gestureTouchLayer = new Hammer(__.touchLayer);
            gestureTouchLayer.on('tap', handleTouchLayerClicked);
        } else {
            $(__.touchLayer).on('click', handleTouchLayerClicked);
        }
            
        $(__.video).on('ended', function(evt) {
            console.log('ended')
            __.isPlaying = false;
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
        console.log(this)
        this.glyph.removeClass('glyphicon-pause').addClass('glyphicon-play');
        TweenLite.to(this.glyph, 1, { opacity: 0.7, fontSize: 94, ease: Power1.easeInOut });
    };
    
})(jQuery);