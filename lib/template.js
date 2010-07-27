var sys = require('sys'),
    path = require('path'),
    fs = require('fs');
require('./underscore');

_.templateSettings = {
  start       : '{{',
  end         : '}}',
  interpolate : /\{\{(.+?)\}\}/g
};

var templates = compileTemplates('templates');

function compileTemplates(dir) {
  var tmpl_path = path.join(process.cwd(), dir + '/'),
      templates = fs.readdirSync(tmpl_path),
      template_obj = [];
  sys.log(tmpl_path);
  for (var i=0; i < templates.length; i++) {
      if (templates[i].substr(templates[i].length-5) === '.html') {
        template_obj[dir + '/' + templates[i]] = fs.readFileSync(tmpl_path + templates[i]);
      } else {
        compileTemplates(dir + '/' + templates[i]);
      }
  }
  return template_obj;
}

this.render = function(tmpl_path, tmpl_vars) {
    var template = _.template(templates['templates/'+tmpl_path]);
    return template(tmpl_vars);
};