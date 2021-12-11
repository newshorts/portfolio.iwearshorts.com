/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global positions */

function Tools() {
    var __ = this;
    
    __.elem = document.querySelector('.tools');
    __.play = __.elem.querySelector('.play');
    __.add = __.elem.querySelector('.add');
    __.download = __.elem.querySelector('.download');
    __.world = document.querySelector('.world');
    
    __.world.addEventListener('mouseenter', hover, false);
    __.world.addEventListener('mouseover', hover, false);
    __.world.addEventListener('mouseleave', leave, false);
    __.play.addEventListener('click', playClick, true);
    __.add.addEventListener('click', addClick, true);
    __.download.addEventListener('click', downloadClick, true);
    
    var movie = new Movie();
    var ios = /iPad|iPhone|iPod/.test(navigator.platform);
    console.log('ios' + ios);
    if(ios) {
        __.elem.style.display = 'block';
        __.elem.style.opacity = 1;
    }
    
    function playClick(evt) {
        evt.preventDefault();
        console.log('play clicked');
        movie.play();
    }
    
    function addClick(evt) {
        evt.preventDefault();
        console.log('add clicked');
    }
    
    function downloadClick(evt) {
        evt.preventDefault();
        console.log('download clicked');
    }
    
    function hover(evt) {
        evt.preventDefault();
//        console.log('hover')
        __.elem.style.display = 'block';
        setTimeout(function() {
            __.elem.style.opacity = 1;
        }, 0);
    }
    
    function leave(evt) {
        evt.preventDefault();
//        console.log('leave')
        
        if(ios) {
            return;
        }
        
        setTimeout(function() {
            __.elem.style.display = 'none';
        }, 200);
        __.elem.style.opacity = 0;
    }
    
    return __;
}

function Movie() {
    var __ = this;
    
    var playBackShouldStop = false;
    var ios = /iPad|iPhone|iPod/.test(navigator.platform);
    
    __.header = document.getElementsByTagName('header')[0];
    __.main = document.getElementsByTagName('main')[0];
    __.footer = document.getElementsByTagName('footer')[0];
    __.world = document.querySelector('.world');
    __.movieOverlay = document.querySelector('.movieOverlay');
    __.movieScreen = document.querySelector('.movieScreen');
    
    __.movieOverlay.addEventListener('click', remove, true);
    
    function cascade(callback) {
        setTimeout(callback, 100);
    }
    
    function remove(evt) {
        evt.preventDefault();
        playBackShouldStop = true;
        __.fadeOut(__.movieOverlay).then(function() {
            // done
            console.log('done')
            
            cascade(function() {
                __.header.style.webkitFilter = 'none';
                cascade(function() {
                    __.main.style.webkitFilter = 'none';
                    cascade(function() {
                        __.footer.style.webkitFilter = 'none';
                    });
                });
            });
        });
    }
    
    function beginPlayback() {
        var tiles = positions.tiles;
        var images = [];
        var len = tiles.length;
        var loaded = 0;
        
        // empty in case we already played
        __.movieScreen.innerHTML = "";
        
        for(var i = 0; i < len; i++) {
            var tile = tiles[i];
            var image = new Image();
            image.src = positions.getBackgroundImage(tile.elem);
            image.className = 'movieImage image-' + i;
            image.onload = (function() {
                __.movieScreen.appendChild(image);
                loaded++;
                if(loaded === len - 1) {
                    setTimeout(function() {
                        playBackShouldStop = false;
                        playBack(0);
                    }, 100);
                }
            })();
            images.push(image);
        }
        
        function playBack(idx) {
            if(playBackShouldStop) {
                return;
            }
            console.log('playing')
            
            var prev = idx - 1;
            if(idx >= len) {
                idx = 0;
            }
            
            if(idx === 0) {
                prev = len - 1;
            }
            
            var prevImg = images[prev];
            prevImg.style.opacity = 0;
            
            var img = images[idx];
            var x = Math.round(((Math.random() - 0.5) * 125));
            var y = Math.round(((Math.random() - 0.5) * 125));
            var z = Math.round(((Math.random() - 0.5) * 15));
            var rotX = Math.round( ((Math.random() - 0.5) * 3) + 1 );
            var rotY = Math.round( ((Math.random() - 0.5) * 6) + 1 );
            var rotZ = Math.round( ((Math.random() - 0.5) * 4) + 1 );
            var scale = ((Math.random() * (10 - 8)) + 8) / 10;
            if(ios) {
                scale -= 0.25;
            }
            var transforms = [
                'translate3d('+x+'px,'+y+'px,'+z+'px)',
                'rotateX('+rotX+'deg)',
                'rotateY('+rotY+'deg)',
                'rotateZ('+rotZ+'deg)',
                'scale('+scale+','+scale+')'
            ];
            img.style.webkitTransform = transforms.join(' ');
            
            img.style.opacity = 1;
            
            setTimeout(function() {
                idx++;
                playBack(idx);
            }, Math.round(Math.random() * 3500 + 8000));
        }
    }
    
    __.play = function() {
        var timing = 850;
        // empty in case we already played
        __.movieScreen.innerHTML = "";
        
        
        if(ios) {
            __.movieScreen.style.top = '250px';
            __.movieScreen.style.left = '250px';
        }
        
        __.fadeIn(__.movieOverlay).then(function() {
            // do something
            console.log('done');
            
            cascade(function() {
                __.header.style.webkitFilter = 'blur(5px)';
                cascade(function() {
                    __.main.style.webkitFilter = 'blur(5px)';
                    cascade(function() {
                        __.footer.style.webkitFilter = 'blur(5px)';
                    });
                });
            });
            
            beginPlayback();
        });
    };
    
    __.fadeIn = function(elem) {
        console.log('fade in')
        
        if(!Promise || typeof Promise === 'undefined' || Promise === null) {
            alert('Sorry. Promises are disabled on this device. Please update to the latest version of safari.');
            return;
        }
        
        return new Promise(function(fullfill, reject) {
            var timing = 450;
            var transition = 'opacity '+timing/1000+'s ease-in-out';
            elem.style.webkitTransition = 'none';
            elem.style.opacity = 0;
            elem.style.display = 'block';
            elem.style.webkitTransition = transition;
            setTimeout(function() { 
                elem.style.opacity = 1;
            }, 0);
            
            setTimeout(fullfill, timing);
        });
            
    };
    
    __.fadeOut = function (elem) {
        console.log('fade out')
        
        if(!Promise || typeof Promise === 'undefined' || Promise === null) {
            alert('Sorry. Promises are disabled on this device. Please update to the latest version of safari.');
            return;
        }
        
        return new Promise(function(fullfill, reject) {
            var timing = 350;
            var transition = 'opacity '+timing/1000+'s ease-in-out';
            elem.style.webkitTransition = transition;
            setTimeout(function() { 
                elem.style.opacity = 0;
            }, 0);

            setTimeout(function() {
                elem.style.webkitTransition = 'none';
                elem.style.display = 'none';
                fullfill();
            }, timing + 1000);
        });
    };
    
    
    return __;
}