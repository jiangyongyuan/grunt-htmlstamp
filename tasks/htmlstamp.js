/*
 * grunt-htmlstamp
 * https://github.com/helinjiang/grunt-htmlstamp
 *
 * Copyright (c) 2015 helinjiang
 * Licensed under the MIT license.
 */
'use strict';

var cheerio = require('cheerio');
var util = require('../lib/util');
var tool = require('../lib/tool');

function getHash(content, encoding) {
    return util.getHash(content, encoding, 'sha1');
}

module.exports = function (grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('htmlstamp', 'deal with html for js or css link', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            type: 'suffix', // 以哪种形式追加，suffix:后缀模式，embed:嵌入模式，inline：内联模式
            appendType: 'time', // 追加什么类型的字符串，time:时间戳形式，hash:hash形式，用于type=suffix和embed模式
            //suffixKey: '_v', // 后缀的key，用于type=suffix模式
            hashFunction: getHash, // 当appendType=hash时获得hash值的函数，用于type=suffix和embed模式
            timestampFormat: 'yymmddHHMMss', // 当appendType=time时，设定时间戳的格式
            //customAppend: '', // TODO 除了自动生成的时间戳或hash之外，再追加的字符串，例如自定义的版本号等
            shim: {}, // 需要修正的对应关系，key值为当前正使用的文件，value值为替换key值的新的文件，用于type=suffix和embed模式
            requirejsConfigUrl: '', // 针对RequireJS的特别的配置，为配置requirejs.config的文件
            requirejsBaseUrl: '' // 针对RequireJS的特别的配置，为配置requirejs.config中的baseUrl，但该地址是相对于Gruntfile.js的路径
            ,src:'',
            dest:'',
            patten:'**/*.html',
            comboCss:'**/*.css'
        });

        /**
         * shim的config对象
         * 注意：当shim中key值有变量时，变量未被解析，此处要处理一下
         * https://github.com/helinjiang/grunt-htmlstamp/issues/1
         * @type {{}}
         */
        var shimConfig = {},
            shimKeys = Object.keys(options.shim);

        shimKeys.forEach(function (key) {
            shimConfig[grunt.config.process(key)] = options.shim[key];
        });

        /**
         * 是否为requirejs场景，只要配置了requirejsConfigUrl，且该文件存在，则为true
         * @type {Boolean}
         */
        var isRequireJS = false;
        if (options.requirejsConfigUrl && grunt.file.exists(options.requirejsConfigUrl)) {
            isRequireJS = true;
        }

        /**
         * script标签上获取和操作url的属性值，默认为'src'，但在requirejs场景时，需要操作data-main。
         * @type {String}
         */
        var scriptAttr = isRequireJS ? 'data-main' : 'src';

        /**
         * 当前的任务目标，例如‘requirejs_embed_hash’等，用于在多任务场景下时，根据任务名缓存一些信息，避免重复计算
         * @type {String}
         */
        var taskTarget = this.target;

        var srcFiles = grunt.file.expand( options.src + options.patten );
        var cssFiles = grunt.file.expand( options.comboCss );


        // Iterate over all specified file groups.
        //this.srcFiles.forEach(function (f) {
        for( var i = 0 ; i < srcFiles.length ; i++ ){

            var f = srcFiles[i];

            /**
             * html实际的文件路径，相对Gruntfile.js的路径
             * @type {String}
             */
            var htmlFilePath = f;// f.dest;

            var srcArr = cssFiles;//f.src;

            //如果isRequireJS模式，则在src中追加options.requirejsConfigUrl
            if (isRequireJS) {
                srcArr.push(options.requirejsConfigUrl);
            }

            /**
             * js和css的文件数组
             * @type {Array}
             */
            var fileArr = srcArr.filter(function (filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function (filePath) {

                /**
                 * js和css实际的文件路径，相对Gruntfile.js的路径
                 * @type {String}
                 */
                var jsCssFilePath = filePath;

                /**
                 * 最终要追加的字符串，可能是时间戳或者hash值等
                 * @type {String}
                 */
                var appendStr = tool.getAppendStr(grunt, options, jsCssFilePath);

                /**
                 * js或css文件相对于html文件的路径
                 * @type {String}
                 */
                var filePathInHtml = util.getRelativeUrl(htmlFilePath, jsCssFilePath);

                /**
                 * js物理路径jscssFilePath为：test/fixtures/test1.js，html物理路径htmlFilePath为：test/fixtures/index1.html
                 * js在html中引用的路径filePathInHtml可能为：test1.js或者./test1.js
                 * 如果是后缀模式，后缀值appendStr为：20151105151923，
                 * 则需要将html中的js地址修改为(./)test1.js?_v=20151105151923
                 * 因此针对每一个html中的js文件，需要将(./)xxx.js修改为(./)xxx.js?_v=yyyy
                 * {
                 *  filePath:"test/fixtures/test1.js",
                 *  filePathInHtml:"test1.js",
                 *  appendStr:"20151105151923"
                 * }
                 */
                var item = {
                    filePath: filePath, // 相对于Gruntfile.js的路径
                    filePathInHtml: filePathInHtml,// 相对于html的路径
                    appendStr: appendStr
                };

                // 如果在shim中配置了该路径的shim值，则追加之
                var shimPath = shimConfig[filePath];
                if (shimPath) {
                    item.shimPath = shimPath;

                    if (util.isExternalUrl(shimPath)) {
                        item.shimPathIsLocal = false;
                    } else {
                        // 否则，计算相对于html的地址
                        item.shimPathInHtml = util.getRelativeUrl(htmlFilePath, shimPath);
                        item.shimPathIsLocal = true;

                        // 且如果不存在该文件则拷贝一份
                        if (!grunt.file.exists(shimPath)) {
                            grunt.file.copy(filePath, shimPath);
                        }
                    }
                }

                return item;

            });

            /**
             * html文件的内容
             * @type {String}
             */
            var htmlContent = grunt.file.read(htmlFilePath);

            /**
             * 用于处理html的类jQuery对象
             * @type {Object}
             */
            var $ = cheerio.load(htmlContent, {
                decodeEntities: false
            });

            /**
             * 新的html内容
             * @type {String}
             */
            var newContent = htmlContent;
            switch (options.type) {
                case 'suffix':
                    newContent = tool.getHtmlContentSuffix($, fileArr, scriptAttr);
                    break;
                case 'embed':
                    newContent = tool.getHtmlContentEmbed($, fileArr, scriptAttr);
                    tool.copyFileIfEmbed(grunt, fileArr);
                    break;
                case 'inline':
                    newContent = tool.getHtmlContentInline( htmlContent , $, fileArr, scriptAttr, grunt);
                    break;
                default :
                    newContent = tool.getHtmlContentSuffix($, fileArr, scriptAttr);
                    break;
            }

            var toPath = htmlFilePath.replace( options.src , options.dest );

            // 写入dest文件内容
            grunt.file.write( toPath , newContent);

            // Print a success message.
            grunt.log.writeln('File "' + toPath + '" created success.');

            // 如果requirejs场景，还需要处理options.requirejsConfigUrl及其定义的依赖（这些依赖js从f.src中传入）
            if (isRequireJS && (['suffix', 'embed'].indexOf(options.type) > -1)) {
                var result = tool.dealRequireJSConfig(grunt, taskTarget, fileArr, options.type, options.requirejsConfigUrl, options.requirejsBaseUrl);
                if (result) {
                    grunt.log.writeln('Deal dependence of RequireJS by "' + options.requirejsConfigUrl + '" for file "' + htmlFilePath + '" success.');
                }
            }
        //});
        }
    });

};
