//added by Oliver Chong - February 15, 2015
/**
 * The constructor of the Game class
 *
 * @class Game
 * @constructor Game
 */
function Game()
{
	//initialize the game parameters
	this.m_nBossCurrHP = 1000;
	this.m_nBossMaxHP = 1000;
	this.m_nPlayerCurrHP = 1000;
	this.m_nPlayerMaxHP = 1000;
	this.m_nCurrCombo = 0;
	this.m_nDefaultDmg = 100;
	

	//IS THERE A BETTER WAY TO DO THIS???
	//game specific callback functions that will be invoked when the quick-time event effect has been executed properly
	//var aQteEffectSuccessCallback = this.InitCallbacksForQte();

	//the sequence of hotspots for each effect (not all effects will use this)
	var aSlashSeqList = [];				
	aSlashSeqList.push( [ 'A1', 'A2', 'A3', 'A4', 'A5' ] );		
	aSlashSeqList.push( [ 'B1', 'B2', 'B3', 'B4' ] );	
	aSlashSeqList.push( [ 'C1', 'C2', 'C3', 'C4', 'C5' ] );	
	aSlashSeqList.push( [ 'D1', 'D2', 'D3', 'D4' ] );	
	aSlashSeqList.push( [ 'E1', 'E2', 'E3', 'E4', 'E5' ] );	

	//initialize the quick-time event manager
	this.m_cQteMgr = new QteMgr( aSlashSeqList, "main", /*372*/320, /*526*/450, aSlashSeqList.length, "qte_timer" /*, this, this.DrawQteEffect,*/ /*aQteEffectSuccessCallback*/ );
	
	this.InitEventHandler( "main" );
};


//the quick-time event manager
Game.prototype.m_cQteMgr;


//the fight outcome
Game.FightOutcome = {
	"NONE" : 0,
	"LOSE" : 1,
	"WIN" : 2
};


//added by Oliver Chong - February 15, 2015
/**
 * Runs the game
 *
 * @method Run
 */
Game.prototype.Run = function()
{
	//determine the boss that the player will fight
	this.DetermineBoss( "boss_img" );
	
	//draw the quick-time event effect
	this.DrawQteEffect();	
	
	//draw the health bars
	UiEffect.DisplayBar( "main", "boss_health", -40, 0, this.m_nBossCurrHP, this.m_nBossMaxHP, 375, 30, 0.4 );		
	UiEffect.DisplayBar( "main", "player_health", 565, 65, this.m_nPlayerCurrHP, this.m_nPlayerMaxHP, 310, 30, 0.4 );
	
	//print the timer countdown value
	UiEffect.PrintGlowingText( "hourglass_main", "qte_timer", 45, 308, "60px", 50, "#555555", 10, "#eeeeee", this.m_cQteMgr.m_nTimerCountdownLimit, true );
};


//added by Oliver Chong - February 15, 2015
/**
 * Initialize the event handlers
 *
 * @method InitEventHandler
 */
Game.prototype.InitEventHandler = function( sParentElemId )
{
	var that = this;
	
	//attach the event listeners
	//once a quick time event effect is cleared
	EvtMgr.AddEventListener( null, sParentElemId, QteMgr.EVT_QTE_CLEAR, function( event ) { 
		//console.log(  "================ qte_cleared!!!" );
		//console.log( event );
		
		//process the game logic
		that.ProcessGameLogic( event.detail.success );		
	} );
};


//added by Oliver Chong - February 15, 2015
/**
 * Process the game logic
 *
 * @method ProcessGameLogic
 * @param {boolean} bQteSuccess : if true, the quick-time event effect was executed successfully, otherwise false
 */
Game.prototype.ProcessGameLogic = function( bQteSuccess )
{
	var that = this;
	
	//handle the outcomes of the quick-time event effects
	switch ( this.m_cQteMgr.m_nCurrEffect )
	{
		//attack the boss
		case QteEffectsType.SLASH:
			//if the quick-time event effect was successfully executed
			if ( bQteSuccess )
			{
				//damage the boss
				this.m_nBossCurrHP -= this.m_nDefaultDmg;
				this.m_nBossCurrHP = Math.max( this.m_nBossCurrHP, 0 );
				
				//animate the health bar
				var nPctHP = ( this.m_nBossCurrHP / this.m_nBossMaxHP ) * 100; 
				var sBarColor = UiEffect.InterpolateColor( nPctHP, 0.4 );	
				UiEffect.AnimateBar( "boss_health", this.m_nBossCurrHP, this.m_nBossMaxHP, sBarColor );
				
				//update combo
				++this.m_nCurrCombo;				
			}
			break;
		
		//defend from the boss
		case QteEffectsType.BLOCK:			
			//if the quick-time event effect was successfully executed
			if ( bQteSuccess )
			{
				//update combo
				++this.m_nCurrCombo;				
			}
			else
			{
				//damage the player
				this.m_nPlayerCurrHP -= this.m_nDefaultDmg;
				this.m_nPlayerCurrHP = Math.max( this.m_nPlayerCurrHP, 0 );
				
				//animate the health bar
				var nPctHP = ( this.m_nPlayerCurrHP / this.m_nPlayerMaxHP ) * 100; 
				var sBarColor = UiEffect.InterpolateColor( nPctHP, 0.4 );
				UiEffect.AnimateBar( "player_health", this.m_nPlayerCurrHP, this.m_nPlayerMaxHP, sBarColor );
				
				//update combo
				if ( this.m_nCurrCombo )
				{
					--this.m_nCurrCombo;
				}
			}
			break;
			
		default:
			break;
	}; //end switch		
	
	//combo display
	if ( this.m_nCurrCombo )
	{
		$( "#combo_word" ).show();
		
		//print out the combo number
		UiEffect.PrintNumberImage( "combo_number", this.m_nCurrCombo );
		
		//this will do the stamp effect
		$( "#combo_number" ).hide().show( "puff", {}, 300, function() {
			//do something
		} );
	}
	else
	{
		$( "#combo_word" ).hide();
		$( "#combo_number" ).hide();
	}	
	
	//if the fight is not yet over
	if ( this.DetermineFightOutcome() == Game.FightOutcome[ "NONE" ] )
	{
		++this.m_cQteMgr.m_nCurrEffectThreshold;

		//reset countdown timer
		this.m_cQteMgr.m_nTimerCountdownLimit = QteMgr.MAX_TIMER_VAL;		
		
		var cQteEffectContext = this.m_cQteMgr.m_aEffects[ this.m_cQteMgr.m_nCurrEffect ];
		
		//handle the outcomes of the quick-time event effects
		switch ( this.m_cQteMgr.m_nCurrEffect )
		{
			//attack the boss
			case QteEffectsType.SLASH:
				//find the middle hotspot and get its position
				var nMidIndex = Math.floor( cQteEffectContext.m_aCurrHotspotList.length / 2 );
				var cMidHotspot = cQteEffectContext.m_aCurrHotspotList[ nMidIndex ];		
				
				//run the slash effect sprite animation														
				UiEffect.RunSpriteAnimation( "slash_sprite", cQteEffectContext.m_sParentElemId, 
											cMidHotspot.nArrowTopPos, cMidHotspot.nArrowLeftPos, 
											"images/AttackSlash.png", 150, 1280, 8, function() {
												//draw the next quick-time event effect
												that.DrawQteEffectBasedOnThreshold();
											}  );
				
				//shake the boss portrait
				UiEffect.Shake( "boss_img", 20 );
				break;

			//defend from the boss			
			case QteEffectsType.BLOCK:
				if ( bQteSuccess )
				{
					//offset based on the diameter and the image size
					var nPosOffset = ( cQteEffectContext.m_nTargetHotspotDiameter / 2 ) - 100;
					
					//run the block effect sprite animation
					UiEffect.RunSpriteAnimation( "block_sprite", cQteEffectContext.m_sParentElemId, 
						( cQteEffectContext.m_aCurrTargetBlockObj.nOrigTop + nPosOffset ), ( cQteEffectContext.m_aCurrTargetBlockObj.nOrigLeft + nPosOffset ), 
						"images/DefendBlockBig.png", 288, 1296, 4, function() {
							//draw the next quick-time event effect
							that.DrawQteEffectBasedOnThreshold();
						} );	
				}
				else
				{
					//draw the next quick-time event effect
					that.DrawQteEffectBasedOnThreshold();
				}
				break;
		}		
	}
};


//added by Oliver Chong - February 15, 2015
/**
 * Initializes the callback functions needed by the quick-time event manager
 *
 * @method InitCallbacksForQte
 */
 /*
Game.prototype.InitCallbacksForQte = function()
{
	//IS THERE A BETTER WAY TO DO THIS???
	//game specific callback functions that will be invoked when the quick-time event effect has been executed properly
	var aQteEffectSuccessCallback = {};
	
	//slash effect
	aQteEffectSuccessCallback[ QteEffectsType.SLASH ] = function( cQteEffectContext )
		{									
			//find the middle hotspot and get its position
			var nMidIndex = Math.floor( cQteEffectContext.m_aCurrHotspotList.length / 2 );
			var cMidHotspot = cQteEffectContext.m_aCurrHotspotList[ nMidIndex ];		
			
			//run the slash effect sprite animation														
			UiEffect.RunSpriteAnimation( "slash_sprite", cQteEffectContext.m_sParentElemId, 
										cMidHotspot.nArrowTopPos, cMidHotspot.nArrowLeftPos, 
										"images/AttackSlash.png", 150, 1280, 8, function() {
											//emit/dispatch the custom event
											EvtMgr.EmitEvent( cQteEffectContext.m_sParentElemId, QteMgr.EVT_QTE_CLEAR );
										}  );
			
			//shake the boss portrait
			UiEffect.Shake( "boss_img", 20 );	
		};
		
	//block effect
	aQteEffectSuccessCallback[ QteEffectsType.BLOCK ] = function( cQteEffectContext )
		{							
			//offset based on the diameter and the image size
			var nPosOffset = ( cQteEffectContext.m_nTargetHotspotDiameter / 2 ) - 100;
			
			//run the block effect sprite animation
			UiEffect.RunSpriteAnimation( "block_sprite", cQteEffectContext.m_sParentElemId, 
				( cQteEffectContext.m_aCurrTargetBlockObj.nOrigTop + nPosOffset ), ( cQteEffectContext.m_aCurrTargetBlockObj.nOrigLeft + nPosOffset ), 
				"images/DefendBlockBig.png", 288, 1296, 4, function() {
					//emit/dispatch the custom event
					EvtMgr.EmitEvent( cQteEffectContext.m_sParentElemId, QteMgr.EVT_QTE_CLEAR );
				} );					
		};
	
	return aQteEffectSuccessCallback;
};
*/


//added by Oliver Chong - February 25, 2015
/**
 * Draws the quick-time event based on the current threshold
 *
 * @method DrawQteEffectBasedOnThreshold
 */
Game.prototype.DrawQteEffectBasedOnThreshold = function()
{
	//if the threshold has been reached
	if ( this.m_cQteMgr.m_nCurrEffectThreshold >= this.m_cQteMgr.m_nEffectThreshold )
	{
		this.m_cQteMgr.m_nCurrEffectThreshold = 0;
		
		//draw the next random quick-time event effect
		this.DrawQteEffect();
	}
	else
	{
		//draw the current effect
		this.m_cQteMgr.DrawCurrEffect();
	}
};


//added by Oliver Chong - February 15, 2015
/**
 * Draws the quick-time event
 *
 * @method DrawQteEffect
 */
Game.prototype.DrawQteEffect = function()
{
	var that = this;
	
	//randomize the quick time event effect
	this.m_cQteMgr.RandomizeEffect();
	
	//determine the fight mode
	var bAttack = ( this.m_cQteMgr.m_nCurrEffect == QteEffectsType.SLASH ) ? true : false;	
	
	//switch and transition to the next fighting mode
	this.SwitchFightMode( bAttack, function() {		
		that.m_cQteMgr.DrawCurrEffect();
	} );
};


//added by Oliver Chong - February 15, 2015
/**
 * Switches the fight mode of the player
 *
 * @method SwitchFightMode
 * @param {boolean} bAttack : if true, the player is attacking otherwise the player is defending
 * @param {function} fCallback : the callback function
 */
Game.prototype.SwitchFightMode = function( bAttack, fCallback )
{
	if ( bAttack )
	{
		$( "#glow_img_def" ).stop().hide();
		
		//glow effect
		UiEffect.FadeInOutEffect( "glow_img_atk" );
		
		//transition effect
		UiEffect.ShowTransition( "cover", "attack_text_img", fCallback );
	}
	else
	{		
		$( "#glow_img_atk" ).stop().hide();
		
		//glow effect
		UiEffect.FadeInOutEffect( "glow_img_def" );
		
		//transition effect
		UiEffect.ShowTransition( "cover", "defend_text_img", fCallback );
	}
};


//added by Oliver Chong - February 25, 2015
/**
 * Determine the outcome of the fight
 *
 * @method DetermineFightOutcome
 * @param {function} fCallback : the callback function
 * @return {unsigned} : the outcome of the fight ( refer to the values in Game.FightOutcome )
 */
Game.prototype.DetermineFightOutcome = function( fCallback )
{
	fCallback = typeof( fCallback ) === "undefined" ? function(){ location.reload(); } : fCallback;

	var nOutcome = Game.FightOutcome[ "NONE" ];
	if ( this.m_nPlayerCurrHP == 0 )
	{
		//transition effect
		UiEffect.ShowTransition( "cover", "lose_text_img", fCallback );
		
		nOutcome = Game.FightOutcome[ "LOSE" ];
	}
	else if ( this.m_nBossCurrHP == 0 )
	{		
		//transition effect
		UiEffect.ShowTransition( "cover", "win_text_img", fCallback );
		
		nOutcome = Game.FightOutcome[ "WIN" ];
	}
	
	return nOutcome;
};


//added by Oliver Chong - February 25, 2015
/**
 * Determine the boss that the player will fight
 *
 * @method DetermineBoss
 * @param {string} sId : the id of the image element
 */
Game.prototype.DetermineBoss = function( sId )
{
	var nBossCnt = 2;
	
	//randomize the boss
	var nRolledVal = Math.floor( ( Math.random() * nBossCnt ) + 1 );
	
	var sBossImg = "";
	switch ( nRolledVal )
	{
		case 1:
			sBossImg = "zombie_guy";
			break;
		case 2:
			sBossImg = "zombie_girl";
			break;
		
	}//end switch

	document.getElementById( sId ).src="images/" + sBossImg + ".png";
};