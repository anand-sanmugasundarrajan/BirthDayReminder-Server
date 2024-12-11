'use strict';

var path,
includeStyle,
fs,
sane,
buildUtils,
buildOptions;

/** 
	buildUtils contains all necessary functions for copying and building files.
	---------------------------------------------------------------------------------------
	* Available functions :
	---------------------------------------------------------------------------------------
	* buildUtils.copy.file({options})
		-----options-----
		src : source file
		dist : destination file
		minify : [optional]	If file needs to be minified in production mode. 
			In development mode file will be copied.(default : false)
	---------------------------------------------------------------------------------------
	* buildUtils.copy.folder({options});
		-----options-----
		src : source folder
		dist : destination folder
		minify : [optional] If folder needs to be minified in production mode. 
			In development mode file will be copied.(default : false)
	---------------------------------------------------------------------------------------
	* buildUtils.consolidate({options})
		-----options-----
		configPath : path from which, consolidation mapping json can be retrived.(json file)
					(OR)
		config : consolidation mapping(mapping)
		module : consolidating module name(any string). To store consolidation mapping json
			In order to store mapping and reusing it on build watch and build serve
		file : [optional] When a particular file is changed and needs to be re-consolidated.
	---------------------------------------------------------------------------------------

**/
/** 
	For transpiling from es6 to es5 :
	---------------------------------------------------------------------------------------
	* var transpile = require(path.join(options.cliRoot,'lib','utilities','transpile'));
		transpile({options})
		----options---
		file : single file path or path of the folder, that to convert from es6 to es5 
		(OR)		     
		content : Content of the file to convert
		dist : destination file or folder
		strict : [[optional]] To enable strict mode (default : false)
		
	---------------------------------------------------------------------------------------
**/

/**
	For compiling the themes :
	---------------------------------------------------------------------------------------
	* buildUtils.compileThemes(buildOptions,{
		src : Array of src File
		dist : destination file
		themeOptions : {
			// list of less default options
		}
	})
	
	---------------------------------------------------------------------------------------
**/

module.exports = {
	version : 1,
	configureFolders : function(options) {
		path = options.path;
		options.outputFolder = "dist"; /* Folder at which the built files are to be needed. */
		options.autoBundle = true ;/* autoBundle is to bundle all (routes,components,models,mixins,helpers and router.js file)*/
		options.theming = false;
		options.useStrict = false;
		options.eslint = false;
		buildUtils = require(path.join(options.cliRoot,'lib','utilities','buildUtils'));
		var folders = { /* Available modules and its folder structures.*/
			build : 'build',
			routes : 'routes',
			routers : 'router.js',
			components : 'components',
			adapters : path.join('data-store','adapters'),
			models : path.join('data-store','models'),
			serializers :path.join('data-store','serializers'),
			mixins :'mixins',			
			javascript : path.join('components','javascript'),
			templates : path.join('components','templates'),
			helpers : path.join('components','helpers'),
			styles : path.join('components','styles'),
			images : path.join('components','images'),
			themes : path.join('css'),
			tests : 'tests'
		};
		options.folders = {};
		options.folders.src = {};
		options.folders.dist = {};
		for(var key in folders) {
			options.folders.src[key] = path.join(options.root,folders[key]) /* Source folder of modules. */
			options.folders.dist[key] = path.join(options.root,options.outputFolder,folders[key]) /* Destination folder of modules,
			can be changed if needed. */
		}		
	},

	/*-----------------------------------------------Build Process Starts-------------------------------------------*/
	build : async function (options,dependencies)  {
		fs = dependencies.fs; /* fs-extra */
		sane = dependencies.sane; /* watcher */
		buildOptions = options;
		/*configuration for transpile*/	
			options.transpile = false;
			if(options.transpile) {
				options.ignoreFoldersFromTranspile = [
					"bower_components",
					"node_modules"
				]
			}
		/* Building of modules starts. Custom modules can be added in build function. */
		await buildUtils.init(options); /* Provides options to buildUtils. */		
		await buildUtils.build(['copyAppDir','routes','components','models','helpers','mixins','services']);		
	},
	/*-----------------------------------------------Build Process ends---------------------------------------------*/

	builder : {
		/*----------------------------------Copy Task---------------------------------------------------------------*/
		copyAppDir : async function(module) {
			/* Comment folders to skip copying folders from source folder to destination folder. */
			/*By default outputFolder,routes,mixins,data-store,compdonents,build will be ignored from copying */
			/*Given folder should be relative to the root path*/
			var ignoreFolders = [
				'node_modules'	
			];
			await buildUtils._super(module,ignoreFolders);
			await buildUtils._completed(module);
		},

		/*-----------------------------------------------------------------------------------------------------------*/
		routes : async function(module) {
			
			await buildUtils._super(module); 
			/** _super of routes
			----------------------
			* Copies route files from source folder to destination folder.	
			* Minifies route files if build is in production mode.
			**/
			await buildUtils._completed(module) /* Stops the timer and notifies that the module is completed. */
		},

		/*-----------------------------------------------------------------------------------------------------------*/
		components : async function(module) {
			includeStyle = true /* styles will be included to template by default. If not needed, toggle this property. */
			await buildUtils._super(module,{includeStyle : includeStyle});
			/** _super of components
			-------------------------
			* Compiles lyte files to html.
			* Precompiles html files to get dynamic nodes.
			* Appends style to template, if present. And then to component's javascript file.
			* Copies component's files from source folder to destination folder.	
			* Minifies components files if build is in production mode.
			**/
			await buildUtils._completed(module) /* Stops the timer and notifies that the module is completed. */
		},

		/*-----------------------------------------------------------------------------------------------------------*/
		helpers : async function(module) {
			await buildUtils._super(module);
			/** _super of helpers
			----------------------
			* Copies file from source folder to destination folder(minifies if build
					is in production mode).
			**/
			await buildUtils._completed(module) /* Stops the timer and notifies that the module is completed. */
		},

		/*-----------------------------------------------------------------------------------------------------------*/
		models : async function(module) {
			await buildUtils._super(module);
			/** _super of models
			----------------------
			* Concats model, adapter and serializer to a single file(minifies if build
					is in production mode).
			* Copies file from source folder to destination folder.	
			**/
			await buildUtils._completed(module) /* Stops the timer and notifies that the module is completed. */
		},

		/*-----------------------------------------------------------------------------------------------------------*/
		mixins : async function(module) {
			await buildUtils._super(module);
			/** _super of mixins
			----------------------
			* Copies mixins files from source folder to destination folder.	
			* Minifies mixins files if build is in production mode.
			**/
			await buildUtils._completed(module) /* Stops the timer and notifies that the module is completed. */
		},
		services : async function(module) {
			
			await buildUtils._super(module); 
			/** _super of services
			----------------------
			* Copies services files from source folder to destination folder.	
			* Minifies services files if build is in production mode.
			**/
			await buildUtils._completed(module) /* Stops the timer and notifies that the module is completed. */
		},
		/*-----------------------------------------------------------------------------------------------------------*/
	},

	/*------------------------------------------Watch changes and build---------------------------------------------*/
	watcher : {
		copyAppDir : async function(module,file,modification) {
			/* Comment folders to skip copying folders from source folder to destination folder. */
			await buildUtils._super(module,{
				file : file,
				modification : modification
			});
		},
		/*----------------------------------------------------------------------------------------------------------*/
		routes : async function(module,file,modification) {
			await buildUtils._super(module,{
				file :file,
				modification : modification 
			});
			/** _super of routes on watcher
			-------------------------------
			* Copies specifed route files from source folder to destination folder.	
			* Minifies route files if build is in production mode.
			**/
		},

		/*----------------------------------------------------------------------------------------------------------*/
		components : async function(module,file,modification) {
			await buildUtils._super(module,{
				file : file,
				modification :modification,
				includeStyle : includeStyle
			});
			/** _super of components on watcher
			-----------------------------------
			* Compiles specified lyte files to html.
			* Precompiles specified html files to get dynamic nodes.
			* Appends style to template, if present. And then to component's javascript file.
			* Copies specified component's files from source folder to destination folder.	
			* Minifies specified component files if build is in production mode.
			**/
		},

		/*----------------------------------------------------------------------------------------------------------*/
		helpers : async function(module,file,modification) {
			await buildUtils._super(module,{
				file : file,
				modification : modification
			});
			/** _super of helpers on watcher
			---------------------------------
			* Copies modified file from source folder to destination folder(minifies if build is in production mode).
			**/
		},

		/*----------------------------------------------------------------------------------------------------------*/
		models : async function(module,file,modification) {
			await buildUtils._super(module,{
				file :file,
				modification :modification
			});
			/** _super of models on watcher
			-------------------------------
			* Concats model, adapter and serializer to a single file(minifies if build
					is in production mode).
			* Copies file from source folder to destination folder.	
			**/
		},

		/*----------------------------------------------------------------------------------------------------------*/
		mixins : async function(module,file,modification) {
			await buildUtils._super(module,{
				file : file,
				modification :modification
			});
			/** _super of mixins on watcher
			---------------------------------
			* Copies modified file from source folder to destination folder(minifies if build is in production mode).
			**/
		},

		services : async function(module,file,modification) {
			await buildUtils._super(module,{
				file : file,
				modification :modification
			});
			/** _super of services on watcher
			---------------------------------
			* Copies modified file from source folder to destination folder(minifies if build is in production mode).
			**/
		}

		
	}
};
