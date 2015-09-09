/**
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 – MIT License
 *
 * Credits: is based on Firefox's nsSMILKeySpline.cpp
 * Usage:
 * var spline = BezierEasing(0.25, 0.1, 0.25, 1.0)
 * spline(x) => returns the easing value | x must be in [0, 1] range
 *
 */
(function (definition) {
  if (typeof exports === "object") {
    module.exports = definition();
  } else if (typeof define === 'function' && define.amd) {
    define([], definition);
  } else {
    window.BezierEasing = definition();
  }
}(function () {
  var global = this;

  // These values are established by empiricism with tests (tradeoff: performance VS precision)
  var NEWTON_ITERATIONS = 4;
  var NEWTON_MIN_SLOPE = 0.001;
  var SUBDIVISION_PRECISION = 0.0000001;
  var SUBDIVISION_MAX_ITERATIONS = 10;

  var kSplineTableSize = 11;
  var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

  var float32ArraySupported = 'Float32Array' in global;

  function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
  function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
  function C (aA1)      { return 3.0 * aA1; }

  // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
  function calcBezier (aT, aA1, aA2) {
    return ((A(aA1, aA2)*aT + B(aA1, aA2))*aT + C(aA1))*aT;
  }

  // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
  function getSlope (aT, aA1, aA2) {
    return 3.0 * A(aA1, aA2)*aT*aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
  }

  function binarySubdivide (aX, aA, aB) {
    var currentX, currentT, i = 0;
    do {
      currentT = aA + (aB - aA) / 2.0;
      currentX = calcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0.0) {
        aB = currentT;
      } else {
        aA = currentT;
      }
    } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
    return currentT;
  }

  function BezierEasing (mX1, mY1, mX2, mY2) {
    // Validate arguments
    if (arguments.length !== 4) {
      throw new Error("BezierEasing requires 4 arguments.");
    }
    for (var i=0; i<4; ++i) {
      if (typeof arguments[i] !== "number" || isNaN(arguments[i]) || !isFinite(arguments[i])) {
        throw new Error("BezierEasing arguments should be integers.");
      }
    }
    if (mX1 < 0 || mX1 > 1 || mX2 < 0 || mX2 > 1) {
      throw new Error("BezierEasing x values must be in [0, 1] range.");
    }

    var mSampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);

    function newtonRaphsonIterate (aX, aGuessT) {
      for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
        var currentSlope = getSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0.0) return aGuessT;
        var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
      }
      return aGuessT;
    }

    function calcSampleValues () {
      for (var i = 0; i < kSplineTableSize; ++i) {
        mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }
    }

    function getTForX (aX) {
      var intervalStart = 0.0;
      var currentSample = 1;
      var lastSample = kSplineTableSize - 1;

      for (; currentSample != lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
        intervalStart += kSampleStepSize;
      }
      --currentSample;

      // Interpolate to provide an initial guess for t
      var dist = (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample+1] - mSampleValues[currentSample]);
      var guessForT = intervalStart + dist * kSampleStepSize;

      var initialSlope = getSlope(guessForT, mX1, mX2);
      if (initialSlope >= NEWTON_MIN_SLOPE) {
        return newtonRaphsonIterate(aX, guessForT);
      } else if (initialSlope === 0.0) {
        return guessForT;
      } else {
        return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize);
      }
    }

    var _precomputed = false;
    function precompute() {
      _precomputed = true;
      if (mX1 != mY1 || mX2 != mY2)
        calcSampleValues();
    }

    var f = function (aX) {
      if (!_precomputed) precompute();
      if (mX1 === mY1 && mX2 === mY2) return aX; // linear
      // Because JavaScript number are imprecise, we should guarantee the extremes are right.
      if (aX === 0) return 0;
      if (aX === 1) return 1;
      return calcBezier(getTForX(aX), mY1, mY2);
    };

    f.getControlPoints = function() { return [{ x: mX1, y: mY1 }, { x: mX2, y: mY2 }]; };

    var args = [mX1, mY1, mX2, mY2];
    var str = "BezierEasing("+args+")";
    f.toString = function () { return str; };

    var css = "cubic-bezier("+args+")";
    f.toCSS = function () { return css; };

    return f;
  }

  // CSS mapping
  BezierEasing.css = {
    "ease":        BezierEasing(0.25, 0.1, 0.25, 1.0),
    "linear":      BezierEasing(0.00, 0.0, 1.00, 1.0),
    "ease-in":     BezierEasing(0.42, 0.0, 1.00, 1.0),
    "ease-out":    BezierEasing(0.00, 0.0, 0.58, 1.0),
    "ease-in-out": BezierEasing(0.42, 0.0, 0.58, 1.0)
  };

  return BezierEasing;

}));


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
                console.log('pause')
                __.glyph.removeClass('glyphicon-play').addClass('glyphicon-pause');
                __.glyphTL.restart();
                __.glyphTL.play();
                __.video.pause();
                ga('send', 'event', 'video', 'pause', 'after play');
            } else {
                __.glyph.removeClass('glyphicon-pause').addClass('glyphicon-play');
                __.glyphTL.restart();
                __.glyphTL.play();
                __.video.play();
                ga('send', 'event', 'video', 'play', 'after pause');
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
            ga('send', 'event', 'video', 'ended');
        });
        
        $(__.video).on('pause', function(evt) {
            __.isPlaying = false;
        });
        
        $(__.video).on('play', function(evt) {
            __.isPlaying = true;
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
        var client = $('.client');
        var downPrompt = $('.downPrompt');
        var downPromptP = $('.downPrompt p');
        var downPromptG = $('.downPrompt .glyphicon');

        var seagate = $('.seagate');
        var whoami = $('.whoami');
        
        var companyName = window.location.hash || 'Apple';
        var companies = ['Gaiam', 'Apple', 'SSB'];
        
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

            TweenLite.set(client, {
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
            
            // do some work on the name
            companyName = companyName.replace('#', '');
            if(companies.indexOf(companyName) === -1) {
                companyName = 'Apple';
            }
            client.text(companyName);
            
            var wtl = new TimelineMax();
            wtl.stop();

            wtl.addLabel('client', 0.85);

            wtl.to(welcome, 0.85, { opacity: 1, ease: new BezierEasing(.77,0,.82,1) });
            wtl.to(client, 1.3, { opacity: 1, delay: 0.3, ease: new BezierEasing(.77,0,.82,1) }, 'client');
            wtl.to(downPrompt, 1, { opacity: 1, delay: 0.8, ease: Power1.easeInOut }, 'client');
            wtl.to(downPromptP, 1.6, { y: 0, delay: 0.8, ease: Power3.easeInOut}, 'client');
            wtl.to(downPromptG, 1.3, { y: 0, delay: 1.4, ease: Back.easeOut.config(1.7) }, 'client');

            wtl.play();
        }

        function updateScroll() {
            var sAmt = window.document.body.scrollTop;
            var fadeAmount = sAmt / 100;
            TweenLite.set(downPrompt, { opacity: 1 - fadeAmount });
            TweenLite.set(whoami, { opacity: (fadeAmount/8) });
        }

        // events
        $(window).on('scroll', updateScroll);

        $('.downPrompt a').on('click', function(evt) {
            evt.preventDefault();
            console.log('animating...');
            console.dir(window.document.body);
            TweenLite.to(window.document.body, 1, { scrollTop: whoami.offset().top, ease: Power2.easeOut });
        });

        // run
        setup();


    });
})(jQuery);