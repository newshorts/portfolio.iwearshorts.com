/**
 * Written on Sunday Nov. 7th at 3PM (during my kids' naptime - don't judge me if this has some bugs...I wrote this in 3 hours)
 * 
 * Rewritten because my last portfolio site was really old :)
 * 
 * Also, the intention is to show what I can do in the span of a few hours, not the frameworks I know how to use.
 */

// closure to avoid polluting the DOM
(function() {

// was expecting to use more here
const Helpers = {
	// random number between 0 and x, excluding x (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random)
	randomIndex(x) {
		return Math.floor( Math.random() * x )
	},
}

// store all my animations in a singleton
const Animations = {

	// the welcome animation in the hero
	welcome({ sentimentElem, clientElem, downPromptElem, downPromptPElem, downPromptGElem, clientName }) {
		const h = window.innerHeight
		const w = window.innerWidth
		const scrollPercent = ScrollSystem.getPageScrollPercent()

		TweenLite.set(sentimentElem, {
			top: (h/3) - 27,
			z: 0.001
		})

		TweenLite.set(clientElem, {
			top: ((h/3) * 1.3333) - 100,
			z: 0.001
		})

		// magic number 7% of page scroll is about where we don't want to fade in the prompt animation
		if(scrollPercent < 0.07) {
			TweenLite.set(downPromptElem, { perspective: 500, transformStyle: "preserve-3d" })
			TweenLite.set(downPromptPElem, { x: 0, y: 100, z: 0.001 })
			TweenLite.set(downPromptGElem, { x: 0, y: 150, z: 0.001 })
		}

		clientElem.textContent = clientName
		
		var tl = gsap.timeline()
		tl.paused(true)

		tl.addLabel('client', 0.35)
		tl.to(sentimentElem, 0.35, { opacity: 1, ease: Power1.easeIn })
		tl.to(clientElem, 1.3, { opacity: 1, delay: 0.3, ease: Power1.easeIn }, 'client')

		// magic number 7% of page scroll is about where we don't want to fade in the prompt animation
		if(scrollPercent < 0.07) {
			tl.to(downPromptElem, 1, { opacity: 1, delay: 0.8, ease: Power1.easeInOut }, 'client')
			tl.to(downPromptPElem, 1.6, { y: 0, delay: 0.8, ease: Power3.easeInOut}, 'client')
			tl.to(downPromptGElem, 1.3, { y: 0, delay: 1.4, ease: Back.easeOut.config(1.7) }, 'client')
		}
		
		// kill this once we are complete
		tl.eventCallback('onComplete', (evt) => {
			tl.clear()
			tl.eventCallback('onComplete', null)
		})

		tl.play()
	},

	// play/pause button animations on videos
	videoClicked({ anchorElem, videoElem, glyphElem }) {
		TweenLite.set(anchorElem, {
            perspective: 500,
            transformStyle: "preserve-3d"
        })
        const tl = gsap.timeline()
		tl.paused(true)
        tl.set(videoElem, { z: -200, opacity: 1 })
        tl.set(glyphElem, { z: -200, opacity: 1 })
        tl.to(glyphElem, 0.5, { opacity: 0, z: 0.001, ease: Power1.easeOut })
		return tl
	},

	// generic aniimation for fading something out/in based on scroll
	scrollFadeAnimation({ elemToFadeOut, byScroll }) {
		const options = { paused: true }
		const tl = gsap.timeline(options);
		tl.set(elemToFadeOut, {opacity: 1})
		tl.to(elemToFadeOut, { opacity: 0, duration: byScroll, ease: Power1.easeOut })
		return tl
	}
}

/**
 * Custom video player class.
 * 
 * Each video comes with a play/pause button (glyph) and a cta that covers the video element.
 * 
 * Behavior is simple: 1 click to start the video, 1 click to pause. When the video ends it resets.
 * 
 */
class VideoPlayer {

	/**
	 * @constructor
	 * @param {Object} elem - the <video> element on which the player behavior will hang
	 */
	constructor(elem) {
		// bind
		this.ctaClicked = this.ctaClicked.bind(this)
		this.onEnded = this.onEnded.bind(this)
		this.onPause = this.onPause.bind(this)
		this.onPlay = this.onPlay.bind(this)
		this.onCanPlayThrough = this.onCanPlayThrough.bind(this)
		this.onShouldPause = this.onShouldPause.bind(this)

		// set
		this.isPlaying = false
		this.canplaythrough = false
		this.isFirstPlay = true
		this.videoElem = elem
		this.container = this.videoElem.parentElement
		this.cta = this.container.querySelector('a')
		this.glyphElem = this.cta.querySelector('.glyphicon')
		const options = { anchorElem: this.cta, videoElem: this.videoElem, glyphElem: this.glyphElem }
		this.clickAnimTimeline = Animations.videoClicked(options)

		// do
		window.addEventListener('MIKE_VIDEO_PLAYER:SHOULD:PAUSE', this.onShouldPause)
		this.cta.addEventListener('click', this.ctaClicked)
		this.videoElem.addEventListener('ended', this.onEnded)
		this.videoElem.addEventListener('pause', this.onPause)
		this.videoElem.addEventListener('play', this.onPlay)
		this.videoElem.addEventListener('playing', this.onPlay)
		this.videoElem.addEventListener('canplaythrough', this.onCanPlayThrough)
		this.loadVideo()
	}

	// load all the visual elements on the page first, then I can load mp4s
	loadVideo() {
		this.videoElem.setAttribute('src', this.videoElem.dataset.src)
	}

	ctaClicked(evt) {
		evt.preventDefault()

		if(this.isFirstPlay) {
			this.isFirstPlay = false
			ga('send', 'event', 'video', 'play', 'first time')
		}

		if(this.isPlaying) {
			this.glyphElem.classList.remove('glyphicon-play')
			this.glyphElem.classList.add('glyphicon-pause')
			this.clickAnimTimeline.restart()
			this.clickAnimTimeline.play()
			this.videoElem.pause()
			ga('send', 'event', 'video', 'pause', 'after play')
		} else {
			this.glyphElem.classList.remove('glyphicon-pause')
			this.glyphElem.classList.add('glyphicon-play')
			this.clickAnimTimeline.restart()
			this.clickAnimTimeline.play()
			this.videoElem.play()
			this.triggerPause() // trigger a pause event to other videos that may be playing
			ga('send', 'event', 'video', 'play', 'after pause')
		}
	}

	triggerPause() {
		const event = new CustomEvent('MIKE_VIDEO_PLAYER:SHOULD:PAUSE', { detail: this.cta })
		window.dispatchEvent(event);
	}

	onEnded(evt) {
		this.resetState()
		ga('send', 'event', 'video', 'ended')
	}

	onPause(evt) {
		this.isPlaying = false
	}

	onPlay(evt) {
		this.isPlaying = true
	}

	onCanPlayThrough(evt) {
		this.canplaythrough = true
	}
	
	onShouldPause(evt) {
		if(evt.detail === this.cta) {
			return
		}
		this.videoElem.pause()
	}

	resetState() {
		this.isPlaying = false
		this.isFirstPlay = true;
        this.glyphElem.classList.remove('glyphicon-pause')
		this.glyphElem.classList.add('glyphicon-play')
        TweenLite.to(this.glyphElem, 1, { opacity: 0.7, fontSize: 94, ease: Power1.easeInOut })
    };

}

/**
 * Setup a singleton to watch page scroll, update everyone else via a plugin system
 */
const ScrollSystem = (function() {
	// set
	let y = window.scrollY
	let pageHeight = document.documentElement.offsetHeight
	let pageScrollPercent = gsap.utils.normalize(0, pageHeight, y)
	let plugins = {}
	

	// do
	window.addEventListener('scroll', onUpdate, { passive: true }) 

	// methods
	function onUpdate(evt) {
		y =  window.pageYOffset
		pageScrollPercent = gsap.utils.normalize(0,pageHeight,y)
		for (const pluginName in plugins) {
			plugins[pluginName]({ scrollValue: y, scrollPercent: pageScrollPercent })
		}
	}

	// public
	return {
		listen({ name, exec }) {
			plugins[name] = exec
		},
		getPageHeight() {
			return pageHeight
		},
		getPageScroll() {
			return y
		},
		getPageScrollPercent() {
			return pageScrollPercent
		}
	}
})()

/**
 * A small page manager to handle some UI elements:
 * 
 * 1. welcome animation once the page is ready
 * 2. hide/show a scroll prompt
 * 3. personalize the page for companies I'm interviewing with. Otherwise, show a defaul message.
 */
class Page {
	constructor() {
		// bind
		this.pageLoaded = this.pageLoaded.bind(this)
		this.scrollFadePrompt = this.scrollFadePrompt.bind(this)
		
		// set
		this.genericGreetings = [
			`I'm glad you're here`, 
			'Glad you made it!', 
			'🙌',
		]
		this.currentInterviews = [
			'Netflix',
			'GitHub',
			'Twilio'
		]
		this.documentElement = document.documentElement
		this.pageWidth = this.documentElement.offsetWidth
		this.pageHeight = ScrollSystem.getPageHeight()
		this.header = this.documentElement.querySelector('header')
		this.sentimentElem = this.header.querySelector('.sentiment')
		this.clientElem = this.header.querySelector('.client')
        this.downPromptElem = this.documentElement.querySelector('.downPrompt')
		this.downPromptTL = this.createScrollAnimation()
		this.downPromptElemTween = new TweenMax(this.downPromptElem, { opacity: 0, duration: 1, ease: Power1.easeIn })
        this.downPromptPElem = this.downPromptElem.querySelector('.downPrompt p')
        this.downPromptGElem = this.downPromptElem.querySelector('.downPrompt .glyphicon')
		this.clientName = (window.location.search.indexOf('client') > -1) ? this.getClientName() : this.genericGreetings[Helpers.randomIndex(this.genericGreetings.length)]
		this.videoElems = [...this.documentElement.querySelectorAll('video')].filter(v => !v.hasAttribute('autoplay'))
		this.videoElems.map(video => new VideoPlayer(video))
		
		// do
		document.addEventListener('DOMContentLoaded', this.pageLoaded)
		ScrollSystem.listen({ name: 'prompt', exec: this.scrollFadePrompt }) // register for scroll events
		
	}

	/**
	 * I send custom links to companies I'm currently interviewing with, it will include the company name in the hero
	 * 
	 * @returns {String} - client Name
	 */
	getClientName() {
		const idx = window.location.search?.split('&').filter(item => item.indexOf('client'))?.map(item => item.split('='))?.pop()?.pop()

		if(!idx) {
			return this.genericGreetings[Helpers.randomIndex(this.genericGreetings.length)]
		}

		return this.currentInterviews[idx]
	}

	pageLoaded(evt) {
		const options = {
			sentimentElem: this.sentimentElem,
			clientElem: this.clientElem,
			clientName: this.clientName,
			downPromptElem: this.downPromptElem,
			downPromptGElem: this.downPromptGElem,
			downPromptPElem: this.downPromptPElem
		}
		Animations.welcome(options)
	}

	createScrollAnimation() {
		const viewportHeight = window.innerHeight
		const firstElemY = this.documentElement.querySelector('#apple').offsetTop
		const diff = Math.abs(firstElemY - viewportHeight)
		const options = { elemToFadeOut: this.downPromptElem, byScroll: diff }
		return Animations.scrollFadeAnimation(options)
	}

	scrollFadePrompt({ scrollValue }) {
		this.downPromptTL.time(scrollValue)
	}
}


const page = new Page()

})()




