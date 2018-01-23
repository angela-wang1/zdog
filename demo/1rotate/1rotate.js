/* jshint browser: true, devel: true, unused: true, undef: true */

// *~*~*~* Bless this mess *~*~*~* //

var TAU = Math.PI * 2;
var RT2 = Math.sqrt(2);
var canvas = document.querySelector('canvas');
var rotateSlider= document.querySelector('.rotate-slider');
var ctx = canvas.getContext('2d');
var w = 48;
var h = 64;
var zoom = 8;
var canvasWidth = canvas.width = w * zoom;
var canvasHeight = canvas.height = h * zoom;
// colors
var colors = {
  fur: '#EA0',
  eye: '#333',
  inner: 'white',
  cloth: '#F18',
  armor: '#804',
};

var isRotating = true;
var angleY = 0;
var rYCos, rYSin;
var persp = 0.5;

// -- Pseudo Vector3 class -- //

function Vector3( x, y, z ) {
  this.x = x;
  this.y = y;
  this.z = z;
}

Vector3.prototype.update = function() {
  var rzx = rYSin * -this.z;
  var rzy = rYCos * -this.z;
  var zx = this.x * rYCos;
  var zy = this.x * -rYSin;
  this.renderZ = rzy + zy;
  this.renderX = rzx + zx + w/2;
  this.renderY = this.renderZ * persp + this.y;
};

// -- Shape class -- //

// collection of shapes
var shapes = [];

function Shape( properties ) {
  // default
  this.stroke = true;
  this.fill = false;
  this.lineWidth = 1;
  this.closed = true;
  // extend properties
  for ( var propName in properties ) {
    this[ propName ] = properties[ propName ];
  }
  // convert plain ol' object to Vector3 object
  this.points = this.points.map( function( point ) {
    return new Vector3( point.x, point.y, point.z );
  });

  // add to collection
  shapes.push( this );
}

Shape.prototype.update = function() {
  var sortValueTotal = 0;
  this.points.forEach( function( point ) {
    point.update();
    sortValueTotal += point.y - point.renderZ;
  });

  // average sort value of all points
  // def not geometrically correct, but works for me
  this.sortValue = sortValueTotal / this.points.length;
};

// HACK, maybe use array?
// var renderProps = {
//   lineCap: true,
//   lineJoin: true,
//   strokeStyle: true,
//   fillStyle: true,
// }

Shape.prototype.render = function() {
  // set default color
  ctx.fillStyle = this.color;
  ctx.strokeStyle = this.color;
  // set any render properties
  ctx.lineWidth = this.lineWidth;
  ctx.lineCap = 'round';
  // console.log( this.lineWidth );
  // for ( var renderPropName in renderProps ) {
  //   var renderProp = this[ renderProp ];
  //   if ( renderProp ) {
  //     ctx[ renderPropName ] = renderProp;
  //   }
  // }

  // render points
  ctx.beginPath();
  this.points.forEach( function( point, i ) {
    // moveTo first point, lineTo others
    var renderMethod = i ? 'lineTo' : 'moveTo';
    ctx[ renderMethod ]( point.renderX, point.renderY );
    // console.log( renderMethod, point.renderX, point.renderY );
  });
  // close path by return to first point
  var length = this.points.length;
  var isOnePoint = length == 1;
  var isClosed = this.closed && length > 2;
  if ( isOnePoint || isClosed ) {
    var point0 = this.points[0];
    ctx.lineTo( point0.renderX, point0.renderY );
  }
  if ( this.stroke ) {
    ctx.stroke();
    // console.log('stroke');
  }
  if ( this.fill ) {
    ctx.fill();
  }
  // debugger;
  ctx.closePath();
};

// -- illustration shapes --- //

// body center
new Shape({
  points: [
    { x: 0, y: 42, z: 0 },
    { x: 0, y: 44, z: 0 },
  ],
  color: colors.inner,
  lineWidth: 12,
});

// head circle
new Shape({
  points: [
    { x: 0, y: 24, z: 0 },
  ],
  color: colors.fur,
  lineWidth: 32,
});


// left eye
new Shape({
  points: [
    { x: -8, y: 22, z: -8*RT2 },
    { x: -8, y: 26, z: -8*RT2 },
  ],
  color: colors.eye,
  lineWidth: 4,
});

// right eye
new Shape({
  points: [
    { x: 8, y: 22, z: -8*RT2 },
    { x: 8, y: 26, z: -8*RT2 },
  ],
  color: colors.eye,
  lineWidth: 4,
});

// left ear
new Shape({
  points: [
    { x: -9, y: 10, z: 5 },
    { x: -9, y: 18, z: 5 },
  ],
  color: colors.fur,
  lineWidth: 14,
});
// right ear
new Shape({
  points: [
    { x: 9, y: 10, z: 5 },
    { x: 9, y: 18, z: 5 },
  ],
  color: colors.fur,
  lineWidth: 14,
});

// left shoulder
new Shape({
  points: [
    // { x: -8, y: 38, z: 2 },
    { x: -12, y: 38, z: 2 },
    { x: -12, y: 40, z: 2 },
  ],
  color: colors.armor,
  lineWidth: 8,
});
// right shoulder
new Shape({
  points: [
    { x: 12, y: 38, z: 2 },
    { x: 12, y: 40, z: 2 },
  ],
  color: colors.armor,
  lineWidth: 8,
});

// left arm
new Shape({
  points: [
    { x: -12, y: 42, z: 2 },
    { x: -12, y: 44, z: 2 },
  ],
  color: colors.fur,
  lineWidth: 8,
});
// right arm
new Shape({
  points: [
    { x: 12, y: 42, z: 2 },
    { x: 12, y: 44, z: 2 },
  ],
  color: colors.fur,
  lineWidth: 8,
});

// left hand
new Shape({
  points: [ { x: -11, y: 46, z: 1} ],
  color: colors.armor,
  lineWidth: 10,
});
// right hand
new Shape({
  points: [ { x: 11, y: 46, z: 1} ],
  color: colors.armor,
  lineWidth: 10,
});

// left leg
new Shape({
  points: [
    { x: -5, y: 48, z: 0 },
    { x: -5, y: 52, z: 0 },
  ],
  color: colors.armor,
  lineWidth: 8,
});
// right leg
new Shape({
  points: [
    { x: 5, y: 48, z: 0 },
    { x: 5, y: 52, z: 0 },
  ],
  color: colors.armor,
  lineWidth: 8,
});


// front robe
new Shape({
  points: [
    { x: -8, y: 37, z: -8 },
    { x: 8, y: 37, z: -8 },
    { x: 8, y: 47, z: -8 },
    { x: -8, y: 47, z: -8 },
  ],
  fill: true,
  // closed: true,
  color: colors.cloth,
  lineWidth: 4,
});
// back robe
new Shape({
  points: [
    { x: -8, y: 37, z: 8 },
    { x: 8, y: 37, z: 8 },
    { x: 8, y: 47, z: 8 },
    { x: -8, y: 47, z: 8 },
  ],
  fill: true,
  // closed: true,
  color: colors.cloth,
  lineWidth: 4,
});

// -- animate --- //


function animate() {
  update();
  render();
  requestAnimationFrame( animate );
}

animate();

// -- update -- //

function update() {
  // rotate
  angleY += isRotating ? TAU/180 : 0;
  rYCos = Math.cos( angleY );
  rYSin = Math.sin( angleY );
  // perspective sort
  shapes.sort( function( a, b ) {
    return ( b.sortValue ) - ( a.sortValue );
  });
  // render shapes
  shapes.forEach( function( shape ) {
    shape.update();
  });
}

// -- render -- //

function render() {
  ctx.clearRect( 0, 0, canvasWidth, canvasHeight );
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

  ctx.save();
  ctx.scale( zoom, zoom );

  shapes.forEach( function( shape ) {
    shape.render();
  });

  ctx.restore();
}

// ----- inputs ----- //

rotateSlider.addEventListener( 'input', function() {
  isRotating = false;
  angleY = parseInt( rotateSlider.value ) / 360 * TAU;
  // console.log( rotateSlider.value )
});
