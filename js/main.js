/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


"use strict";
var videos = [];

(function() {
    $(window).load(function() {

        // config

        // globals
        var w, h;
        var container = $('.container');
        var welcome = $('.sentiment');
        var apple = $('.client');
        var downPrompt = $('.downPrompt');
        var downPromptP = $('.downPrompt p');
        var downPromptG = $('.downPrompt .glyphicon');

        var seagate = $('.seagate');

        // setup
        function setup() {
            setDimensions();

            // get all the video elements
            $('.videoContainer').each(function(idx) {
                var vid = new CustomVideo(this);
                vid.init();
                videos.push(vid);
            });

            // set elements
            TweenLite.set(window.document.body, { scrollTop: 0 });

            TweenLite.set(welcome, {
                top: (h/3) - 27,
                z: 0.001
            });

            TweenLite.set(apple, {
                top: ((h/3) * 1.3333) - 100,
                z: 0.001
            });

            TweenLite.set(downPrompt, {
                perspective: 500,
                transformStyle: "preserve-3d"
            });

            TweenLite.set(downPromptP, { x: 0, y: 100, z: 0.001 });
            TweenLite.set(downPromptG, { x: 0, y: 150, z: 0.001 });

            if(isMobile) {
                $('p').css({ 'font-weight': 300 });
            }

            initWelcome();
        }

        function setDimensions() {
            w = $(window).width();
            h = $(window).height();
        }

        function initWelcome() {
            var wtl = new TimelineMax();
            wtl.stop();

            wtl.addLabel('client', 0.85);

            wtl.to(welcome, 0.85, { opacity: 1, ease: new BezierEasing(.77,0,.82,1) });
            wtl.to(apple, 1.3, { opacity: 1, delay: 0.3, ease: new BezierEasing(.77,0,.82,1) }, 'client');
            wtl.to(downPrompt, 1, { opacity: 1, delay: 0.8, ease: Power1.easeInOut }, 'client');
            wtl.to(downPromptP, 1.6, { y: 0, delay: 0.8, ease: Power3.easeInOut}, 'client');
            wtl.to(downPromptG, 1.3, { y: 0, delay: 1.4, ease: Back.easeOut.config(1.7) }, 'client');

            wtl.play();
        }

        function updateScroll() {
            var sAmt = window.document.body.scrollTop;
            var fadeAmount = sAmt / 100;
            TweenLite.set(downPrompt, { opacity: 1 - fadeAmount });
            TweenLite.set(seagate, { opacity: (fadeAmount/8) });
        }

        // events
        $(window).on('scroll', updateScroll);

        $('.downPrompt a').on('click', function(evt) {
            evt.preventDefault();
            console.log('animating...');
            console.dir(window.document.body);
            TweenLite.to(window.document.body, 1, { scrollTop: seagate.offset().top, ease: Power2.easeOut });
        });

        // run
        setup();


    });
})(jQuery);