//added by Oliver Chong - February 15, 2015
/**
 * This is the class that will manage the common game-related UI effects
 *
 * @class UiEffect
 * @constructor UiEffect
 */
function UiEffect()
{
};


//the sprite animation manager
UiEffect.m_cAnimMgr = new AnimationMgr();


//added by Oliver Chong - February 15, 2015
/**
 * Animates the fade in/out effect
 *
 * @method FadeInOutEffect
 * @param {string} sCoverElementId : the element id of the semi-transparent black DIV layer
 * @param {string} sElementId : the element id of the image
 * @param {function} fCallback : the callback function
 */
UiEffect.ShowTransition = function( sCoverElementId, sElementId, fCallback )
{
	fCallback = ( typeof( fCallback ) !== "function" ) ? function(){} : fCallback;

	var cElement = $( "#" + sElementId );
		
	//the cover element that is semi-transparent black
	var cCoverElement = $( "#"+sCoverElementId );
	cCoverElement.children().hide();
	
	cCoverElement.stop().fadeIn( 700, function() {
		//this will do the stamp effect
		cElement.show( "puff", {}, 300, function() {
			cCoverElement.delay( 1000 ).fadeOut( 1000, fCallback );
		} );
	} );
};


//added by Oliver Chong - February 15, 2015
/**
 * Animates the fade in/out effect
 *
 * @method FadeInOutEffect
 * @param {string} sElementId : the element id of the image
 */
UiEffect.FadeInOutEffect = function( sElementId )
{
	var cElement = $( "#" + sElementId );
	
	function fadeInOut () 
	{
		cElement.stop().show().animate( {  
			opacity : 1.0
		}, 1500, "linear", function() {	
			cElement.stop().animate( {  
				opacity : 0.25
			}, 1500, "linear", function() {
				setTimeout( fadeInOut, 1000 );
			} );
		} );
	}

    fadeInOut();
};


//added by Oliver Chong - February 13, 2015
/**
 * This runs the sprite animation
 *
 * @method RunSpriteAnimation
 * @param {string} sSpriteId : the sprite id
 * @param {string} sParentDivIdentifier : the identifier of the parent DIV element that will contain this sprite
 * @param {integer} nTopPos : the top position
 * @param {integer} nLeftPos : the left position
 * @param {string} sImgURL : the URL of the image
 * @param {unsigned} nSpriteWidth : the sprite image width
 * @param {unsigned} nSpriteHeight : the sprite image height
 * @param {unsigned} nFrameCnt : the number of frames in the sprite sheet
 * @param {function} fCallback : the callback function
 */
UiEffect.RunSpriteAnimation = function( sSpriteId, sParentDivIdentifier, nTopPos, nLeftPos, sImgURL, nSpriteWidth, nSpriteHeight, nFrameCnt, fCallback )
{
	var localAnimationSpeed = 100;
	var nAnimationLoopCnt = 1;

	var nSpriteCropWidth = nSpriteWidth;
	var nSpriteCropHeight = nSpriteHeight / nFrameCnt;
	
	// create the sprite animation	
	var slashSprite = new SpriteObj( sSpriteId, sImgURL, nSpriteWidth, nSpriteHeight, 
		nSpriteCropWidth, nSpriteCropHeight, nTopPos, nLeftPos, true, nFrameCnt );

	UiEffect.m_cAnimMgr.CreateSprite( slashSprite, sParentDivIdentifier );

	UiEffect.m_cAnimMgr.AnimateSprite( sSpriteId, localAnimationSpeed, null, fCallback, nAnimationLoopCnt, true, true );
};


//added by Oliver Chong - April 27, 2014
/**
 * This marks the recently defeated boss general with the shake effect
 *
 * @method Shake
 * @param {string} sDivIdentifier : the identifier of the DIV tag element to shake
 * @param {unsigned} shakeDistance : this determines how far the shake will go
 */
UiEffect.Shake = function( sDivIdentifier, shakeDistance )
{
	var delayVal = 500;
	var shakeSpeed = 500;

	//use jQuery UI
	// most effect types need no options passed by default
	var options = { percent: 500 };
	var shakeOptions = { times: 4, distance: shakeDistance };
	
	var that = this;
	
	$( "#"+sDivIdentifier ).delay( delayVal ).effect( "shake", shakeOptions, shakeSpeed, function(){
		//do something
	} );
};


//added by Oliver Chong - April 27, 2014
/**
 * This animates the bar
 *
 * @method AnimateBar
 * @param {string} sDivIdentifier : the identifier of the DIV tag element
 * @param {unsigned} nNewVal : the new value of the bar
 * @param {unsigned} nFullVal : the maximum value of the bar
 */
UiEffect.AnimateBar = function( sDivIdentifier, nNewVal, nFullVal, sColor )
{
	var localAnimationSpeed = 750;
	var delayVal = 200;
	
	var nHpRatio = Math.round( ( nNewVal / nFullVal ) * 100 );
	
	$( "#"+sDivIdentifier ).delay( delayVal ).animate( { 
		width: nHpRatio + "%",
		backgroundColor: sColor
	}, localAnimationSpeed );
};


//added by Oliver Chong - February 15, 2015
/**
 * Interpolate the color based on the percentage value
 *
 * @method InterpolateColor
 * @param {float} nPctVal : the percent value out of 100%
 * @param {float} nGreenToRedRatio : the float (normalized 0-1) that contains the green to red ratio that will serve as the weight (degree of greeness/redness)
 */
UiEffect.InterpolateColor = function( nPctVal, nGreenToRedRatio )
{
	//compute the weight of the color
	var nRedToGreenRatio = 1 - nGreenToRedRatio;
	if ( nRedToGreenRatio < 0 )
	{
		nRedToGreenRatio = 0;
	}

	//interpolate the colors based on the value percentage
	
	//red color
	var nRed = ( ( 100 - nPctVal ) * 255 ) / 100;
	//add the weight
	nRed *= ( nRedToGreenRatio * 2 );
	if ( nRed > 255 )
	{
		nRed = 255;
	}
	else if ( nRed < 0 )
	{
		nRed = 0;
	}
	nRed = Math.round( nRed );

	//green color
	var nGreen = ( nPctVal * 255 ) / 100;
	//add the weight
	nGreen *= ( nGreenToRedRatio * 2 );
	if ( nGreen > 255 )
	{
		nGreen = 255;
	}
	else if ( nGreen < 0 )
	{
		nGreen = 0;
	}
	nGreen = Math.round( nGreen );

	//blue color
	var nBlue = 0;	

	return "rgb( "+nRed+", "+nGreen+", "+nBlue+" )";
};


//added by Oliver Chong - February 15, 2015
/**
 * This displays the bar based on the current and max value
 *
 * @method DisplayBar
 * @param {string} sParentElementId : the parent HTML element id that will contain the bar
 * @param {string} sElementId : the HTML element id for the bar
 * @param {integer} nTopPos : the top position
 * @param {integer} nLeftPos : the left position
 * @param {unsigned} nCurrVal : the current value
 * @param {unsigned} nMaxVal : the maximum value 
 * @param {unsigned} nWidth : the bar width
 * @param {unsigned} nHeight : the bar height
 * @param {float} nGreenToRedRatio : the float (normalized 0-1) that contains the green to red ratio that will serve as the weight (degree of greeness/redness)
 */
UiEffect.DisplayBar = function( sParentElementId, sElementId, nTopPos, nLeftPos, nCurrVal, nMaxVal, nWidth, nHeight, nGreenToRedRatio )
{
	nGreenToRedRatio = ( typeof( nGreenToRedRatio ) === "undefined" ) ? 0.5 : nGreenToRedRatio;
	
	//compute for the length of the bar
	var nBarLength = ( nCurrVal * nWidth ) / nMaxVal;
	nBarLength = Math.round( nBarLength, 2 );

	//check the value percentage
	var nPctVal = ( nCurrVal * 100 ) / nMaxVal;
	nPctVal = Math.round( nPctVal );

	//interpolate the colors based on the value percentage
	var sBarColor = UiEffect.InterpolateColor( nPctVal, nGreenToRedRatio );	
	
	var nBorderSize = 3;
	
	var sStyle = "opacity:0.5; filter: alpha(opacity=50); width:"+nWidth+"px; height:"+nHeight+"px;";	
	//sStyle += " position:absolute; top:"+nTopPos+"px; left:"+nLeftPos+"px;";
	sStyle += "border-style: solid; border-width:"+nBorderSize+"px; border-color: black; background-color: rgb( 100, 100, 100 );"

	//create the base of the bar
	var cBarBaseElem = document.createElement( "div" );
	cBarBaseElem.setAttribute( "id", "bar_base_" + sElementId );
	cBarBaseElem.setAttribute( "style", sStyle );
	
	sStyle = "width:"+nBarLength+"px; height:"+nHeight+"px;";	
	sStyle += " position:absolute; top:0px; left:0px;";
	sStyle += "border-style: solid; border-width:"+nBorderSize+"px; border-color: black; background-color: "+sBarColor+";"

	//create the bar
	var cBarElem = document.createElement( "div" );
	cBarElem.setAttribute( "id", sElementId );
	cBarElem.setAttribute( "style", sStyle );
	
	sStyle = "width:"+nBarLength+"px; height:"+nHeight+"px;";	
	sStyle += " position:absolute; top:"+nTopPos+"px; left:"+nLeftPos+"px;";
	
	//create the main bar container
	var cBarMainElem = document.createElement( "div" );
	cBarMainElem.setAttribute( "id", "bar_main_" + sElementId );
	cBarMainElem.setAttribute( "style", sStyle );	

	cBarMainElem.appendChild( cBarBaseElem );
	cBarMainElem.appendChild( cBarElem );

	//attach to the parent
	var cParentElem = document.getElementById( sParentElementId );
	cParentElem.appendChild( cBarMainElem );
};


//added by Oliver Chong - February 15, 2015
/**
 * Prints out a glowing text
 *
 * @method PrintGlowingText
 * @param {string} sParentElementId : the parent HTML element id that will contain the bar
 * @param {string} sElementId : the HTML element id for the bar
 * @param {integer} nTopPos : the top position
 * @param {integer} nLeftPos : the left position
 * @param {string} sWidth : the width in CSS string format (px, %, inherit)
 * @param {unsigned} nFontSize : the font size
 * @param {string} nFontColor : the font color
 * @param {unsigned} nGlowSize : the glow size
 * @param {string} sGlowColor : the glow color
 * @param {string} sText : the text to show
 * @param {boolean} bShow : if true, show the text
 * @param {boolean} bSupportIE : if true, add support for old IE browsers
 */
UiEffect.PrintGlowingText = function( sParentElementId, sElementId, nTopPos, nLeftPos, sWidth, nFontSize, nFontColor, nGlowSize, sGlowColor, sText, bShow, bSupportIE )
{
	bShow = typeof( bShow ) === "undefined" ? true : bShow;
	bSupportIE = typeof( bSupportIE ) === "undefined" ? false : bSupportIE;

	var sStyle = "position: absolute; top: " + nTopPos + "px; left: " + nLeftPos + "px; width: " + sWidth + "; ";
	sStyle +=  "color: " + nFontColor + "; font-size: " + nFontSize + "px; font-weight: bold; font-family: Arial; text-align: center; "
	if ( bShow )
	{	
		sStyle += "display: block;";
	}
	else
	{
		sStyle += "display: none;";
	}
	
	//reference: http://www.useragentman.com/blog/2011/04/14/css3-text-shadow-can-it-be-done-in-ie-without-javascript/
	if ( bSupportIE )
	{
		//for IE support
		sStyle += "background-color: #cccccc; ";
		sStyle += "filter: progid:DXImageTransform.Microsoft.Chroma(Color=#cccccc) ";
		sStyle += "progid:DXImageTransform.Microsoft.Glow(Strength=5, Color=" + sGlowColor + "); ";
	}
	else
	{
		sStyle += "text-shadow: 0px -1px " + nGlowSize + "px " + sGlowColor + ", "; // north
		sStyle += "0px  1px " + nGlowSize + "px " + sGlowColor + ", "; // south
		sStyle += "	-1px  0px " + nGlowSize + "px " + sGlowColor + ", "; //west
		sStyle += "	 1px  0px " + nGlowSize + "px " + sGlowColor + ", "; //east
		sStyle += "	-1px -1px " + nGlowSize + "px " + sGlowColor + ", "; //north-west
		sStyle += "	-1px  1px " + nGlowSize + "px " + sGlowColor + ", "; //north-east
		sStyle += "	 1px -1px " + nGlowSize + "px " + sGlowColor + ", "; //south-west
		sStyle += "	 1px  1px " + nGlowSize + "px " + sGlowColor + "; "; //south-east
	}
	
	//create the text container
	var cTextElem = document.createElement( "div" );
	cTextElem.setAttribute( "id", sElementId );
	cTextElem.setAttribute( "style", sStyle );
	cTextElem.innerHTML = sText;
	
	//attach to the parent
	var cParentElem = document.getElementById( sParentElementId );
	cParentElem.appendChild( cTextElem );
	
	return cTextElem;
};


//added by Oliver Chong - February 15, 2015
/**
 * Prints out the number image
 *
 * @method PrintNumberImage
 * @param {string} sParentElementId : the parent HTML element id that will contain the number images
 * @param {unsigned} nNumVal : the number value
 */
UiEffect.PrintNumberImage = function( sParentElementId, nNumVal )
{
	var cParentElem = document.getElementById( sParentElementId );	
	cParentElem.innerHTML = "";
	
	var aNumDigits = [];
	
	//while there are still digits in the number value
	while ( nNumVal )
	{
		//get the last digit
		var nLastDigit = nNumVal % 10;
		
		aNumDigits.push( nLastDigit ); 			
		
		//remove the last digit
		nNumVal = Math.floor( nNumVal / 10 )	
	}//end loop
	
	aNumDigits.reverse();
	
	//print out the number images
	for ( var i = 0, len = aNumDigits.length; i < len; ++i )
	{
		//attach to the parent
		var cImgElem = document.createElement( "img" );
		cImgElem.setAttribute( "style", "position: relative;" );
		cImgElem.src = "images/combo_num" + aNumDigits[ i ] + ".png";	
		cParentElem.appendChild( cImgElem );
	}
};