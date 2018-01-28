////////////////////////////////////////////////////////////////////////////////////////
/**
 * This is the Math Utility class
 *
 * @author Oliver Ryan Chong
 * @version 1.0
 * @since May 17, 2013
 */
////////////////////////////////////////////////////////////////////////////////////////


/**
 * This is the constructor for the MathUtil class
 *
 * @class MathUtil
 * @constructor MathUtil
 */
var MathUtil = function()
{
};


//this is the floating point epsilon value for the approximation of floating point comparison
MathUtil.EPSILON = 0.00001;


/**
 * This approximates the comparison of two floating point value
 * http://floating-point-gui.de/errors/comparison/
 *
 * @method IsEquals
 * @param {float} a : floating point value
 * @param {float} b : floating point value
 * @returns {boolean} : if true, the floating point values are approximately the same otherwise return false
 */
MathUtil.IsEquals = function( a, b )
{
	var absA = Math.abs( a );
	var absB = Math.abs( b );
	var diff = Math.abs( a - b );

	if ( a === b )
	{
		return true;
	}
	// a or b is zero or both are extremely close to it
	// relative error is less meaningful here
	else if ( a === 0 || b === 0 || diff < Number.MIN_VALUE )
	{
		return diff < ( MathUtil.EPSILON * Number.MIN_VALUE );
	}
	//use relative error
	else
	{
		return ( diff / ( absA + absB ) ) < MathUtil.EPSILON;
	}
};


/**
 * This computes the cosine angle of the triangle
 *
 * @method GetCosAngle
 * @param {float} adjacent : the magnitude of the adjacent side relative to the theta angle
 * @param {float} hypotenuse : the magnitude of the hypotenuse
 * @returns {float} : the cosine angle
 */
MathUtil.GetCosAngle = function( adjacent, hypotenuse )
{
	return ( adjacent / hypotenuse );
};


/**
 * This computes the magnitude of the hypotenuse of a right triangle
 *
 * @method ComputeHypotenuse
 * @param {float} adjacent : the magnitude of the adjacent side relative to the theta angle
 * @param {float} opposite : the magnitude of the opposite side relative to the theta angle
 * @returns {float} : the magnitude of the hypotenuse
 */
MathUtil.ComputeHypotenuse = function( adjacent, opposite )
{
	return ( adjacent * adjacent ) + ( opposite * opposite );
};


/**
 * This converts the angle in degrees to radians
 *
 * @method DegreesToRadians
 * @param {float} degreeVal : the angle in degrees
 * @returns {float} : the angle converted to radians
 */
MathUtil.DegreesToRadians = function( degreeVal )
{
	return degreeVal * ( Math.PI / 180 );
};


/**
 * This converts the angle in radians to degrees
 *
 * @method RadiansToDegrees
 * @param {float} radianVal : the angle in radians
 * @returns {float} : the angle converted to degrees
 */
MathUtil.RadiansToDegrees = function( radianVal )
{
	return radianVal * ( 180 / Math.PI );
};


////////////////////////////////////////////////////////////////////////////////////////
/**
 * This is the vector math library
 *
 * @author Oliver Ryan Chong
 * @version 1.0
 * @since May 10, 2013
 */
////////////////////////////////////////////////////////////////////////////////////////


/**
 * This is the Vector2D class constructor
 *
 * @class Vector2D
 * @constructor Vector2D
 * @param {float} x : the x coordinate
 * @param {float} y : the y coordinate
 * @param {float} z : the z coordinate (if position, last coordinate value is 1, otherwise it's a direction and value will be 0)
 */
var Vector2D = function( x, y, z )
{
	//default parameters
	x = typeof x !== 'undefined' ? x : 0;
	y = typeof y !== 'undefined' ? y : 0;
	z = typeof z !== 'undefined' ? z : 0;

	//data members
	this.m_x = x;
	this.m_y = y;
	this.m_z = z;
};


/**
 * This performs the cross product operation between two 2D vectors to get the perpendicular vector
 *
 * @method CrossProduct
 * @param {Vector2D} rhsVec2D : the right hand side Vector2D
 * @return {Vector2D} : the resulting perpendicular vector
 */
Vector2D.prototype.CrossProduct = function( rhsVec2D )
{
	var x = ( this.m_y * rhsVec2D.m_z ) - ( this.m_z * rhsVec2D.m_y );
	var y = ( this.m_z * rhsVec2D.m_x ) - ( this.m_x * rhsVec2D.m_z );
	var z = ( this.m_x * rhsVec2D.m_y ) - ( this.m_y * rhsVec2D.m_x );

	var crossProductVec = new Vector2D( x, y, z );
	
	return crossProductVec;
};


/**
 * This gets the z-component scalar value of the cross product operation between two 2D vectors
 * 
 * @method CrossProductComponentZ
 * @param {Vector2D} rhsVec2D : the right hand side Vector2D
 * @return {float} : the cross product z-component value
 */
Vector2D.prototype.CrossProductComponentZ = function( rhsVec2D )
{
	return ( this.m_x * rhsVec2D.m_y ) - ( this.m_y * rhsVec2D.m_x );
};


/**
 * This performs the dot product operation between two 2D vectors
 *
 * @method DotProduct
 * @param {Vector2D} rhsVec2D : the right hand side Vector2D
 * @return {float} : the dot product value
 */
Vector2D.prototype.DotProduct = function( rhsVec2D )
{	
	return ( this.m_x * rhsVec2D.m_x ) + ( this.m_y * rhsVec2D.m_y ) + ( this.m_z * rhsVec2D.m_z );
};


/**
 * This computes the cosine angle between two 2D vectors
 *
 * @method GetCosAngle
 * @param {Vector2D} rhsVec2D : the right hand side Vector2D
 * @return {float} : the cosine angle value between the two 2D vectors
 */
Vector2D.prototype.GetCosAngle = function( rhsVec2D )
{
	// u . v = |u| * |v| * cosAngle
	// cosAngle = u . v / ( |u| * |v| )
	return this.DotProduct( rhsVec2D ) / ( this.GetMagnitude() * rhsVec2D.GetMagnitude() );
};


/**
 * This computes the angle in radians between two 2D vectors
 *
 * @method GetAngleRadians
 * @param {Vector2D} rhsVec2D : the right hand side Vector2D
 * @return {float} : the angle value in radians between the two 2D vectors
 */
Vector2D.prototype.GetAngleRadians = function( rhsVec2D )
{
	return Math.acos( this.GetCosAngle( rhsVec2D ) );
};


/**
 * This computes the squared magnitude of a Vector
 *
 * @method GetMagnitudeSquared
 * @return {float} : the squared magnitude of the Vector
 */
Vector2D.prototype.GetMagnitudeSquared = function()
{
	return ( this.m_x * this.m_x ) + ( this.m_y * this.m_y ) + ( this.m_z * this.m_z );
};


/**
 * This computes the magnitude of a Vector
 *
 * @method GetMagnitude
 * @return {float} : the magnitude of the Vector
 */
Vector2D.prototype.GetMagnitude = function()
{
	return Math.sqrt( this.GetMagnitudeSquared() );
};


/**
 * This gets a Vector based on two points
 *
 * @method GetVector
 * @param {float} startX : the starting x position
 * @param {float} startY : the starting y position
 * @param {float} endX : the ending x position
 * @param {float} endY : the ending y position
 * @return {Vector2D} : a Vector instance 
 */
Vector2D.prototype.GetVector = function( startX, startY, endX, endY )
{		
	//alert( "startPos: ( " + startX + ", " + startY + " )   endPos: ( " + endX + ", " + endY + " )" );

	//vector ( head minus tail )
	var computedX = endX - startX;
	var computedY = endY - startY;
	
	//alert( "computed vector : ( " + computedX + ", " + computedY + " )" );
	
	//create a new instance
	var vec2D = new Vector2D( computedX, computedY );
	
	return vec2D;
};


/**
 * This computes the Vector based on two points
 *
 * @method ComputeVector
 * @param {float} startX : the starting x position
 * @param {float} startY : the starting y position
 * @param {float} endX : the ending x position
 * @param {float} endY : the ending y position
 */
Vector2D.prototype.ComputeVector = function( startX, startY, endX, endY )
{		
	//console.log( "startPos: ( " + startX + ", " + startY + " )   endPos: ( " + endX + ", " + endY + " )" );

	//vector ( head minus tail )
	this.m_x = endX - startX;
	this.m_y = endY - startY;
};


/**
 * This normalizes the Vector
 *
 * @method Normalize
 * @return {Vector2D} : an instance of the normalized Vector
 */
Vector2D.prototype.Normalize = function()
{	
	//get the magnitude
	var magnitude = this.GetMagnitude();
	
	//normalize each coordinate in vector
	this.m_x /= magnitude;
	this.m_y /= magnitude;
};


/**
 * This returns a normalized Vector
 *
 * @method GetNormalizedVector
 * @return {Vector2D} : an instance of the normalized Vector
 */
Vector2D.prototype.GetNormalizedVector = function()
{	
	//create a new instance
	var vec2D = new Vector2D( this.m_x, this.m_y );
	vec2D.Normalize();
	
	return vec2D;
};


//added by Oliver Chong - January 19, 2015
/**
 * Scales the vector
 *
 * @method Scale
 * @return {float} : the scalar value
 */
Vector2D.prototype.Scale = function( nScalar )
{
	this.m_x *= nScalar;
	this.m_y *= nScalar;
};


////////////////////////////////////////////////////////////////////////////////////////
/**
 * This is the matrix math library
 *
 * @author Oliver Ryan Chong
 * @version 1.0
 * @since January 9, 2014
 */
////////////////////////////////////////////////////////////////////////////////////////

/**
 * This is the Matrix class constructor. 
 * This matrix is using row-major order.
 *
 * @class Matrix
 * @method Matrix
 */
var Matrix = function()
{
	this.m_nSize = this.m_nWidth * this.m_nHeight;

	this.m_aMatrix = this.CreateIdentityMatrix();
};


//data members
Matrix.prototype.m_nWidth = 3;
Matrix.prototype.m_nHeight = 3;


//added by Oliver Chong - January 9, 2014
/**
 * This creates an identity matrix
 *
 * @method CreateIdentityMatrix
 * @return {array} : the identity matrix
 */
Matrix.prototype.CreateIdentityMatrix = function()
{
	var mtx = [];

	for ( var row = 0; row < this.m_nHeight; ++row )
	{
		mtx[row] = [];
	
		for ( var col = 0; col < this.m_nWidth; ++col )
		{
			var val = ( row == col ) ? 1 : 0;
		
			mtx[row][col] = val;
		}//end loop		
		
	}//end loop
	
	return mtx;
};


//added by Oliver Chong - January 9, 2014
/**
 * This creates a translation matrix
 *
 * @method CreateTranslationMatrix
 * @param {float} x : the value to translate along the x-axis
 * @param {float} y : the value to translate along the y-axis
 * @return {array} : the translation matrix
 */
Matrix.prototype.CreateTranslationMatrix = function( x, y )
{
	var mtx = this.CreateIdentityMatrix();
	
	mtx[0][2] = x;
	mtx[1][2] = y;
	
	return mtx;
};


//added by Oliver Chong - January 9, 2014
/**
 * This creates a scale matrix
 *
 * @method CreateScaleMatrix
 * @param {float} scaleX : the factor to scale the width
 * @param {float} scaleY : the factor to scale the height
 * @return {array} : the scale matrix
 */
Matrix.prototype.CreateScaleMatrix = function( scaleX, scaleY )
{
	var mtx = this.CreateIdentityMatrix();
	
	mtx[0][0] = scaleX;
	mtx[1][1] = scaleY;
	
	return mtx;
};


//added by Oliver Chong - January 9, 2014
/**
 * This creates a rotation matrix (counter-clockwise)
 *
 * @method CreateRotationMatrix
 * @param {float} degrees : the rotation value in degrees
 * @return {array} : the rotation matrix
 */
Matrix.prototype.CreateRotationMatrix = function( degrees )
{
	var mtx = this.CreateIdentityMatrix();
	
	var radianVal = MathUtil.DegreesToRadians( degrees );
	
	//used toFixed() to solve the issue of not rotating when angle is 90 or 180
	//http://stackoverflow.com/questions/9652695/why-does-math-cos90-math-pi-180-yield-6-123031769111-and-not-zero
	var cosTheta = parseFloat( Math.cos( radianVal ).toFixed(5) );
	var sinTheta = parseFloat( Math.sin( radianVal ).toFixed(5) );
	
	mtx[0][0] = cosTheta;
	mtx[0][1] = -sinTheta;
	mtx[1][0] = sinTheta;
	mtx[1][1] = cosTheta;
	
	return mtx;
};


/**
 * This will generate the parameters for the rotation matrix needed by IE browser
 * 
 * @method CreateRotationMatrixIE
 * @param {float} degreeVal : the angle in degrees
 * @return {string} : the parameters for the rotation matrix needed by IE browser 
 */
Matrix.CreateRotationMatrixIE = function( degreeVal )
{
	var radianVal = MathUtil.DegreesToRadians( degreeVal );

	//used toFixed() to solve the issue of not rotating when angle is 90 or 180
	//http://stackoverflow.com/questions/9652695/why-does-math-cos90-math-pi-180-yield-6-123031769111-and-not-zero
	var cosTheta = parseFloat( Math.cos( radianVal ).toFixed(5) );
	var sinTheta = parseFloat( Math.sin( radianVal ).toFixed(5) );
	
	return "M11=" + cosTheta + ",M12=" + (-sinTheta) + ",M21=" + sinTheta + ",M22=" + cosTheta;
};


//added by Oliver Chong - January 19, 2015
/**
 * This applies the matrix transformation to the vector
 *
 * @method Apply
 * @param {array} aMtx : the matrix array
 * @param {Vector2D} cVec : the vector
 * @return {Vector2D} : the transformed vector
 */
Matrix.prototype.Apply = function( aMtx, cVec )
{
	var aVecTemp = [];

	//traverse through the rows of the matrix
	for ( var lhsRow = 0; lhsRow < this.m_nHeight; ++lhsRow )
	{
		var rowVec = new Vector2D( aMtx[lhsRow][0], aMtx[lhsRow][1], aMtx[lhsRow][2] );
		
		aVecTemp.push( rowVec.DotProduct( cVec ) );
	}//end loop
	
	return ( new Vector2D( aVecTemp[0], aVecTemp[1], aVecTemp[2] ) );
};


//added by Oliver Chong - January 9, 2014
/**
 * This performs a matrix multiplication
 *
 * @method Multiply
 * @param {array} lhsMtx : the left-hand side matrix
 * @param {array} rhsMtx : the right-hand side matrix
 * @return {array} : the resulting compound matrix
 */
Matrix.prototype.Multiply = function( lhsMtx, rhsMtx )
{
	var mtx = this.CreateIdentityMatrix();

	//console.log( "lhsMtx" );
	//console.log( lhsMtx );
	
	//console.log( "rhsMtx" );
	//console.log( rhsMtx );
	
	//traverse through the rows of the left-hand side matrix
	for ( var lhsRow = 0; lhsRow < this.m_nHeight; ++lhsRow )
	{
		var rowVec = new Vector2D( lhsMtx[lhsRow][0], lhsMtx[lhsRow][1], lhsMtx[lhsRow][2] );
		
		//console.log( "rowVec" );
		//console.log( rowVec );

		//traverse through the columns of the right-hand side matrix
		for ( var rhsCol = 0; rhsCol < this.m_nWidth; ++rhsCol )
		{
			var colVec = new Vector2D( rhsMtx[0][rhsCol], rhsMtx[1][rhsCol], rhsMtx[2][rhsCol] );
			
			//console.log( "colVec" );
			//console.log( colVec );
						
			mtx[lhsRow][rhsCol] = Vector2D.DotProduct( rowVec, colVec );
			
			//console.log( mtx[lhsRow][rhsCol] );
			
		}//end loop		
	
	}//end loop
	
	/*
	var rowVec = new Vector2D( lhsMtx[0][0], lhsMtx[0][1], lhsMtx[0][2] );
	
	var colVec = new Vector2D( rhsMtx[0][0], rhsMtx[1][0], rhsMtx[2][0] );
	
	mtx[0][0] = Vector2D.DotProduct( rowVec, colVec );
	
	colVec = new Vector2D( rhsMtx[0][1], rhsMtx[1][1], rhsMtx[2][1] );
	
	mtx[0][1] = Vector2D.DotProduct( rowVec, colVec );
	
	colVec = new Vector2D( rhsMtx[0][2], rhsMtx[1][2], rhsMtx[2][2] );
	
	mtx[0][2] = Vector2D.DotProduct( rowVec, colVec );
	*/
	
	return mtx;
};


//added by Oliver Chong - January 10, 2014
/**
 * This converts the matrix array into a string format for the IE matrix filter
 *
 * @method ConvertToMatrixStrIEFilter
 * @param {array} aMtx : the matrix array
 * @return {string} : the converted string in the IE matrix filter format
 */
Matrix.ConvertToMatrixStrIEFilter = function( aMtx )
{
	var ieMtxStr = "progid:DXImageTransform.Microsoft.Matrix(";
	ieMtxStr += "M11=" + aMtx[0][0] + ",M12=" + aMtx[0][1] + ",M13=" + aMtx[0][2];
	ieMtxStr += ",M21=" + aMtx[1][0] + ",M22=" + aMtx[1][1] + ",M23=" + aMtx[1][2];
	ieMtxStr += ",M31=" + aMtx[2][0] + ",M32=" + aMtx[2][1] + ",M33=" + aMtx[2][2];
	ieMtxStr += ",SizingMethod='auto expand')";
	
	return ieMtxStr;
};


//added by Oliver Chong - January 10, 2014
/**
 * This converts the matrix array into a string format for the CSS Matrix Transform
 *
 * @method ConvertToMatrixStrCSSTransform
 * @param {array} aMtx : the matrix array
 * @return {string} : the converted string in the CSS Matrix Transform format
 */
Matrix.ConvertToMatrixStrCSSTransform = function( aMtx )
{
	var cssTransMtxStr = "matrix(";
	cssTransMtxStr += aMtx[0][0] + "," + aMtx[1][0] + ",";
	cssTransMtxStr += aMtx[0][1] + "," + aMtx[1][1] + ",";
	cssTransMtxStr += aMtx[0][2] + "," + aMtx[1][2];
	cssTransMtxStr += ")";
		
	return cssTransMtxStr;
};