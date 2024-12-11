import { getBackwardRel, initCB } from "./utils";

function buildVariables(gqlvar, variables, key, type){
	gqlvar=gqlvar?gqlvar:{};
	for(var v in variables){
		if(variables[v].search(/!/g)!=-1){
			if(!gqlvar[v] && !key ){
				return {LdEr:"LD30",LyteError:"ERR30","key":v};
			}
		}
		if(variables[v].search(/!/g)!=-1){
			variables[v]=variables[v].replace(/!/g,"");
		}
		if(key && variables[v].search(/\./g)==-1){
			if(variables[v]=="ID" || variables[v]=="ID!"){
				gqlvar[v]=key;
			}
		}
		var ErrObj={LdEr:"LD31",LyteError:"ERR30","key":v};
		if(gqlvar && gqlvar[v]){
			switch(variables[v]){
				case "Int":
					if(typeof gqlvar[v] != "number"){
						return ErrObj;
					}
					break;
				case "String":
					if(typeof gqlvar[v] != "string"){
						return ErrObj;
					}
					break;
				case "Float":
					if(typeof gqlvar[v] != "number"){
						return ErrObj;
					}
					break;
				case "Boolean":
					if(typeof gqlvar[v]!="boolean"){
						return ErrObj;
					}
					break;
				case "Object":
					if(typeof gqlvar[v]!="object"){
						return ErrObj;
					}
					break;
			}
		}
	}
		for(var t in gqlvar){
			if(typeof gqlvar[t] == "string"||typeof gqlvar[t] == "object"){
				gqlvar[t]=LyteStringfy(gqlvar[t],"")
			}
		}
	return gqlvar;
}

function buildQuery(def,type,fieldArr,variables,parent,qname,sendvar,key,LocalAttrs,Pmodel){
	var str="",ignore=false;
	for(var v in fieldArr){
		if (typeof(fieldArr[v]) == "object"){
			   str+=Object.keys(fieldArr)[0]+" ";
			if(sendvar){
				str+="( ";
				//str+=(key?"id: "+key:'')+" ";
				for(var s in sendvar){
					if(s.search(/[.]/g)==-1 && parent ==''){
						str+=s+":"+sendvar[s]+" ";
					}
					else if(parent!='' && s.search(/[.]/g)!=-1){
						//var pcheck=s.replace(".","_");
						if(parent == s.match(/.*(?=\..*$)/g)[0]){
							var split= s.split('.');
							str+=split[split.length-1]+":"+sendvar[s]+" ";
						}
					}
				}
				str+=") ";
				str = str.replace(/\([ ]*\)/g,"");
			}
			str+="{ ";
			for(var i =0; i<fieldArr[v].length;  i++){
				var v1 = fieldArr[v][i];
				ignore=false;
				if(LocalAttrs){
					ignore = (typeof(v1) == "string" && LocalAttrs.includes(v1) && parent == "")?true:(typeof v1 == "object" && LocalAttrs.includes(Object.keys(v1)[0]) && parent == "")?true:false
				}
				if(!ignore){
					if(typeof(v1) == "string"){
						str=str+v1+" ";
					}
					else{
						parent=(parent?parent+".":"")+Object.keys(v1)[0]
						str+=buildQuery(def,type,v1,variables,parent,qname,sendvar,key,LocalAttrs,Pmodel);
						parent=(v==qname)?"":v;
					}
				}
			}
			str+=" } ";
		}
	}
	return str;
}

function QueryCallback(db,def,type,parent,fieldArr,variables,qstuct,qv,queryParams,urlObj,argsObj){
	var mdl, defObj = db.getSchemaObj(def._name), rMdl;
	if (typeof(fieldArr)== "object"){
		var key = Object.keys(fieldArr)[0];
		for(var i=0; i<fieldArr[key].length; i++){
			var v = fieldArr[key][i];
			if(typeof v ==  "object" && defObj && defObj.fieldList[Object.keys(v)[0]] && defObj.fieldList[Object.keys(v)[0]].relatedTo){
				rMdl=defObj.fieldList[Object.keys(v)[0]].relatedTo;
				QueryCallback(db,rMdl,type,parent,v,variables,qstuct,qv,queryParams,urlObj,argsObj);
			}
		}
		//console.log("selfquery",modelName,fieldArr,variables);
		argsObj.selfGqlObj = {
            query: fieldArr,
            variables: variables
        };
		var res =  initCB(db,"serializer", defObj.serializer, /*RESTConnector.PARSEREQUEST*/ "serializeSelfQuery", { argsObj:argsObj, args:[def._name,type,urlObj,fieldArr,variables,qstuct]});;
		if(res && res.data){
			var qst= res.data[Object.keys(fieldArr)[0]];
			fieldArr[Object.keys(fieldArr)[0]]=qst;
		}
		delete argsObj.selfGqlObj;
	}
	// modelName=parent;
}

function buildFields(db, def ,parent , key, pModel, marr, properties){
	var mdl = def, mdlfl = mdl.fieldList;
	var LocalAttrs=(mdl.connector.gql && mdl.connector.gql.localAttrs) ? mdl.connector.gql.localAttrs:[];
	if(!properties){
		marr.set(def.def, true);
	}
	else{
		mdlfl = properties;
	}
	var obj = {},arr =[];
	for( var v in mdlfl){
		if(!LocalAttrs.includes(v)){
			if (mdlfl[v].type == "relation" ){
				if(mdlfl[v].relatedTo && mdlfl[v].relatedTo!=pModel && mdlfl[v].relatedTo != def.def){
					var bRelMod = mdlfl[v].relatedTo ? db.getSchemaObj(mdlfl[v].relatedTo._name) : undefined;
					var check = getBackwardRel(mdl, mdlfl[v], bRelMod);
					if(check && check.relatedTo == parent && check.dummy == undefined){
						continue;
					}
					else{
						if(!marr.has(mdlfl[v].relatedTo)){
							var relMod = mdlfl[v].relatedTo ? db.getSchemaObj(mdlfl[v].relatedTo._name) : undefined;
							arr.push(buildFields(db, relMod, mdlfl[v].relatedTo,v,pModel,marr));
						}
					}
				}
				continue;
			}
			else if( mdlfl[v].type == "object" && mdlfl[v].properties){
				arr.push(buildFields(db,def,parent,v,pModel,marr,mdlfl[v].properties))
			}
			else{
				arr.push(v);
			}
		}
	}
	obj[key] = arr;
	marr.delete(def.def);
	return obj;
}

function parseQuery(db,def,key,type,queryParams,gqlObj,mdlq,gqlvar,urlObj,LocalAttrs,data,customData,argsObj){
	var qstr,qv,qlvar={},ret={},sendvar,qkey={};
	if(typeof(mdlq) == "object"){
		var qstuct,sq,mparent,k;
		var k = Object.keys(mdlq.query);
		var queryName = k[0]!="variables"?k[0]:k[1];			
		qv=Object.assign({},mdlq.query.variables);
		qkey[k[0]!="variables"?k[0]:k[1]]=Object.assign(mdlq.query[k[0]!="variables"?k[0]:k[1]]);
		if(typeof(qkey) == "object"){
			qstuct = qkey;
		}
	}
	if(typeof(mdlq) == "string" && mdlq.search(/[ ]/g)!=-1){
		var cquery = mdlq,cvar={},qst='';
		cquery=cquery.replace(new RegExp('\n','g')," ");
		cquery=cquery.replace(/ *[ ]*\(/g,":{variables:[");
		cquery=cquery.replace(/ *\) *{/g,"],attrs:[");
		cquery=cquery.replace(/\w+/g,'"$&"');
		cquery=cquery.replace(/"!/g,'!"')
		cquery=cquery.replace(/" +"/g,'", "');
		cquery=cquery.replace(/\S+{"variables"/g,"{$&");
		cquery=cquery.replace(/} *"/g,'}, "')
		cquery=cquery.replace(/" *{/g,'" :{"attrs" :[')
		cquery=cquery.replace(/\} *\}/g,"]}}");
		cquery=cquery.replace(/" *}/g,'"]} }');
		cquery=cquery.replace(/]}}/g,"]}}]}}");
		cquery=cquery.replace(/]}}]}} *}/g,"]}}]}}]}}")
		cquery=cquery.replace(/} *{/g,"},{");
		cquery=cquery.replace(/\S+ *:{"attrs"/g,"{$&");
		cquery=JSON.parse(cquery);
		qstuct=buildQueryFields(cquery,cvar,qst,Object.keys(cquery)[0]);
		qv=cvar;
	}
	if(typeof(qstuct) == "object"){
		QueryCallback(db,def,type,def._name,qstuct,gqlvar,qstuct,qv,queryParams,urlObj,argsObj)
		gqlObj.query=qstuct;
		if(gqlvar){
			gqlObj.variables=gqlvar;
		}
		var qvkey = Object.keys(qv)[0];
		gqlObj.type == "Mutation" && Object.keys(qv).length == 1 && (qv[qvkey]=="Object" || qv[qvkey] =="Object!")?gqlObj.variables[qvkey]=data:gqlObj.variables;
		argsObj.gqlObj = gqlObj;
		var res =  initCB(db,"serializer", def.serializer, "serializeGqlQuery", { argsObj:argsObj });
		if(res && res.data){
			qstuct = res.data.query;
			if(res.data.variables){
				gqlvar = res.data.variables;
			}
		}
		sendvar = buildVariables(gqlvar,qv,key,urlObj.type);
		if(sendvar && sendvar.LdEr){
			return sendvar;
		}
		urlObj.gqlObj=gqlObj;
		qstr = buildQuery(def,type,qstuct,qv,'',Object.keys(qstuct)[0],Object.keys(sendvar).length!=0?sendvar:undefined,key,LocalAttrs,def._name);
		qstr='{ '+qstr+' }';
	}
	gqlObj.type == "Query"?ret.query=qstr:ret.query = 'mutation '+qstr;		
	return ret;
}

function graphQlconfig(db, def, key, type, queryParams, oprName, gqlvar, urlObj, data,customData,argsObj){
	var gQobj={}, model=def, mdlq, mdq, gqlObj={}, mp = new Map();
	var LocalAttrs=(model.connector.gql && model.connector.gql.localAttrs)?model.connector.gql.localAttrs:[];
	// var defObj = db.getSchemaObj(def._name);
	if(type == "getAll" || type =="getEntity"){
		gqlObj.type="Query";
		mdq = def && def.connector && def.connector.gql && def.connector.gql.query && def.connector.gql.query[oprName] ?  def.connector.gql.query[oprName] :oprName;
		if(mdq === undefined ){
			var stq = buildFields(db, def, null, def._name,def,mp); 
			mdlq={};
			mdlq.query=stq;
			gqlObj.queryType="default"
		}
		else{
			if(typeof(oprName) == "string" && oprName.search(/[ ]/g)!=-1){
				mdlq=oprName;
				gqlObj.queryType="query"
			}
			else if(typeof(oprName) == "object"){
				mdlq=oprName;
			}
			else if(typeof(mdq) == "object"){
				mdlq=mdq;
			}
			else {
				if (typeof(mdq) == "string" && mdq.search(/[ ]/g)!=-1){
					mdlq = mdq;
					gqlObj.queryType="namedQuery";
					gqlObj.queryName=oprName;	
				}
				else{
					return {LdEr:"LD32",LyteError:"ERR31",key:oprName};
				}
			}
		}
		gqlvar=gqlvar?Object.assign({},gqlvar):undefined;
	}
	else{
		gqlObj.type="Mutation";
		mdq = (model.connector.gql && model.connector.gql.mutation && model.connector.gql.mutation[oprName]) ?  model.connector.gql.mutation[oprName] :oprName;
		if(typeof(oprName) == "string" && oprName.search(/[ ]/g)!=-1){
			mdlq=oprName;
			gqlObj.mutationType="customMutation";
		}
		else{
			if(typeof(mdq) == "string" && mdq.search(/[ ]/g)!=-1){
				mdlq = mdq;
				gqlObj.mutationType = "namedMutation";
				gqlObj.mutationName = oprName;
			}
			else{
				return {LdEr:"LD32",LyteError:"ERR31",key:oprName};
			}
		}
		gqlObj.data = data;
	}
	var sendQuery = parseQuery(db,def,key,type,queryParams,gqlObj,mdlq,gqlvar,urlObj,LocalAttrs,data,customData,argsObj);
	if(!sendQuery.LdEr){
		gQobj.data = JSON.stringify(sendQuery);
		return gQobj.data;
	}
	return sendQuery;
}

function setQuery(scope,key,type,Query){
	var model = scope;
	if(model.gql){
		model.gql[type]=model.gql[type]?model.gql[type]:{};
		model.gql[type][key]=model.gql[type][key]?model.gql[type][key]:{}
	}
	else{
		model.gql={};
		model.gql[type]={};
		model.gql[type][key]={};
	}
	model.gql[type][key]=Query;
}

function buildQueryFields(fields,variable,parent,objkey){
	var key = Object.keys(fields)[0],arr=[],query={};
	if(fields[key].variables){
		for(var i=0; i<fields[key].variables.length; i=i+2){
			variable[(parent?parent+".":"")+fields[key].variables[i]]=fields[key].variables[i+1];
		}
	}
	for(var q=0; q<fields[key].attrs.length; q++){
		if(typeof fields[key].attrs[q] == "object"){
			parent=(parent?parent+".":"")+Object.keys(fields[key].attrs[q])[0];
			arr.push(buildQueryFields(fields[key].attrs[q],variable,parent,objkey));
			parent=(key != objkey)?key:"";
		}
		else{
			arr.push(fields[key].attrs[q]);
		}
	}
	query[key]=arr;
	return query;
}

function cpdGql(db, def, type, qp, mutName, createdVariables, urlObj, data, customData, argsObj){
	if(urlObj.gql){
		if(typeof urlObj.gql == "object"){
			mutName = urlObj.gql.mutation;
		}else if(urlObj.gql == true){
			mutName = createdVariables = undefined;
		}
		urlObj.data = graphQlconfig(db, def,undefined,type,qp,mutName,createdVariables,urlObj,data,customData, argsObj)
	}
}

function LyteStringfy (object,string,fs){
	if(typeof object == "string"){
		return '\"'+object+'"\ '
	}
	else if(Array.isArray(object)){
		string+='[';
		var i=0,len = object.length;
		object.forEach(function(val){
			i++;
			if(typeof val == "string"){
				string=string+'\"'+val+'"\ ';
			}
			else if(typeof val == "object"){
				string=LyteStringfy(val,string);
			}
			else if(typeof val == "number"){
				string=string+object.toString();
			}
			string=(i!=len)?string+',':string;
		})
		string+=']';
	}
	else if (!Array.isArray(object) && typeof object == "object"){
		string=string+'{';
		var j =0;
		for(var i in object){
			j++;
			if(typeof object[i] == "string"){
				string=string+i+' : \"'+object[i]+'"\ ';
			}
			else if(typeof object[i] == "object"){
				string=string+i+" : "
				string = LyteStringfy(object[i],string)
			}
			else{
				string=string+i+' : '+object[i].toString()
			}

			if(Object.keys(object).length!=j){
				string = string+', '
			}
		}
		string=string+'}'
	}
	else{
		 return object.toString();
	}
	return string;
}

export { graphQlconfig, cpdGql }