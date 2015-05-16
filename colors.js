/**
 * Created with IntelliJ IDEA.
 * User: mfo
 * Date: 5/12/15
 * Time: 11:24 PM
 */

module.exports.parseColor = function(color) {
  if (typeof color === 'string') {
    return parseColorString(color.toLocaleLowerCase());
  } else {
    return color;
  }
};

function parseColorString(color) {
  var colors = {
    red: 0xff0000,
    darkred: 0x880000,
    green: 0x00ff00,
    darkgreen: 0x008800,
    blue: 0x0000ff,
    darkblue: 0x000080,
    orange: 0xffa500,
    darkorange: 0x885200,
    purple: 0x800080,
    darkpurple: 0x400040,
    yellow: 0xffff00,
    darkyellow: 0x888800,
    white: 0xffffff,
    gray: 0x808080,
    darkgray: 0xffffff,
    none: 0x000000,
    off: 0x000000
  };

  if (colors.hasOwnProperty(color)) {
    return colors[color];
  } else {
    return 0x000000;
  }
}
