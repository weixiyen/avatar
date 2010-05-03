this.create = function(){

  var s = [], itoh = '0123456789ABCDEF';
  
  for (var i = 0; i <36; i++) s[i] = Math.floor(Math.random()*0x10);

  s[14] = 4;  // Set 4 high bits of time_high field to version

  s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence
  
  for (var i = 0; i <36; i++) s[i] = itoh[s[i]];

  s[8] = s[13] = s[18] = s[23] = '-';

  return s.join('');

}