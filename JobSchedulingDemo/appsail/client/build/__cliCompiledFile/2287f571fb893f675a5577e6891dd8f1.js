import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "RESTConnector": function() {
        return RESTConnector;
    }
});

import { RESTConnector } from "/node_modules/@slyte/data/index.js";

class ViewConnector extends RESTConnector {
    //No I18n
    // buildURL : function(modelName , type , queryParams, payLoad, url, actionName, customData){
    // 	return customData+".ec";
    // },
    processRequest({type,schemaName:modelName,payLoad:data}) {
		if( type == 'findRecord' ) {
				return new Promise(function(resolve,reject){
					resolve(JSON.stringify(
				{
						"view":{
							"id" : "111",
							"selectedFields":[{
									"name":"checkbox_column1",
									"type" : "boolean",
									"displayName":"",
									"isSortable":true,
									"isSearchEnabled":false,
									"renderingType" : "lyte-element-checkbox"
								},{
									"name" : "icons_column1",
									"type":"string",
									"displayName" : "PrefixImage",
									"isSortable" : true, 
									"isSearchEnabled" : false, 
									"renderingType" : "lyte-element-image"
								},{
									"name" : "icons_column2",
									"type":"string",
									"displayName" : "SuffixImage",
									"isSortable" : true, 
									"isSearchEnabled" : false, 
									"renderingType" : "lyte-element-image"
								},{
									"name" : "icons_column3",
									"type":"string",
									"displayName" : "dynamicImage",
									"isSortable" : true, 
									"isSearchEnabled" : false, 
									"renderingType" : "lyte-element-image"
								},{
									"name" : "icons_column4",
									"type":"string",
									"displayName" : "Image",
									"isSortable" : true, 
									"isSearchEnabled" : false, 
									"renderingType" : "lyte-element-image"
								}
								,{
									"name" : "Resource.Name",
									"type":"string",
									"renderingType" : "lyte-element-text",
									"displayName" : "Computer Name",
									"isSortable" : true, 
									"isSearchEnabled" : false
								},{
									"name" : "AgentContact.LOGGED_ON_USERS",
									"type":"string",
									"renderingType" : "lyte-element-text",
									"displayName" : "Logged On Users",
									"isSortable" : true, 
									"isSearchEnabled" : false
								},{
									"name" : "Resource.DOMAIN_NETBIOS_NAME",
									"type":"string",
									"renderingType" : "lyte-element-text",
									"displayName" : "Domain",
									"isSortable" : true, 
									"isSearchEnabled" : false
								},{
									"name" : "InvSW.SOFTWARE_NAME",
									"type":"string",
									"renderingType" : "lyte-element-text",
									"displayName" : "Operating System",
									"isSortable" : true, 
									"isSearchEnabled" : false 
								}
							],
							"fields" : [{
								"name":"InvComputerOSRel.OS_VERSION",
								"displayName":"Version"
								},{
								"name" : "InvClientScanStatus.LAST_SUCCESSFUL_SCAN",
								"displayName":"Last Successful Scan"
								}
							],
							"data" : [
	      						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status3.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"},
	     						{"checkbox_column1":"false","icons_column1":{"imgSrc":"/images/status1.gif","type":"prefix","val":"192.168.70"},"icons_column2":{"imgSrc":"/images/status3.gif","type":"suffix","val":"192.168.77"},"icons_column3":{"imgSrc":"/images/status1.gif","type":"prefix","val":"Sangeetha"},"icons_column4":{"imgSrc":"/images/status5.gif"},"Resource.Name":"jsangeetha-0849","AgentContact.LOGGED_ON_USERS":"Sangeetha","Resource.DOMAIN_NETBIOS_NAME":"Zoho Corp","InvSW.SOFTWARE_NAME":"Mac OS"}
	     					],
							"navigation":{
								"id" : "111",
								"type" : "select",
								"paginationAt" : "bottom"
							},
							"sortBy":"Resource.Name",
							"sortOrder": "desc"
						},
						"meta" : {
							"pageNo" : "1",
							"totalCount" : "50",
							"columnChooser" : true
						}
				}
				))
			});
		}else {
			return new Promise(function( resolve, reject ) {
				resolve( JSON.stringify( { "status": "200", "statusText": "OK" } ) );
			} )
		}
	}

    _() {
        _;
    }
}

export { ViewConnector };