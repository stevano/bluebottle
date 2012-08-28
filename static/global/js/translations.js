var dict = {};
dict['en'] = {
  'HOME': 'HOME',
  'PROJECTS': '1%PROJECTS', 
  'TASKS': '1%TASKS', 
  'ACTIONS': '1%FUNDRAISERS', 
};

dict['nl'] = {
  'HOME': 'THUIS',
  'PROJECTS': '1%PROJECTEN', 
  'TASKS': '1%TAKEN', 
  'ACTIONS': '1%ACTIES', 
  'LEARN MORE': 'MEER OVER 1%', 
};

require(['libs/i18n'], function(){
  I18n.locale = 'nl';
  I18n.translations = dict;
  Handlebars.registerHelper('t', function(str){
    return (I18n != undefined ? I18n.t(str) : str);
  });
  
});