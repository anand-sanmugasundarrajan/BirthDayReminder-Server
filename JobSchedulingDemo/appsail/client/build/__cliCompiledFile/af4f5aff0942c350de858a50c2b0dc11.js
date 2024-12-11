"use strict";
var errorFlag;
var errorCount = [0];
var expHandlers = {
	checkForError : function(errorMsg,node,isIgnore) {
		this.message = errorMsg;
		this.node = node;
		return this;
	},

	handleCallExpression : function(node,isIgnore,escape){
		var output = "";
		if(node.callee.type == "MemberExpression") {
			throw new this.checkForError("Only helper function calls are allowed",node.callee);
		}
		if(node.callee.name){
			output += node.callee.name+"(";
		}else{
			output += this.getValueBasedOnType(node.callee,isIgnore)+"(";
		}
		output += this.handleCallArguments(node,isIgnore).toString();
		output += ")";
		return output;
	},

	handleCallArguments : function(node,isIgnore,escape){
			var output = [];
			var forArg = node.arguments;
			for(var k=0;k<forArg.length;k++){
				if(forArg[k].type == "CallExpression"){
						output.push(this.handleCallExpression(forArg[k],isIgnore));
				}else {
					output.push(this.getValueBasedOnType(forArg[k],isIgnore,escape));//.name;
				}
			}
			return output.toString();
	},
	
	handleMemberExpression : function(node,isIgnore,output){
		var val ="";
		if(node.object.name){
			val += node.object.name;
		}else if(node.object.type == "CallExpression"){
			val += this.getValueBasedOnType(node.object,isIgnore);
			//helperFnParams.push(handleCallArguments(node.object,true).toString());
		}else {
			val += this.getValueBasedOnType(node.object,isIgnore);
		}
		if(node.computed ) {			
			val += "["+this.getValueBasedOnType(node.property,isIgnore)+"]"
		}			
		else if(node.property.name){
			val += "." + node.property.name;
		}
		return val;
	},

	getValueBasedOnType : function(node,isIgnore,switchcase,output,escape){
		switch(node.type){
			case "Identifier":
				return node.name;
			break;
			case "ThisExpression" : 
				return "this";
			break;
			case "Literal":
				if(escape){
					return node.raw.replace(/"/g,'\\"');
				}
				if(typeof node.value != "boolean" && typeof node.value != "number") {
					// console.log(node.raw.replace(/\\([\s\S])|(")/g,"\\$1$2"));
					if(switchcase) {
						return node.value.replace(/\ /g,'&#32;');
					} else if(!isIgnore) {
					 	return node.raw.replace(/\"/g,'&quot;');
					} else {
						return node.raw
					}
					// return "'"+node.value+"'";
				}
				return node.value;
			break;
			case "ObjectExpression":
				return this.handleObjectExpression(node,isIgnore,output);
				break;
			default : 
				return this.handleConditionStmt(node,isIgnore,output);
		}
	},

	handleObjectExpression: function(node,isIgnore,output){
		var obj = []; 
		var prop = node.properties;
		prop.forEach(function(item ,index){
			obj.push(this.getValueBasedOnType(item.key,isIgnore)+":"+this.getValueBasedOnType(item.value,isIgnore));
		});
		return "{"+obj.toString()+"}";
	},
	
	handleConditionStmt : function(node,isIgnore,output){ 
		var output = ""; 
		if(node.type == "LogicalExpression" || node.type == "BinaryExpression" || node.type =="AssignmentExpression"){
			output += "expHandlers(";
			output += this.handleConditionStmt(node.left,isIgnore);
			output += ",'" + this.checkOperator(node.operator,isIgnore)+"',";
			output += this.handleConditionStmt(node.right,isIgnore);
			output += ")";
		} else if(node.type == "CallExpression"){
			output += this.handleCallExpression(node,isIgnore);
		} else if(node.type == "Literal"){
			output += this.getValueBasedOnType(node,isIgnore);
		} else if(node.type === "MemberExpression"){
			var memberVal = this.handleMemberExpression(node,isIgnore);
			output += memberVal;
		} else if(node.type == "UpdateExpression"){
			var val = this.getValueBasedOnType(node.argument,isIgnore);
			output += "expHandlers("+val+",";
			output += this.getValueBasedOnOperation(node,isIgnore)+",";
			if(node.prefix == false) {
				output += "\"postfix\"";
			} else if(node.prefix == true) {
				output += "\"prefix\"";
			}
			output += ')';
		} else if(node.type == "Identifier") {
			output += node.name;
		} else if(node.type == "ThisExpression") {
			output += "this";
		} else if(node.type == "UnaryExpression") {
			output += "expHandlers("+this.getValueBasedOnType(node.argument,isIgnore)+",'" + node.operator +"')";
		}
		
		return output;
	},

	checkOperator : function(operator,isIgnore) {
		if(operator == ">") {
			operator = isIgnore ? ">" : '&gt;';
		} else if(operator ==">="){
			operator = isIgnore ? ">=" : '&gt;=';
		}
		return operator;
	},

	getValueBasedOnOperation : function(node,isIgnore,output) {
		if(node.operator) {
			return ("'"+node.operator+"'")
		}
	},

	handleExpression : function(node,isIgnore,output) {
		var fnbody = node.body;
		for(var i=0; i<fnbody.length; i++) {
			var type = fnbody[i].type;
			switch(type) {
				case "BlockStatement" : 
					output = this.handleExpression(fnbody[i],isIgnore);
					break;
				case "ExpressionStatement" :
					var exfnBodyType = fnbody[i].expression.type;
					if(exfnBodyType == "CallExpression"){
						output = this.handleCallExpression(fnbody[i].expression,isIgnore);
					} else if(exfnBodyType == "Identifier" || exfnBodyType === "ThisExpression") {
						output = this.getValueBasedOnType(fnbody[i].expression,isIgnore);
					} else if(exfnBodyType == "MemberExpression") {
						output = this.handleMemberExpression(fnbody[i].expression,isIgnore);
					} else {
						output = this.handleConditionStmt(fnbody[i].expression,isIgnore);
					}
				    break;
				case "IfStatement" :
					output = this.handleConditionStmt(fnbody[i].test,isIgnore);
					break;
				case "SwitchStatement" :
					output = this.handleConditionStmt(fnbody[i].discriminant,isIgnore);
					break;					
			}
		}
		return output;
	}	
}
if(typeof module !== "undefined") {
	module.exports = expHandlers;	
}