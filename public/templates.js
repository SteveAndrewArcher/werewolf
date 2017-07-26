(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['lobby'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "		<li>"
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"name","hash":{},"data":data}) : helper)))
    + "</li>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "<p id=\"room\" class=\"instructions\"></p>\r\n<div id=\"playerlist\">\r\n<ul>\r\n";
  stack1 = ((helper = (helper = helpers.players || (depth0 != null ? depth0.players : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"players","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.players) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</ul>\r\n</div>\r\n\r\n\r\n	";
},"useData":true});
templates['day'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "		<button id=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" class=\"vote\" value=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" onclick=\"vote(this.value)\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</button><br>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "<div id=\"wolf\"></div>\r\n<div class=\"instructions\">\r\n<p>A new day has dawned!</p>\r\n<p id=\"nightresults\"></p>\r\n<p>Who's the werewolf? Vote to hang another player, or if you don't want to vote, just press the Lock In button</p>\r\n</div>\r\n<div id=\"votebuttons\">\r\n";
  stack1 = ((helper = (helper = helpers.players || (depth0 != null ? depth0.players : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"players","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.players) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\r\n<button id=\"votelocker\" class=\"lockbtn\" onclick=\"lockVote()\">Lock In</button>\r\n<input type=\"hidden\" id=\"clicked\" value=\"\">";
},"useData":true});
templates['night'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<p id=\"dayresults\" class=\"instructions\"></p>\r\n<div id=\"pick\"></div>\r\n<input type=\"hidden\" id=\"clicked\" value=\"\">\r\n<p id=\"results\" class=\"instructions\"></p>";
},"useData":true});
templates['docpick'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<button value=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" onclick=\"docSave(this.value)\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</button><br>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "<p class=\"instructions\">Who do you want to save tonight, doctor? Choose a player, and if the werewolves try to kill him or her, you'll save that player's life!</p>\r\n";
  stack1 = ((helper = (helper = helpers.players || (depth0 != null ? depth0.players : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"players","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.players) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});
templates['sherpick'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<button value=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" onclick=\"sherPick(this.value)\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</button><br>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "<div id=\"sheriff\">\r\n<p class=\"instructions\">Who do you want to investigate? Pick a player and find out if he or she is a werewolf!</p>\r\n";
  stack1 = ((helper = (helper = helpers.players || (depth0 != null ? depth0.players : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"players","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.players) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\r\n";
},"useData":true});
templates['wolfpick'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<button value=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" onclick=\"kill(this.value)\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</button><span class=\"displayvotes\">"
    + alias4(container.lambda(((stack1 = (depth0 != null ? depth0.killvotes : depth0)) != null ? stack1.length : stack1), depth0))
    + "</span><br>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "<div class=\"instructions\">\r\n<p>Night has fallen! There are "
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.werewolves : depth0)) != null ? stack1.length : stack1), depth0))
    + " werewolves left alive.</p>\r\n<p>Who do you want to kill tonight, wolves? The vote must be unanimous!</p>\r\n<p>Wolves can even vote to kill one of their own, if they think it will throw the villagers off their scent</p>\r\n<p>The number next to each name shows how many wolves have selected that player.</p>\r\n<p>When all wolves have selected the same villager, and the sheriff and doctor have completed their turns, you can lock in your selection to kill that player.</p>\r\n</div>\r\n";
  stack1 = ((helper = (helper = helpers.players || (depth0 != null ? depth0.players : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"players","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.players) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});
})();