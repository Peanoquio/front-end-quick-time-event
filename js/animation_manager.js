////////////////////////////////////////////////////////////////////////////////////////
/**
 * This is the JavaScript AnimationMgr class to handle custom animations
 * This is the old animation manager.  I'm currently working on another one that can do more.
 * @author: Oliver Chong
 * @version 0.1
 */
////////////////////////////////////////////////////////////////////////////////////////


//added by Oliver Chong - November 3, 2013
/**
 * This is the constructor of the animtion manager
 *
 * @class AnimationMgr
 * @constructor AnimationMgr
 */
function AnimationMgr()
{
};

//this flag determines if the animation is ran in chronological or reverse order
//AnimationMgr.prototype.m_bReverseFlag = false;

//this will contain the sprite object data
AnimationMgr.prototype.m_aoSpriteObjs = [];
//this wil contain the sprite animation interval objects
AnimationMgr.prototype.m_aIntervalObjs = [];


//added by Oliver Chong - November 3, 2013
/**
 * This creates the sprite object
 *
 * @method CreateSprite
 * @param {object} spriteObj : the sprite object
 * @param {string} parentElementName : the parent DOM element name that will contain the Sprite DOM element
 */
AnimationMgr.prototype.CreateSprite = function( spriteObj, parentElementName )
{
	this.m_aoSpriteObjs[ spriteObj.m_sSpriteId ] = spriteObj;
	
	//console.log( this.m_aoSpriteObjs );
	
	//this will generate the DOM element that will visually represent the sprite
	//the sprite container element
	var spriteContainerEl = document.createElement( 'div' );
	spriteContainerEl.setAttribute( 'id', spriteObj.m_sSpriteId );
	
	var styleVal = 'position:absolute;'
	styleVal += ' z-index:'+spriteObj.m_nZIndex+'; ';
	styleVal += ' top:'+spriteObj.m_nTopPos+'px; left:'+spriteObj.m_nLeftPos+'px; ';
	styleVal += ' width:'+spriteObj.m_nSpriteImgCropWidth+'px; height:'+spriteObj.m_nSpriteImgCropHeight+'px; ';
	styleVal += ' overflow:hidden;';	
	
	spriteContainerEl.setAttribute( 'style', styleVal );
	
	//the sprite image element
	var spriteImgEl = document.createElement( 'img' );
	spriteImgEl.setAttribute( 'id', spriteObj.m_sSpriteId + '_img' );
	
	var imgStyleVal = 'position:relative; ';
	imgStyleVal += 'top:0px; left:0px; ';
	imgStyleVal += 'width:'+spriteObj.m_nSpriteImgWidth+'px; height:'+spriteObj.m_nSpriteImgHeight+'px;';
	
	spriteImgEl.setAttribute( 'style', imgStyleVal );
	spriteImgEl.setAttribute( 'src', spriteObj.m_sSpriteImgPath );
	
	//create the DOM hierarchy structure for the sprite
	spriteContainerEl.appendChild( spriteImgEl );
	
	var parentEl = document.getElementById( parentElementName );
	parentEl.appendChild( spriteContainerEl );
};


//added by Oliver Chong - November 3, 2013
/**
 * This removes the sprite object
 *
 * @method RemoveSprite
 * @param {string} spriteId : the sprite id
 */
AnimationMgr.prototype.RemoveSprite = function( spriteId )
{
	//console.log( "RemoveSprite : " );
	//console.log( this.m_aoSpriteObjs[ spriteId ] ); 
	//console.log( this.m_aIntervalObjs[ spriteId ] ); 

	delete this.m_aoSpriteObjs[ spriteId ];
	
	delete this.m_aIntervalObjs[ spriteId ];
	
	//remove the sprite DOM element
	$( '#'+spriteId ).remove();
};


//added by Oliver Chong - November 3, 2013
/**
 * This will animate the sprite
 *
 * @method AnimateSprite
 * @param {string} spriteId : the sprite id
 * @param {unsigned} animationSpeed : the animation speed
 * @param {unsigned} frameNumCallbackTrigger : the frame number as to when to execute the callback function
 * @param {function} callbackFunc : the callback function that will execute
 * @param {unsigned} loopCount : the number of times the animation will loop
 * @param {boolean} reverseAnimationFlag : if true, each animation sequence will switch between reverse and normal order when traversing through the frames
 */
AnimationMgr.prototype.AnimateSprite = function( spriteId, animationSpeed, frameNumCallbackTrigger, callbackFunc, 
	loopCount, reverseAnimationFlag, destroySpriteAtEnd )
{
	animationSpeed = defaultValue( animationSpeed, 1000 );
	
	loopCount = defaultValue( loopCount, 1 );
	reverseAnimationFlag = defaultValue( reverseAnimationFlag, false );
	destroySpriteAtEnd = defaultValue( destroySpriteAtEnd, true );
	
	callbackFunc = defaultValue( callbackFunc, function(){} );
	
	var spriteObj = this.m_aoSpriteObjs[ spriteId ];
	frameNumCallbackTrigger = defaultValue( frameNumCallbackTrigger, spriteObj.m_nFrameCount );
	
	var that = this;

	//sprite animation loop
	var animIntervalID = window.setInterval( function() {
		that.RunSpriteAnimation( spriteId, frameNumCallbackTrigger, callbackFunc, loopCount, reverseAnimationFlag, destroySpriteAtEnd );
	}, animationSpeed );
	
	//window.addInterval( animIntervalID, "app_main" );
	
	//store the interval object that will keep on running the animation
	this.m_aIntervalObjs[ spriteId ] = animIntervalID;
};


//added by Oliver Chong - November 3, 2013
/**
 * This stops the sprite animation
 *
 * @method StopSpriteAnimation
 * @param {string} spriteId : the sprite id
 */
AnimationMgr.prototype.StopSpriteAnimation = function( spriteId )
{
	//console.log( "StopSpriteAnimation : " + this.m_aIntervalObjs[ spriteId ] );
	window.clearInterval( this.m_aIntervalObjs[ spriteId ] );
};


//added by Oliver Chong - November 3, 2013
/**
 * This runs the sprite animation
 *
 * @method RunSpriteAnimation
 * @param {string} spriteId : the sprite id
 * @param {unsigned} frameNumCallbackTrigger : the frame number as to when to execute the callback function 
 * @param {function} callbackFunc : the callback function that will execute
 * @param {unsigned} loopCount : the number of times the animation will loop
 * @param {boolean} reverseAnimationFlag : if true, each animation sequence will switch between reverse and normal order when traversing through the frames
 */
AnimationMgr.prototype.RunSpriteAnimation = function( spriteId, frameNumCallbackTrigger, callbackFunc, 
	loopCount, reverseAnimationFlag, destroySpriteAtEnd )
{
	var spriteObj = this.m_aoSpriteObjs[ spriteId ];
	
	if ( typeof( spriteObj ) !== 'undefined' && spriteObj !== null )
	{
		var spriteId = spriteObj.m_sSpriteId;	
		var spriteImgId = spriteId + '_img';
		var spriteOrientation = spriteObj.m_bVerticalScroll ? 'top' : 'left';
		var spriteImgLength = spriteObj.m_bVerticalScroll ? spriteObj.m_nSpriteImgHeight : spriteObj.m_nSpriteImgWidth;
		
		//get the position of the current frame
		var currFrameStartPos = Math.abs( parseInt( $('#'+spriteImgId).css( spriteOrientation ) ) );
		
		//compute the offset that will be used to traverse the frames
		var offset = spriteImgLength / spriteObj.m_nFrameCount;
		var newFramePos = 0;
		if ( spriteObj.m_bReverseFlag )
		{
			//console.log( "reverse!!! currFrameStartPos : " + currFrameStartPos );
			newFramePos = currFrameStartPos - offset;
		}
		else
		{
			newFramePos = currFrameStartPos + offset;
		}	
		
		//if the last frame has been reached
		if ( spriteObj.m_nFrameCount == spriteObj.m_nCurrFrame )
		{
			//reset the values
			newFramePos = 0;		
			spriteObj.m_nCurrFrame = 1;
		
			//keep track on the number of time the animation has looped
			++spriteObj.m_nAnimationLoopCounter;
				
			//flip the animation sequence order
			if ( reverseAnimationFlag )
			{			
				spriteObj.m_bReverseFlag = !spriteObj.m_bReverseFlag;
				
				if ( spriteObj.m_bReverseFlag )
				{
					//console.log( "reverse!!!" );			
					newFramePos = spriteImgLength - offset;
				}
			}
		}	
		else
		{
			//keep track of the current frame number
			++spriteObj.m_nCurrFrame;
		}
		
		newFramePos *= -1;
		
		//console.log( "spriteObj.m_nCurrFrame : " + spriteObj.m_nCurrFrame );
		//console.log( "newFramePos : "  + newFramePos );

		//traverse through the specific frame in the image
		$('#'+spriteImgId).css( spriteOrientation, newFramePos + 'px');	
		
		//this will keep track of the total number of frames that has elapsed
		++spriteObj.m_nFrameCounter;
		
		//trigger the callback function based on the specified frame number
		if ( spriteObj.m_nFrameCounter == frameNumCallbackTrigger )
		{
			callbackFunc.call();
		}
		
		//stop the animation from looping
		if ( spriteObj.m_nAnimationLoopCounter >= loopCount )
		{
			this.StopSpriteAnimation( spriteId );
			
			if ( destroySpriteAtEnd )
			{
				this.RemoveSprite( spriteId );
			}
		}
	}
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//added by Oliver Chong - November 3, 2013
/**
 * This is the constructor of the Sprite object class
 *
 * @class SpriteObj
 * @constructor SpriteObj
 * @param {string} sSpriteId : the sprite id
 * @param {string} sSpriteImgPath : the image path of the sprite
 * @param {unsigned} nSpriteImgWidth : the total width of the image
 * @param {unsigned} nSpriteImgHeight : the total height of the image
 * @param {unsigned} nSpriteImgCropWidth : the width of the visible crop area of the image
 * @param {unsigned} nSpriteImgCropHeight : the height of the visible crop area of the image
 * @param {integer} nTopPos : the top position
 * @param {integer} nLeftPos : the left position
 * @param {boolean} bVerticalScroll : if true, the sprite will be traversed in a vertical orientation per frame
 * @param {unsigned} nFrameCount : the number of frame for this sprite
 * @param {unsigned} nZIndex : the z-index layering of the sprite
 */
var SpriteObj = function( sSpriteId, sSpriteImgPath, 
	nSpriteImgWidth, nSpriteImgHeight, nSpriteImgCropWidth, nSpriteImgCropHeight,
	nTopPos, nLeftPos, bVerticalScroll, nFrameCount, nZIndex )
{
	nZIndex = defaultValue( nZIndex, 50 );

	this.m_sSpriteId = sSpriteId;

	this.m_sSpriteImgPath = sSpriteImgPath;
	this.m_nSpriteImgWidth = nSpriteImgWidth;
	this.m_nSpriteImgHeight = nSpriteImgHeight;
	this.m_nSpriteImgCropWidth = nSpriteImgCropWidth;
	this.m_nSpriteImgCropHeight = nSpriteImgCropHeight;
	
	this.m_nTopPos = nTopPos;
	this.m_nLeftPos = nLeftPos;
	
	this.m_nZIndex = nZIndex;

	this.m_bVerticalScroll = bVerticalScroll;
	this.m_nFrameCount = nFrameCount;
	
	//the current frame number
	this.m_nCurrFrame = 1;
	//the total number of frames that had elapsed
	this.m_nFrameCounter = 0;
	//the number of times the full animation sequence has looped for this sprite	
	this.m_nAnimationLoopCounter = 0;
	
	//this flag determines if the animation is ran in chronological or reverse order
	this.m_bReverseFlag = false;
};