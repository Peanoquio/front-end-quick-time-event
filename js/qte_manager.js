/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//the types of effects
var QteEffectsType = {
	"NONE" : 0,
	"SLASH" : 1,
	"BLOCK" : 2,
	"COUNT" : 2
};


//the hotspot colors based on the status
var QteHotspotColor = {
	"DEFAULT" : "#FFFFFF",
	"SUCCESS" : "#00FF00",
	"FAIL" : "#FF0000",
	"HINT" : "#FFFF00"
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//JavaScript does not support interfaces/pure virtual class so I am just toying with this idea

//the DrawEffect interface function should handle rendering the quick-time event effect
//the RemoveEffect interface function should handle removing the quick-time event effect
//the VerifyEffect interface function should handle if the quick-time event effect was successfully completed when the player interacts with it
//the AddEffectInteraction function should handle the user interaction with the quick-time event effect (example: mouse click, mouse enter, etc.)
var QteEffectInterface = new Interface( "QteEffectInterface", [ "DrawEffect", "RemoveEffect", "VerifyEffect", "AddEffectInteraction" ] );


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//added by Oliver Chong - January 22, 2015
/**
 * The constructor for the quick-time event manager
 *
 * @class QteMgr
 * @constructor QteMgr
 * @param {array} aSeqList : the sequence of hotspots for each effect (not all effects will use this)
 * @param {string} sParentElemId : the id of the parent HTML element that will contain the hotspot
 * @param {unsigned} nAreaWidth : the width of the area that the quick-time event will cover
 * @param {unsigned} nAreaHeight : the height of the area that the quick-time event will cover
 * @param {unsigned} nEffectThreshold : the threshold range before changing to another effect
 * @param {boolean} bEnableTimer : if true, enable the timer for each quick-time event effect
 * @param {object} cQteClearCallbackContext : the context of the callback function
 * @param {function} fQteClearCallback : the callback function to execute once the quick-time event threshold has been reached
 * @param {object} aQteEffectSuccesCallback : arry object of game specific callback functions that will be invoked when the quick-time event effect has been executed properly
 */
function QteMgr( aSeqList, sParentElemId, nAreaWidth, nAreaHeight, nEffectThreshold, sTimerElemId /*, cQteClearCallbackContext, fQteClearCallback,*/ /*aQteEffectSuccessCallback*/ )
{
	var that = this;	

	//this will manage running certain codes at the specified interval
	this.m_nInterval = null;
	this.m_nIntervalSecs = 1000;
	
	//if true, enable the timer for each quick-time event effect
	this.m_sTimerElemId = sTimerElemId;
	//the counter down timer max limit
	this.m_nTimerCountdownLimit = QteMgr.MAX_TIMER_VAL;
	
	////the id of the HTML parent element that will contain the quick time event effects
	this.m_sParentElemId = sParentElemId;
	
	//the sequence of hotspots for each effect (not all effects will use this)
	this.m_aSeqList = aSeqList;
	
	//initialize the quick time event effects
	this.m_aEffects = {};	
	
	this.m_aEffects[ QteEffectsType.SLASH ] = new QteSlashEffect( sParentElemId, nAreaWidth, nAreaHeight, this.m_aSeqList, 16, 6, 2.25 /*, aQteEffectSuccessCallback[ QteEffectsType.SLASH ]*/ );		

	this.m_aEffects[ QteEffectsType.BLOCK ] = new QteBlockEffect( sParentElemId, nAreaWidth, nAreaHeight /*, aQteEffectSuccessCallback[ QteEffectsType.BLOCK ]*/ );
	
	//the threshold range before changing to another effect
	this.m_nEffectThreshold = nEffectThreshold;
	//the current threshold value
	this.m_nCurrEffectThreshold = 0;
	
	//the current active effect
	this.m_nCurrEffect = QteEffectsType.NONE;
	
	//add the event listener for effects
	this.AddEventListener( /*cQteClearCallbackContext, fQteClearCallback*/ );
};


//the custom event once a quick-time event has been cleared
QteMgr.EVT_QTE_CLEAR = "qte_cleared";

//the counter down timer max limit
QteMgr.MAX_TIMER_VAL = 12;


//added by Oliver Chong - February 25, 2015
/**
 * Run the miscellaneous effect stuff at intervals
 *
 * @method RunEffectInterval
 */
QteMgr.prototype.RunEffectInterval = function()
{	
	//run the effect hint
	this.m_aEffects[ this.m_nCurrEffect ].RunHotspotHint();
		
	if ( this.m_sTimerElemId )
	{
		var that = this;
		
		clearInterval( this.m_nInterval );		
		
		var cTimerElem = document.getElementById( this.m_sTimerElemId );
		
		//this will run the code at the specified interval
		this.m_nInterval = setInterval( function() { 				
				
				//run the timer
				that.HandleTimer( cTimerElem );			
			
			}, this.m_nIntervalSecs );
	}
};


//added by Oliver Chong - February 25, 2015
/**
 * Handles the countdown timer
 *
 * @method HandleTimer
 * @param {object} cTimerElem : the DIV element of the countdown timer
 */
QteMgr.prototype.HandleTimer = function( cTimerElem )
{	
	if ( this.m_sTimerElemId )
	{
		if ( this.m_nTimerCountdownLimit == 0 )
		{
			//reset the countdown timer
			this.m_nTimerCountdownLimit = QteMgr.MAX_TIMER_VAL;
			
			//remove the current effect
			this.m_aEffects[ this.m_nCurrEffect ].RemoveEffect();	
			
			//draw the current effect
			this.DrawCurrEffect();
		}
		
		if ( cTimerElem )
		{
			cTimerElem.innerHTML = this.m_nTimerCountdownLimit;
		}
		
		//update the timer countdown
		var nFormattedTime = CommonUtil.FormatTime( this.m_nTimerCountdownLimit );		
		--this.m_nTimerCountdownLimit;
		this.m_nTimerCountdownLimit = Math.max( this.m_nTimerCountdownLimit, 0 );			
	}
};


//added by Oliver Chong - January 22, 2015
/**
 * Draw the current effect
 *
 * @method DrawCurrEffect
 */
QteMgr.prototype.DrawCurrEffect = function()
{
	this.m_aEffects[ this.m_nCurrEffect ].DrawEffect();	
	
	//run the miscellaneous effect stuff at intervals
	this.RunEffectInterval();
};


//added by Oliver Chong - February 15, 2015
/**
 * Randomizes the effect that will be set as the current one
 *
 * @method RandomizeEffect
 */
QteMgr.prototype.RandomizeEffect = function()
{
	//randomize the effect
	var nRolledVal = Math.floor( ( Math.random() * QteEffectsType.COUNT ) + 1 );
	
	//this is to prevent running the same effect consecutively
	if ( nRolledVal == this.m_nCurrEffect )
	{
		//if last effect
		if ( this.m_nCurrEffect == QteEffectsType.COUNT )
		{
			--this.m_nCurrEffect;
		}
		else
		{
			++this.m_nCurrEffect;
		}
	}
	//if different effect
	else
	{
		this.m_nCurrEffect = nRolledVal;
	}	
};


//added by Oliver Chong - February 15, 2015
/**
 * Add the event listener for the effects
 *
 * @method AddEventListener
 * @param {object} cQteClearCallbackContext : the context of the callback function
 * @param {function} fQteClearCallback : the callback function to execute once the quick-time event threshold has been reached
 */
QteMgr.prototype.AddEventListener = function( /*cQteClearCallbackContext, fQteClearCallback*/ )
{
	//create the event handlers
	EvtMgr.CreateEvent( QteMgr.EVT_QTE_CLEAR, { "success" : 0 } );		
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//added by Oliver Chong - January 22, 2015
/**
 * The constructor for the slash quick-time event
 *
 * @class QteSlashEffect
 * @constructor QteSlashEffect
 * @param {string} sParentElemId : the id of the parent HTML element that will contain the hotspot
 * @param {unsigned} nAreaWidth : the width of the area that the slash will cover
 * @param {unsigned} nAreaHeight : the height of the area that the slash will cover
 * @param {array} aSlashSeqList : the array containing the slash data
 * @param {unsigned} nHotspotRadius : the radius of the hotspot
 * @param {unsigned} nHotspotRadiusDeviation : the size deviation of the starting and ending hotspots
 * @param {float} nHotspotSpacingMultiplier : the multiplier that will determine the spacing hotspots
 * @param {function} fSuccessCallback : the callback function to execute once the quick-time event has been completed successfully
 */
function QteSlashEffect( sParentElemId, nAreaWidth, nAreaHeight, aSlashSeqList,
	nHotspotRadius, nHotspotRadiusDeviation, nHotspotSpacingMultiplier, fSuccessCallback )
{
	//check this class implements the interface
	Interface.EnsureImplements( this, QteEffectInterface );
	
	//the id of the HTML parent element that will contain the slash effect
	this.m_sParentElemId = sParentElemId;
	
	//the area from which the slash effect can appear
	this.m_nAreaWidth = nAreaWidth;
	this.m_nAreaHeight = nAreaHeight;
	
	//the sequence of slashes
	this.m_aSlashSeqList = aSlashSeqList;

	//the radius of the hotspot
	this.m_nHotspotRadius = nHotspotRadius;
	//the size deviation of the starting and ending hotspots
	this.m_nHotspotRadiusDeviation = nHotspotRadiusDeviation;
	//the multiplier that will determine the spacing hotspots
	this.m_nHotspotSpacingMultiplier = nHotspotSpacingMultiplier;
	
	//the list of hotspots within a slash
	this.m_aCurrHotspotList = [];
	//the list of hotspots that the player has successfully activated
	this.m_aActivatedHotspotSeq = [];
	
	//the current slash effect index
	this.m_nCurrSlashIndex = 0;
	
	//the callback function to execute once the quick-time event has been completed successfully
	this.m_fSuccessCallback = fSuccessCallback;
};


//added by Oliver Chong - January 22, 2015
/**
 * Determines the direction of the slash
 *
 * @method DetermineDirection
 * @param {integer} nStartX : the starting x coordinate
 * @param {integer} nStartY : the starting y coordinate
 */
QteSlashEffect.prototype.DetermineDirection = function( nStartX, nStartY )
{
	var cDirVec = null;	
	
	//get the 4 corners of the quick-time event area (relative position)
	var aCorners = [];
	aCorners.push( { "y" : 0, "x" : 0 } ); //TopLeft
	aCorners.push( { "y" : 0, "x" : this.m_nAreaWidth } ); //TopRight
	aCorners.push( { "y" : this.m_nAreaHeight, "x" : 0 } ); //BottomLeft
	aCorners.push( { "y" : this.m_nAreaHeight, "x" : this.m_nAreaWidth } ); //BottomRight
	
	//find the distance between the point and the corners 
	var nCornerIdxLong = null;
	var nCornerIdxShort = null;
	var nLongest = 0;
	//we are comparing the squared distance
	var nShortest = ( this.m_nAreaWidth * this.m_nAreaWidth );
	for ( var index = 0; index < aCorners.length; ++index )
	{
		var cCorner = aCorners[ index ];

		//get the vector from the point to the area corner
		cCorner.cVec = new Vector2D( ( cCorner.x - nStartX ), ( cCorner.y - nStartY ) );			
		//compute for the magnitude squared of the vector
		cCorner.nDistanceSq = cCorner.cVec.GetMagnitudeSquared()
		
		//find the corner index that has the longest and shortest distance from the point
		if ( cCorner.nDistanceSq > nLongest )
		{
			nLongest = cCorner.nDistanceSq;
			nCornerIdxLong = index;
		}
		if ( cCorner.nDistanceSq <= nShortest )
		{
			nShortest = cCorner.nDistanceSq;
			nCornerIdxShort = index;
		}
	}//end loop
	
	//compute for the angle
	var aConeArea = [];
	var cVecBase = null;
	for ( var index = 0; index < aCorners.length; ++index )
	{
		//ignore the shortest and longest vectors (from the point to the corner area)
		if ( index != nCornerIdxShort && index != nCornerIdxLong )
		{
			if ( cVecBase == null )
			{
				//get the first vector
				cVecBase = aCorners[ index ].cVec;
			}
			//if the first vector is already defined
			else
			{
				//get the angle between the vectors that will form the cone area
				var nAngle = MathUtil.RadiansToDegrees( cVecBase.GetAngleRadians( aCorners[ index ].cVec ) );
				
				//randomize to get the new angle value that should still be within the original angle range
				nAngle = Math.floor( ( Math.random() * nAngle ) + 1 );

				//determine if the rotation is clockwise or counter-clockwise (right-hand rule)
				var nCrossProd = cVecBase.CrossProductComponentZ( aCorners[ index ].cVec );
				
				//if clockwise, flip the angle value since the rotation is counter-clockwise by default
				nAngle = ( nCrossProd < 0 ) ? -nAngle : nAngle;

				//create the rotation matrix
				var cMtx = new Matrix();
				var cRotationMtx = cMtx.CreateRotationMatrix( nAngle );
				
				//apply the rotation to the base vector
				cDirVec = cMtx.Apply( cRotationMtx, cVecBase );
				
				//normalize the transformed vector
				cDirVec.Normalize();
			}		
		}
	}//end loop	
	
	return cDirVec;
};


//added by Oliver Chong - January 22, 2015
/**
 * Draws the slash effect
 *
 * @method DrawSlash
 * @param {unsigned} nSlashIndex : the index of the slash effect in the array
 */
QteSlashEffect.prototype.DrawSlash = function( nSlashIndex )
{
	nSlashIndex = typeof( nSlashIndex ) === "undefined" ? this.m_nCurrSlashIndex : nSlashIndex;

	var cSlashElem = document.createElement( "div" );
	cSlashElem.setAttribute( "id", "slash_"+nSlashIndex );
	cSlashElem.setAttribute( "style", "position: absolute; top: 0px; left: 0px; width: 100%; height: 100%;" );
	
	var aHotspotList = this.m_aSlashSeqList[ nSlashIndex ];	
	
	//reset the contents of the current hotspot list
	this.m_aCurrHotspotList = [];
	
	var nHotspotBorderSize = 6;
	
	//randomize the starting position
	var nPosX = Math.floor( Math.random() * this.m_nAreaWidth );
	var nPosY = Math.floor( Math.random() * this.m_nAreaHeight );
	
	//create the direction vector that will determine the direction of the slash
	var cDirVec = this.DetermineDirection( nPosX, nPosY );
	
	//get the angle between the default line link and the computed direction of the slash
	var cLineLinkVec = new Vector2D( 1, 0 );
	var nAngle = MathUtil.RadiansToDegrees( cLineLinkVec.GetAngleRadians( cDirVec ) );
	//determine if the rotation is clockwise or counter-clockwise (right-hand rule)
	var nCrossProd = cLineLinkVec.CrossProductComponentZ( cDirVec );	
	//if clockwise, flip the angle value since the rotation is counter-clockwise by default
	nAngle = ( nCrossProd < 0 ) ? -nAngle : nAngle;
	
	var nTopPos = 0;
	var nLeftPos = 0;	
	
	//go through the hotspots within the slash
	var nHotspotListLen = aHotspotList.length;
	for ( var index = 0; index < nHotspotListLen; ++index )
	{
		var sId = aHotspotList[ index ];
		
		var nPosOffset = 0;
		var nOrigSize = this.m_nHotspotRadius * 2;
		var nNewSize = 0;
		
		//for the first and last hotspots
		if ( index == 0 || index == ( nHotspotListLen - 1 ) )
		{
			bChangeSize = true;
			
			nNewSize =  ( this.m_nHotspotRadius + this.m_nHotspotRadiusDeviation ) * 2;
			nPosOffset = ( nNewSize - nOrigSize ) / 2;	
		}
		else
		{
			bChangeSize = false;
		}
		
		var nDiameter = bChangeSize ? nNewSize : nOrigSize;
		
		//this will position each hotspot based on the direction of the slash
		if ( index == 0 )
		{
			nLeftPos += nPosX;	
			nTopPos += nPosY;			
		}
		else
		{
			var nScale = ( this.m_nHotspotRadius * 2 ) * index * this.m_nHotspotSpacingMultiplier;
			
			nLeftPos = nPosX + cDirVec.m_x * nScale;
			nTopPos = nPosY + cDirVec.m_y * nScale;
		}
		
		nLeftPos -= nPosOffset;
		nTopPos -= nPosOffset;
		
		//compute for the position of the hotspot to center it around the arrow
		//take note that the initial value of the hotspot top and left position is 0 since we are using relative positioning
		var nHotspotTopPos = -( ( nDiameter / 2 ) + nHotspotBorderSize );
		var nHotspotLeftPos = -nDiameter;
		
		//store the data about the generated hotspots
		this.m_aCurrHotspotList.push( {
			"sId" : sId,
			"nArrowTopPos" : nTopPos,
			"nArrowLeftPos" : nLeftPos,
			"nHotspotOrigTop" : nHotspotTopPos,
			"nHotspotOrigLeft" : nHotspotLeftPos,
			"nOrigSize" : nDiameter,
			"bActive" : false
		} );
		
		var sRotationMtxIE = null;
		//for IE8 browser and below		
		if ( g_aBrowserInfo[ 0 ] == "MSIE" && g_aBrowserInfo[ 1 ] <= 8 )
		{
			//create the rotation matrix
			var cMtx = new Matrix();
			var cRotationMtx = cMtx.CreateRotationMatrix( nAngle );
			sRotationMtxIE = Matrix.ConvertToMatrixStrIEFilter( cRotationMtx );
		}
		
		//draw the arrow
		var cArrowElem = this.DrawArrow( cSlashElem, ("arrow_"+sId ), nAngle, nTopPos, nLeftPos, nDiameter, QteHotspotColor["DEFAULT"], sRotationMtxIE );
		
		//draw the hotpot hint (child of the arrow)
		var cHotspotHintElem = this.DrawHotspot( cArrowElem,  ("hint_"+sId ), nHotspotTopPos, nHotspotLeftPos, nDiameter, nHotspotBorderSize, QteHotspotColor["HINT"] );
		
		//draw the hotpot (child of the arrow)
		var cHotspotElem = this.DrawHotspot( cArrowElem, sId, nHotspotTopPos, nHotspotLeftPos, nDiameter, nHotspotBorderSize, QteHotspotColor["DEFAULT"] );		
		
	}//end loop	
	
	//attach the slash effect to the main parent HTML element
	var cMainParentElem = document.getElementById( this.m_sParentElemId );
	cMainParentElem.appendChild( cSlashElem );
	
	//add event handlers and effects
	this.AddEffectInteraction();	
};


//added by Oliver Chong - January 22, 2015
/**
 * Draws each hotspot within the slash effect
 *
 * @method DrawHotspot
 * @param {object} cParentElem : the parent HTML element that will contain the hotspot
 * @param {string} sId : the element id
 * @param {integer} nTopPos : the top position
 * @param {integer} nLeftPos : the left position
 * @param {unsigned} nDiameter : the diameter of the hotspot
 * @param {unsigned} nBorderSize : the border size of the hotspot
 * @param {string} sColor : the color
 * @return {object} : the generated hotspot HTML element
 */
QteSlashEffect.prototype.DrawHotspot = function( cParentElem, sId, nTopPos, nLeftPos, nDiameter, nBorderSize, sColor )
{
	var sStyle = "display:block; opacity:0.75; filter: alpha(opacity=75); width:"+nDiameter+"px; height:"+nDiameter+"px;";	
	sStyle += " position:absolute; top:"+nTopPos+"px; left:"+nLeftPos+"px;";
	sStyle += " border: " + nBorderSize + "px solid " + sColor + "; border-radius: " + ( nDiameter  ) + "px;";

	var cHotspotElem = document.createElement( "div" );
	cHotspotElem.setAttribute( "id", sId );
	cHotspotElem.setAttribute( "style", sStyle );
		
	cParentElem.appendChild( cHotspotElem );
	
	return cHotspotElem;
};


//added by Oliver Chong - February 2, 2015
/**
 * Draws each arrow within the slash effect
 *
 * @method DrawArrow
 * @param {object} cParentElem : the parent HTML element that will contain the arrow
 * @param {string} sId : the element id
 * @param {float} nAngle : the angle of rotation in degrees
 * @param {integer} nTopPos : the top position
 * @param {integer} nLeftPos : the left position
 * @param {unsigned} nHotspotDiameter : the diameter of the hotspot
 * @param {string} sColor : the color
 * @return {object} : the generated hotspot HTML element
 */
QteSlashEffect.prototype.DrawArrow = function( cParentElem, sId, nAngle, nTopPos, nLeftPos, nHotspotDiameter, sColor, sRotationMtxIE )
{
	//compute for the dimensions of the arrow
	var nHeight = nHotspotDiameter * 0.75 ;
	var nSidesLength = nHeight / 2;	

	var sStyle = "display:block; opacity:0.75; filter: alpha(opacity=75); width:0px; height:0px;";		
	sStyle += " border-top: "+nSidesLength+"px solid transparent; border-left: "+nHeight+"px solid "+sColor+"; border-bottom: "+nSidesLength+"px solid transparent;";
	sStyle += " -webkit-border-radius: 50%; border-radius: 50%;";	
	sStyle += " transform-origin: 50% 50%; -moz-transform:rotate("+nAngle+"deg); -webkit-transform:rotate("+nAngle+"deg);";
	if ( sRotationMtxIE )
	{		
		sStyle += " filter: " + sRotationMtxIE + ";"; //IE6/7
		sStyle += " -ms-filter: " + sRotationMtxIE + ";"; //IE8				
	}
	sStyle += " position:absolute; top:"+nTopPos+"px; left:"+nLeftPos+"px;";	

	var cArrowElem = document.createElement( "div" );
	cArrowElem.setAttribute( "id", sId );
	cArrowElem.setAttribute( 'style', sStyle );
	cParentElem.appendChild( cArrowElem );
		
	return cArrowElem;
};


//added by Oliver Chong - Februaruy 4, 2015
/**
 * Remove the slash effect
 *
 * @method RemoveEffect
 */
QteSlashEffect.prototype.RemoveEffect = function( nSlashIndex, fCallBack )
{
	nSlashIndex = ( typeof( nSlashIndex ) === "undefined" ) ? this.m_nCurrSlashIndex : nSlashIndex;
	
	var nCurrHotspotListLen = this.m_aCurrHotspotList.length;
		
	//stop the hint animation
	for ( var index = 0; index < nCurrHotspotListLen; ++index )
	{
		var cCurrHotspot = this.m_aCurrHotspotList[ index ];
		
		$( "#hint_"+cCurrHotspot.sId ).stop().remove();		
	}//end loop
	
	$( "#slash_"+nSlashIndex ).fadeOut( 300, function() {			
		
		$( this ).remove();	
		
		if ( typeof( fCallBack ) === "function" )
		{
			fCallBack.call();
		}
	} );
};


//added by Oliver Chong - February 4, 2015
/**
 * Draw the subsequent slash effect
 *
 * @method DrawEffect
 */
QteSlashEffect.prototype.DrawEffect = function()
{
	//make sure the index does not go out of bounds
	if ( this.m_nCurrSlashIndex < ( this.m_aSlashSeqList.length - 1 ) )
	{
		//increment the slash effect index
		++this.m_nCurrSlashIndex;
	}
	else
	{
		//reset the slash index
		this.m_nCurrSlashIndex = 0;
	}	
	
	//draw another slash effect
	this.DrawSlash( this.m_nCurrSlashIndex );
};


//added by Oliver Chong - February 4, 2015
/**
 * Verifies if the slash is completed
 *
 * @method IsSlashComplete
 * @return {boolean} : return true if the slash is completed
 */
QteSlashEffect.prototype.IsSlashComplete = function()
{
	//if the number of activate hotspots is equivalent to the current number of hotspots
	return ( this.m_aActivatedHotspotSeq.length == this.m_aCurrHotspotList.length );	
};


//added by Oliver Chong - February 1, 2015
/**
 * Verifies if the slashing motion done by the player is in the correct sequence
 *
 * @method VerifyEffect
 * @param {boolean} bAllowReverseSeq : if true, allow reverse sequence
 * @return {boolean} : return true if the slash sequence is valid otherwise return false
 */
QteSlashEffect.prototype.VerifyEffect = function( bAllowReverseSeq )
{
	var bOk = true;
	
	var nCurrHotspotListLen =  this.m_aCurrHotspotList.length;
	
	//go through the hotspot list to verify if the sequence of activating the hotspots is correct
	for ( var index = 0; index < nCurrHotspotListLen; ++index )
	{
		var cCurrHotspot = this.m_aCurrHotspotList[ index ];
		
		if ( typeof( this.m_aActivatedHotspotSeq[ index ] ) !== "undefined" )
		{		
			//check if the sequence is correct
			if ( cCurrHotspot.sId != this.m_aActivatedHotspotSeq[ index ] )	
			{
				bOk = false;
				break;
			}
		}
		else
		{
			break;
		}
	}//end loop
	
	//check the reverse sequence
	if ( !bOk && bAllowReverseSeq )
	{
		bOk = true;
		
		var nActivatedHotspotSeq = 0;
		for ( var index = nCurrHotspotListLen; index > 0; --index )
		{
			var cCurrHotspot = this.m_aCurrHotspotList[ index - 1 ];
			
			if ( typeof( this.m_aActivatedHotspotSeq[ nActivatedHotspotSeq ] ) !== "undefined" )
			{
				//check if the sequence is correct
				if ( cCurrHotspot.sId != this.m_aActivatedHotspotSeq[ nActivatedHotspotSeq ] )	
				{
					bOk = false;
					break;
				}
				
				++nActivatedHotspotSeq;
			}
			else
			{				
				break;
			}			
		}//end loop
	}
	
	return bOk;
};


//added by Oliver Chong - January 30, 2015
/**
 * Adds event listeners and effects to the hotspots in the slash effect
 *
 * @method AddEffectInteraction
 */
QteSlashEffect.prototype.AddEffectInteraction = function()
{
	var that  = this;
	var bIsHotspotActivationEnabled = false;	
	var nActiveHotspotSizeMult = 1.5;

	//detect if the player is doing a mouse down or a mouse up
	$( document ).mousedown( function( event )  {
		//this is to prevent the browser default drag and drop from interfering
		( event.preventDefault ) ? event.preventDefault() : event.returnValue = false;
		//event.stopPropagation();
		bIsHotspotActivationEnabled = true;
	} );
	
	$( document ).mouseup( function( event ) { 
		bIsHotspotActivationEnabled = false;		
		//revert all the hotspots to its original state
		that.ResetHotspots();
	} );	
	
	//go through the hotspots within the slash
	var nCurrHotspotListLen = this.m_aCurrHotspotList.length;
	for ( var index = 0; index < nCurrHotspotListLen; ++index )
	{
		var cCurrHotspot = this.m_aCurrHotspotList[ index ];	
		
		//create a closure to bind the variables to the event handlers
		( function( cCurrHotspot ) {
		
			//animate the hotspots based on the user interaction
			$( "#"+cCurrHotspot.sId ).mousedown( 
				function( event ) {
					//this is to prevent the browser default drag and drop from interfering
					( event.preventDefault ) ? event.preventDefault() : event.returnValue = false;
					//event.stopPropagation();
					if ( !cCurrHotspot.bActive )
					{	
						that.ActivateHotspot( $( this ), cCurrHotspot, nActiveHotspotSizeMult );		
					}					
				}
			).mouseenter( 
				function() {			
					if ( bIsHotspotActivationEnabled && !cCurrHotspot.bActive )
					{				
						var bSuccess = that.ActivateHotspot( $( this ), cCurrHotspot, nActiveHotspotSizeMult );						
												
						if ( bSuccess )
						{							
							//check if the player completes the entire slash
							if ( that.IsSlashComplete() )
							{			
								//remove the slash effect								
								that.RemoveEffect( that.m_nCurrSlashIndex, function() { 											
									//emit/dispatch the custom event
									EvtMgr.UpdateEventDetails( QteMgr.EVT_QTE_CLEAR, "success", 1 );
									EvtMgr.EmitEvent( that.m_sParentElemId, QteMgr.EVT_QTE_CLEAR );
									
									if ( typeof( that.m_fSuccessCallback ) === "function" )
									{
										that.m_fSuccessCallback( that );
									}
								} );												
							}
						}
						else
						{					
							//reset all the hotspots of the current slash effect to the original state
							//that.ResetHotspots();
						}
					}					
				}
			);
			
		} )( cCurrHotspot );
		
	}//end loop	
};


//added by Oliver Chong - February 1, 2015
/**
 * Activates the hotspot
 *
 * @method ActivateHotspot
 * @param {object} cContext : the jQuery object that will serve as the context
 * @param {object} cCurrHotspot : the current hotspot object
 * @param {float} nActiveHotspotSizeMult : the multiplier to scale the active hotspot
 * @return {boolean} : return true if successfully activated
 */
QteSlashEffect.prototype.ActivateHotspot = function( cContext, cCurrHotspot, nActiveHotspotSizeMult )
{
	//add to the list of activated hotspots
	this.m_aActivatedHotspotSeq.push( cCurrHotspot.sId );
	
	//check if the sequence of performing the slash is correct
	var bSuccess = this.VerifyEffect( false );
	
	var sColor = bSuccess ? QteHotspotColor["SUCCESS"] : QteHotspotColor["FAIL"];

	//compute for the position offset so scaling will be relative to the center
	var nOrigSize = cCurrHotspot.nOrigSize;
	var nNewSize = nOrigSize * nActiveHotspotSizeMult;
	var nPosOffset = ( nNewSize - nOrigSize ) / 2;	
	
	var nNewTop = cCurrHotspot.nHotspotOrigTop - nPosOffset;
	var nNewLeft = cCurrHotspot.nHotspotOrigLeft - nPosOffset;
	
	this.AnimateHotspot( cContext, nNewTop, nNewLeft, nNewSize, sColor );
	this.AnimateArrow( $( "#arrow_"+cCurrHotspot.sId ), sColor );
	
	cCurrHotspot.bActive = true;	

	return bSuccess;
};


//added by Oliver Chong - January 30, 2015
/**
 * Resets the hotspots to its original state
 *
 * @method ResetHotspots
 */
QteSlashEffect.prototype.ResetHotspots = function()
{
	//reset the list of the activated hotspots
	this.m_aActivatedHotspotSeq = [];
	
	//revert all the hotspots to its original state
	var nCurrHotspotListLen = this.m_aCurrHotspotList.length;
	for ( var index = 0; index < nCurrHotspotListLen; ++index )
	{
		var cCurrHotspot = this.m_aCurrHotspotList[ index ];			
		
		this.AnimateHotspot( $( "#"+cCurrHotspot.sId ), cCurrHotspot.nHotspotOrigTop, cCurrHotspot.nHotspotOrigLeft, cCurrHotspot.nOrigSize, QteHotspotColor["DEFAULT"] );
		this.AnimateArrow( $( "#arrow_"+cCurrHotspot.sId ), QteHotspotColor["DEFAULT"] );
		
		//$( "#link_"+cCurrHotspot.sId ).fadeOut( 250 );	
		
		cCurrHotspot.bActive = false;
	}//end loop
};


//added by Oliver Chong - January 30, 2015
/**
 * Animates the hotspot when the player interacts with it
 *
 * @method AnimateHotspot
 * @param {object} cContext : the jQuery object that will serve as the context
 * @param {integer} nTop : the top position to move to
 * @param {integer} nLeft : the left position to move to
 * @param {float} nSize : the size to scale to
 * @param {string} sColor : the color to change to
 */
QteSlashEffect.prototype.AnimateHotspot = function( cContext, nTop, nLeft, nSize, sColor )
{
	cContext.stop().animate( {  
		top: nTop+"px",
		left: nLeft+"px",
		width: nSize+"px", 
		height: nSize+"px",
		borderColor : sColor
	}, 300 );
};


//added by Oliver Chong - February 3, 2015
/**
 * Animates the arrow when the player interacts with it
 *
 * @method AnimateArrow
 * @param {object} cContext : the jQuery object that will serve as the context
 * @param {string} sColor : the color to change to
 */
QteSlashEffect.prototype.AnimateArrow = function( cContext, sColor )
{
	cContext.stop().animate( {  
		borderLeftColor : sColor
	}, 300 );
};


//added by Oliver Chong - February 25, 2015
/**
 * Animates the hotspot hint
 *
 * @method RunHotspotHint
 */
QteSlashEffect.prototype.RunHotspotHint = function()
{
	this.RunHotspotHintHelper( 0 );
};


//added by Oliver Chong - February 25, 2015
/**
 * Animates the hotspot hint ( the helper function to be called recursively )
 *
 * @method RunHotspotHintHelper
 * @param {unsigned} nIndex : the index of the hotspot hint in the list
 */
QteSlashEffect.prototype.RunHotspotHintHelper = function( nIndex )
{
	var that = this;
	
	var nCurrHotspotListLen = this.m_aCurrHotspotList.length;
	
	var cCurrHotspot = this.m_aCurrHotspotList[ nIndex ];
	
	if ( cCurrHotspot )
	{
		var cContext = $( "#hint_"+cCurrHotspot.sId );

		//this will do the blink effect
		cContext.stop().show().hide( "puff", { percent: 200 }, 500, function() {
			cContext.stop().hide( function() {	
				//increment and wrap the index
				++nIndex;
				if ( nIndex >= nCurrHotspotListLen )
				{
					nIndex = 0;
				}
				//call recursive function
				that.RunHotspotHintHelper( nIndex );
			} );
		} );
	}
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//added by Oliver Chong - February 9, 2015
/**
 * The constructor for the block quick-time event
 *
 * @class QteBlockEffect
 * @constructor QteBlockEffect
 * @param {string} sParentElemId : the id of the parent HTML element that will contain the block effect
 * @param {unsigned} nAreaWidth : the width of the area that the block will cover
 * @param {unsigned} nAreaHeight : the height of the area that the block will cover
 * @param {array} aBlockSeqList : the array containing the block data
 * @param {unsigned} nHotspotRadiusDeviation : the radius size deviation between the inner and outer hotspots
 * @param {function} fSuccessCallback : the callback function to execute once the quick-time event has been completed successfully
 */
function QteBlockEffect( sParentElemId, nAreaWidth, nAreaHeight, fSuccessCallback )
{
	//check this class implements the interface
	Interface.EnsureImplements( this, QteEffectInterface );
	
	//the id of the HTML parent element that will contain the block effect
	this.m_sParentElemId = sParentElemId;
	
	//the area from which the block effect can appear
	this.m_nAreaWidth = nAreaWidth;
	this.m_nAreaHeight = nAreaHeight;
	
	//the callback function to execute once the quick-time event has been completed successfully
	this.m_fSuccessCallback = fSuccessCallback;
	
	//the current target block effect object
	this.m_aCurrTargetBlockObj = null;

	//the current moving block effect object
	this.m_aCurrMovingBlockObj = null;

	//the hotspot parameters
	this.m_nHotspotBorderSizeDeviationMult = 1.0;
	this.m_nHotspotSizeDeviationMult = 1.0;
	this.m_nMovingHotspotBorderSize = 0;
	this.m_nTargetHotspotBorderSize = 0;
	this.m_nTargetHotspotDiameter = 10;
	this.m_nMovingHotspotDiameter = 10;
};


//added by Oliver Chong - February 12, 2015
/**
 * Initializes the hotspots
 *
 * @method InitHotspots
 * @param {string} sId : the HTML element identifier
 * @param {integer} nPosX : the starting x coordinate
 * @param {integer} nPosY : the starting y coordinate
 */
QteBlockEffect.prototype.InitHotspots = function( sId, nPosX, nPosY )
{	
	this.m_nHotspotBorderSizeDeviationMult = 3;
	this.m_nHotspotSizeDeviationMult = 2.5;
	
	//set the border size of the hotspots		
	this.m_nMovingHotspotBorderSize = 12;
	this.m_nTargetHotspotBorderSize = ( this.m_nMovingHotspotBorderSize * this.m_nHotspotBorderSizeDeviationMult );	
	
	//determine the size of the hotspot
	// the border will also contribute to the overall size
	this.m_nTargetHotspotDiameter = this.DetermineHotspotSize( nPosX, nPosY );	
	this.m_nTargetHotspotDiameter += this.m_nTargetHotspotBorderSize;
	this.m_nMovingHotspotDiameter = ( this.m_nTargetHotspotDiameter * this.m_nHotspotSizeDeviationMult );		
	this.m_nMovingHotspotDiameter += this.m_nMovingHotspotBorderSize;
	
	//this is to set the position relative to the center origin 
	//the position offset will be affected relative to the border size difference
	var nMovingHotspotPosOffset = ( this.m_nMovingHotspotDiameter / 2 ) - ( this.m_nTargetHotspotBorderSize - this.m_nMovingHotspotBorderSize );
	var nTargetHotspotPosOffset = this.m_nTargetHotspotDiameter / 2;	
	
	//the current target block object
	this.m_aCurrTargetBlockObj = {
		"sId" : ( sId + "_target" ),
		//position relative to the center
		"nOrigTop" : nPosY - nTargetHotspotPosOffset,
		"nOrigLeft" : nPosX - nTargetHotspotPosOffset,
	};	

	//the moving block object
	this.m_aCurrMovingBlockObj = {
		"sId" : ( sId + "_move" ),
		//position relative to the center
		"nOrigTop" : nPosY - nMovingHotspotPosOffset,
		"nOrigLeft" : nPosX - nMovingHotspotPosOffset,
	};	
};


//added by Oliver Chong - February 9, 2015
/**
 * Draws the block effect
 *
 * @method DrawEffect
 */
QteBlockEffect.prototype.DrawEffect = function()
{
	//randomize the starting position
	var nPosX = Math.floor( Math.random() * this.m_nAreaWidth );
	var nPosY = Math.floor( Math.random() * this.m_nAreaHeight );
	
	var sId = "block" + nPosX;
	
	//initialize the hotspots
	this.InitHotspots( sId, nPosX, nPosY );
	
	//draw the moving block hotspot
	var cHotspotMovingElem = this.DrawHotspot( null, this.m_aCurrMovingBlockObj.sId, this.m_aCurrMovingBlockObj.nOrigTop, this.m_aCurrMovingBlockObj.nOrigLeft, this.m_nMovingHotspotDiameter, this.m_nMovingHotspotBorderSize );
	
	//draw the inner and outer hotpots
	var cHotspotTargetElem = this.DrawHotspot( null, this.m_aCurrTargetBlockObj.sId, this.m_aCurrTargetBlockObj.nOrigTop, this.m_aCurrTargetBlockObj.nOrigLeft, this.m_nTargetHotspotDiameter, this.m_nTargetHotspotBorderSize );
	
	//attach the slash effect to the main parent HTML element
	var cMainParentElem = document.getElementById( this.m_sParentElemId );
	cMainParentElem.appendChild( cHotspotMovingElem );
	cMainParentElem.appendChild( cHotspotTargetElem );
	
	//add event handlers and effects
	this.AddEffectInteraction();	
	
	//the moving block hotspot will shrink to half the size of the target hotspot
	this.AnimateMovingBlockEffect( $( "#" + this.m_aCurrMovingBlockObj.sId ), nPosY, nPosX, ( this.m_nTargetHotspotDiameter / 2 ) );	
};


//added by Oliver Chong - February 12, 2015
/**
 * Adds event listeners and effects to the hotspots in the block effect
 *
 * @method AddEffectInteraction
 */
QteBlockEffect.prototype.AddEffectInteraction = function()
{
	var that  = this;

	//detect if the player is doing a mouse click
	$( "#" + this.m_aCurrTargetBlockObj.sId ).click( function( event )  {
		//provide feedback to the player upon clicking by updating the block effect hotspot
		that.ActivateBlockHotspot();
	} );
}


//added by Oliver Chong - Febraury 9, 2015
/**
 * Determines the radius of the block hotspot
 *
 * @method DetermineHotspotSize
 * @param {integer} nStartX : the starting x coordinate
 * @param {integer} nStartY : the starting y coordinate
 */
QteBlockEffect.prototype.DetermineHotspotSize = function( nStartX, nStartY )
{
	//get the 4 corners of the quick-time event area (relative position)
	var aCorners = [];
	aCorners.push( { "y" : 0, "x" : 0 } ); //TopLeft
	aCorners.push( { "y" : 0, "x" : this.m_nAreaWidth } ); //TopRight
	aCorners.push( { "y" : this.m_nAreaHeight, "x" : 0 } ); //BottomLeft
	aCorners.push( { "y" : this.m_nAreaHeight, "x" : this.m_nAreaWidth } ); //BottomRight
	
	//find the distance between the point and the corners 
	var nCornerIdxLong = null;
	var nCornerIdxShort = null;
	var nLongest = 0;
	//we are comparing the squared distance
	var nShortest = ( this.m_nAreaWidth * this.m_nAreaWidth );
	for ( var index = 0; index < aCorners.length; ++index )
	{
		var cCorner = aCorners[ index ];

		//get the vector from the point to the area corner
		cCorner.cVec = new Vector2D( ( cCorner.x - nStartX ), ( cCorner.y - nStartY ) );			
		//compute for the magnitude squared of the vector
		cCorner.nDistanceSq = cCorner.cVec.GetMagnitudeSquared()
		
		//find the corner index that has the longest and shortest distance from the point
		if ( cCorner.nDistanceSq > nLongest )
		{
			nLongest = cCorner.nDistanceSq;
			nCornerIdxLong = index;
		}
		if ( cCorner.nDistanceSq <= nShortest )
		{
			nShortest = cCorner.nDistanceSq;
			nCornerIdxShort = index;
		}
	}//end loop
	
	nShortest = Math.sqrt( nShortest );
	nLongest = Math.sqrt( nLongest );
	
	//cap the radius size
	nShortest = Math.min( nShortest, ( nLongest / 2 ) );
	
	return nShortest;
};


//added by Oliver Chong - February 9, 2015
/**
 * Draws the hotspot for the block effect
 *
 * @method DrawHotspot
 * @param {object} cParentElem : the parent HTML element that will contain the hotspot
 * @param {string} sId : the element id
 * @param {integer} nTopPos : the top position
 * @param {integer} nLeftPos : the left position
 * @param {unsigned} nDiameter : the diameter of the hotspot
 * @param {unsigned} nBorderSize : the border size of the hotspot
 * @return {object} : the generated hotspot HTML element
 */
QteBlockEffect.prototype.DrawHotspot = function( cParentElem, sId, nTopPos, nLeftPos, nDiameter, nBorderSize )
{
	var sStyle = "display:block; opacity:0.75; filter: alpha(opacity=75); width:"+nDiameter+"px; height:"+nDiameter+"px;";	
	sStyle += " position:absolute; top:"+nTopPos+"px; left:"+nLeftPos+"px;";
	sStyle += " border: " + nBorderSize + "px solid " + QteHotspotColor["DEFAULT"] + "; border-radius: " + ( nDiameter  * 2 ) + "px;";

	var cHotspotElem = document.createElement( "div" );
	cHotspotElem.setAttribute( "id", sId );
	cHotspotElem.setAttribute( "style", sStyle );
		
	if ( cParentElem )
	{
		cParentElem.appendChild( cHotspotElem );
	}
	
	return cHotspotElem;
};


//added by Oliver Chong - February 9, 2015
/**
 * Verify if the block is successful by checking if the moving and target hotspots fits together
 *
 * @method VerifyEffect
 * @return {boolean} : return true if successfully blocked
 */
QteBlockEffect.prototype.VerifyEffect = function()
{
	//this is to support the condition if half (or more) of the moving hotspot is on the target hotspot, it will be counted as a success
	//I did not divide by 2 since the border applies to both sides
	var nAllowance =  this.m_nMovingHotspotBorderSize;
	
	var nOuterBounds = Math.round( this.m_nTargetHotspotDiameter + ( this.m_nTargetHotspotBorderSize * 2 ) ) + nAllowance;
	var nInnerBounds = Math.round( this.m_nTargetHotspotDiameter ) + nAllowance;
	
	var nMovingHotspotCurrSize = $( "#" + this.m_aCurrMovingBlockObj.sId ).width();
	nMovingHotspotCurrSize = Math.round( nMovingHotspotCurrSize + ( this.m_nMovingHotspotBorderSize * 2 ) );
	
	//check if the moving block is within the target hotspot
	if ( ( nOuterBounds >= nMovingHotspotCurrSize ) && ( nInnerBounds <= nMovingHotspotCurrSize )  )
	{
		return true;
	}
	else
	{
		return false;
	}
};


//added by Oliver Chong - February 9, 2015
/**
 * Activates the block effect hotspot
 *
 * @method ActivateBlockHotspot
 * @return {boolean} : return true if successfully activated
 */
QteBlockEffect.prototype.ActivateBlockHotspot = function()
{
	var that = this;
	
	//check if the player was able to successfully block
	var bSuccess = this.VerifyEffect();
	
	var sColor = bSuccess ? QteHotspotColor["SUCCESS"] : QteHotspotColor["FAIL"];

	//update the appearance of the moving block and stop the moving animation
	$( "#" + this.m_aCurrMovingBlockObj.sId ).css( { 
		"borderColor" : sColor,
		"opacity" : 0.7
	} ).stop();	

	$( "#" + this.m_aCurrTargetBlockObj.sId ).stop();
	
	setTimeout( function() { 
		//hide and remove the hotspots
		that.RemoveEffect();
		
		//if successful block
		if ( bSuccess )
		{
			//emit/dispatch the custom event
			EvtMgr.UpdateEventDetails( QteMgr.EVT_QTE_CLEAR, "success", 1 );
			EvtMgr.EmitEvent( that.m_sParentElemId, QteMgr.EVT_QTE_CLEAR );
			
			if ( typeof( that.m_fSuccessCallback ) === "function" )
			{
				that.m_fSuccessCallback( that );
			}
		}	
		else
		{		
			//emit/dispatch the custom event
			EvtMgr.UpdateEventDetails( QteMgr.EVT_QTE_CLEAR, "success", 0 );			
			EvtMgr.EmitEvent( that.m_sParentElemId, QteMgr.EVT_QTE_CLEAR );
		}
		
	} , 500 );
	
	return bSuccess;
};


//added by Oliver Chong - February 25, 2015
/**
 * Remove the block effect
 *
 * @method RemoveEffect
 */
QteBlockEffect.prototype.RemoveEffect = function()
{
	//hide and remove the hotspots
	$( "#" + this.m_aCurrMovingBlockObj.sId ).stop().fadeOut( 250, function() { $( this ).remove(); } );
	$( "#" + this.m_aCurrTargetBlockObj.sId ).stop().fadeOut( 250, function() { $( this ).remove(); } );
};


//added by Oliver Chong - February 9, 2015
/**
 * Animates the moving block hotspot
 *
 * @method AnimateMovingBlockEffect
 * @param {object} cContext : the jQuery object that will serve as the context
 * @param {integer} nTop : the top position to move to
 * @param {integer} nLeft : the left position to move to
 * @param {float} nSize : the size to scale to
 * @param {string} sColor : the color to change to
 */
QteBlockEffect.prototype.AnimateMovingBlockEffect = function( cContext, nTop, nLeft, nSize, sColor )
{
	var that = this;
	
	sColor = typeof( sColor ) === "undefined" ? QteHotspotColor["DEFAULT"] : sColor;
	
	//reset to the original settings
	cContext.css( {
		"top" : that.m_aCurrMovingBlockObj.nOrigTop,
		"left" : that.m_aCurrMovingBlockObj.nOrigLeft,
		"width" : that.m_nMovingHotspotDiameter,
		"height" : that.m_nMovingHotspotDiameter,
		"borderColor" : QteHotspotColor["DEFAULT"],
		"opacity" : 0.75
	} );
	
	//run the animation recursively
	this.AnimateHotspot( cContext, nTop, nLeft, nSize, sColor, 0.05, this.AnimateMovingBlockEffect );	
};


//added by Oliver Chong - February 9, 2015
/**
 * Animates the hotspot
 *
 * @method AnimateHotspot
 * @param {object} cContext : the jQuery object that will serve as the context
 * @param {integer} nTop : the top position to move to
 * @param {integer} nLeft : the left position to move to
 * @param {float} nSize : the size to scale to
 * @param {string} sColor : the color to change to
 * @param {float} fOpacity : the opacity
 * @param {function} fCallback : the callback function to invoke after the animation ends
 */
QteBlockEffect.prototype.AnimateHotspot = function( cContext, nTop, nLeft, nSize, sColor, fOpacity, fCallback )
{
	var that = this;	

	cContext.stop().animate( {  
		//position relative to center when resizing (take the border size into consideration)
		//the section ( this.m_nHotspotBorderSizeDeviationMult / 2 ) is a hack since it does not center perfectly due to possible floating point imprecision
		top: ( nTop - ( nSize / 2 ) + ( this.m_nTargetHotspotBorderSize - this.m_nMovingHotspotBorderSize ) ) + "px",
		left: ( nLeft - ( nSize / 2 ) + ( this.m_nTargetHotspotBorderSize - this.m_nMovingHotspotBorderSize ) ) + "px",
		width: nSize + "px", 
		height: nSize + "px",
		//borderColor : sColor,
		opacity : fOpacity
	}, 2000, "linear", function() {	
		if ( typeof( fCallback ) === "function" )
		{
			fCallback.call( that, cContext, nTop, nLeft, nSize, sColor );
		}
	} );
};


//added by Oliver Chong - February 25, 2015
/**
 * Animates the hotspot hint
 *
 * @method RunHotspotHint
 */
QteBlockEffect.prototype.RunHotspotHint = function()
{
	var that = this;	
	
	var cContext = $( "#" + this.m_aCurrTargetBlockObj.sId );	

	cContext.animate( {  
		borderColor : QteHotspotColor["HINT"]
	}, 1500, "easeInQuad", function() { 
		cContext.animate( {  
			borderColor : QteHotspotColor["DEFAULT"]
		}, 1500, "easeInQuad", function() {	
			that.RunHotspotHint();
		} );
	} );
};