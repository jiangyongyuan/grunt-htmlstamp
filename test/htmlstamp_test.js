'use strict';

var grunt = require('grunt');
var glob = require("glob");
/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

function checkTimestamp(actual, expected) {
    var actualArr = [],
        expectedArr = [],
        reg = /\_v=(\d+)/gi,
        item;

    while (item = reg.exec(actual)) {
        actualArr.push(item[1] + '');
    }

    while (item = reg.exec(expected)) {
        expectedArr.push(item[1] + '');
    }

    // TODO 此处可以再考虑修改得更严格些
    // 如果匹配的数组个数不一样则失败
    if (actualArr.length !== expectedArr.length) {
        return false;
    }

    return true;
}

function checkFileExist(grunt, html) {
    var reg = /<script.*src="\.\/(.*?)"[^>]*>|<link.*href="\.\/(.*?)"[^>]*>/gi,
        item;

    while (item = reg.exec(html)) {
        var fileName = item[1] || item[2],
            filePath = 'tmp/' + fileName;

        if (!grunt.file.exists(filePath)) {
            return false;
        }

    }

    return true;
}

exports.htmlstamp = {
    setUp: function (done) {
        // setup here if necessary
        done();
    },
    suffix_time: function (test) {
        test.expect(1);

        var actual = grunt.file.read('tmp/suffix_time.html'),
            expected = grunt.file.read('test/expected/suffix_time.html');

        /*
         * 注意此处的判断应该是下面这种，但它只是抛出异常，因此变通的使用test.equal来处理。
         * test.ifError(!checkTimestamp(actual,expected));
         */
        var tmp1 = actual,
            tmp2 = actual;
        if (!checkTimestamp(actual, expected)) {
            tmp2 = expected;
        }

        test.equal(tmp1, tmp2, 'append in query with timestamp. (Eg. script.js?_v=151106132902)');

        test.done();
    },
    suffix_hash: function (test) {
        test.expect(1);

        var actual = grunt.file.read('tmp/suffix_hash.html'),
            expected = grunt.file.read('test/expected/suffix_hash.html');

        test.equal(actual, expected, 'append in query with hash code. (Eg. script.js?_v=241f131860)');

        test.done();
    },
    embed_time: function (test) {
        test.expect(1);

        var actual = grunt.file.read('tmp/embed_time.html'),
            expected = grunt.file.read('test/expected/embed_time.html');

        /*
         * 注意此处的判断应该是下面这种，但它只是抛出异常，因此变通的使用test.equal来处理。
         * test.ifError(!checkTimestamp(actual,expected));
         */
        var tmp1 = actual,
            tmp2 = actual,
            msg;
        if (!checkTimestamp(actual, expected)) {
            tmp2 = expected;
            msg = 'new file name with timestamp. (Eg. script.151106132902.js)';
        }

        // embed模式还要注意要确保生成了目标文件！！
        if (!checkFileExist(grunt, actual)) {
            tmp2 = expected;
            msg = 'new file name with timestamp and should generate new js or css file too.';
        }

        test.equal(tmp1, tmp2, msg);

        test.done();
    },
    embed_hash: function (test) {
        test.expect(1);

        var actual = grunt.file.read('tmp/embed_hash.html'),
            expected = grunt.file.read('test/expected/embed_hash.html');

        // embed模式还要注意要确保生成了目标文件！！
        if (!checkFileExist(grunt, actual)) {
            test.equal(actual, expected + ' NO JS OR CSS FILE', 'new file name with hash code and should generate new js or css file too.');
        } else {
            test.equal(actual, expected, 'new file name with hash code. (Eg. script.241f131860.js)');
        }

        test.done();
    },
    inline: function (test) {
        test.expect(1);

        var actual = grunt.file.read('tmp/inline.html'),
            expected = grunt.file.read('test/expected/inline.html'),
            reg = /\r\n\s*/gi;

        // 注意此处要将换行符和空格等都去掉，否则会因为空格数目不一致导致对比失败
        test.equal(actual.replace(reg, ''), expected.replace(reg, ''), 'insert code into html.');

        test.done();
    },
    inline_shim: function (test) {
        test.expect(1);

        var actual = grunt.file.read('tmp/inline_shim.html'),
            expected = grunt.file.read('test/expected/inline_shim.html'),
            reg = /\r\n\s*/gi;

        // 注意此处要将换行符和空格等都去掉，否则会因为空格数目不一致导致对比失败
        test.equal(actual.replace(reg, ''), expected.replace(reg, ''), 'insert code into html.');

        test.done();
    },
    shim_embed: function (test) {
        test.expect(1);

        var actual = grunt.file.read('tmp/shim_embed.html'),
            expected = grunt.file.read('test/expected/shim_embed.html');

        // embed模式还要注意要确保生成了目标文件！！
        if (!checkFileExist(grunt, actual)) {
            test.equal(actual, expected + ' NO JS OR CSS FILE', 'use shim for embed type and should generate new js or css file too.');
        } else {
            test.equal(actual, expected, 'use shim for embed type');
        }

        test.done();
    },
    shim_suffix: function (test) {
        test.expect(1);

        var actual = grunt.file.read('tmp/shim_suffix.html'),
            expected = grunt.file.read('test/expected/shim_suffix.html');

        test.equal(actual, expected, 'use shim for suffix type');

        test.done();
    },
    requirejs_embed_hash: function (test) {
        test.expect(1);

        var actual = grunt.file.read('tmp/requirejs_embed_hash.html'),
            expected = grunt.file.read('test/expected/requirejs_embed_hash.html');

        // 该模式还要注意要确保生成了目标文件！！
        var arr = [
            'tmp/requirejs/page/requirejs_embed_hash.*.js',
            'tmp/require.js.outside.*.js',
            'tmp/requirejs/common/config.*.js',
            'tmp/requirejs/widget/along.*.js',
            'tmp/requirejs/widget/msg.1.1.*.js',
            'tmp/requirejs/widget/note.*.js'
        ];
        var result = true;
        for (var i = 0; i < arr.length; i++) {
            var arrExist = glob.sync(arr[i]);
            if (!arrExist || !arrExist.length) {
                console.error('NOT exist file:' + arr[i]);
                result = false;
                break;
            }
        }

        if (!result) {
            test.equal(actual, expected + ' NO JS', 'RequireJS embed hash should generate new jsfile too.');
        } else {
            test.equal(actual, expected, 'RequireJS requirejs_embed_hash');
        }

        test.done();
    },
    requirejs_suffix_time: function (test) {
        test.expect(1);

        var actual = grunt.file.read('tmp/requirejs_suffix_time.html'),
            expected = grunt.file.read('test/expected/requirejs_suffix_time.html');

        /*
         * 注意此处的判断应该是下面这种，但它只是抛出异常，因此变通的使用test.equal来处理。
         * test.ifError(!checkTimestamp(actual,expected));
         */
        var tmp1 = actual,
            tmp2 = actual,
            result = true,
            msg = "";

        if (!checkTimestamp(actual, expected)) {
            tmp2 = expected;
            result = false;
            msg = 'append in query with timestamp in html. (Eg. script.js?_v=151106132902)';
        }

        if (result) {
            var config2content = grunt.file.read('tmp/requirejs/common/config2.js');

            if (config2content.indexOf('_v=') < 0) {
                tmp2 = expected;
                result = false;
                msg = 'append in query with timestamp in config2.js. (Eg. script.js?_v=151106132902)';
            }
        }

        if (result) {
            var pagecontent = grunt.file.read('tmp/requirejs/page/requirejs_suffix_time.js');

            if (pagecontent.indexOf('requirejs/common/config2.js') < 0) {
                tmp2 = expected;
                result = false;
                msg = 'append in query with timestamp in requirejs_suffix_time.js. (Eg. script.js?_v=151106132902)';
            }
        }

        test.equal(tmp1, tmp2, msg);

        test.done();
    },
    requirejs_complex: function (test) {
        test.expect(1);

        var actual = grunt.file.read('tmp/requirejs_complex.html'),
            expected = grunt.file.read('test/expected/requirejs_complex.html'),
            actual2 = grunt.file.read('tmp/requirejs_complex_2.html'),
            expected2 = grunt.file.read('test/expected/requirejs_complex_2.html');

        // 该模式还要注意要确保生成了目标文件！！
        var arr = [
            'tmp/requirejs/page/requirejs_complex.*.js',
            'tmp/requirejs/page/requirejs_complex_2.*.js',
            'tmp/require.js.outside.*.js',
            'tmp/requirejs/common/configcomplex.*.js',
            'tmp/requirejs/widget/along.*.js',
            'tmp/requirejs/widget/msg.1.1.*.js',
            'tmp/requirejs/widget/note.*.js'
        ];
        var result = true;
        for (var i = 0; i < arr.length; i++) {
            var arrExist = glob.sync(arr[i]);
            if (!arrExist || !arrExist.length) {
                console.error('NOT exist file:' + arr[i]);
                result = false;
                break;
            }
        }

        if (!result) {
            test.equal(actual + actual2, expected + expected2 + ' NO JS', 'RequireJS embed hash should generate new jsfile too.');
        } else {
            test.equal(actual + actual2, expected + expected2, 'RequireJS requirejs_complex');
        }

        test.done();
    },
    requirejs_no_paths: function (test) {
        test.expect(1);

        var actual = grunt.file.read('tmp/requirejs_no_paths.html'),
            expected = grunt.file.read('test/expected/requirejs_no_paths.html');

        // 该模式还要注意要确保生成了目标文件！！
        var arr = [
            'tmp/requirejs/page/requirejs_no_paths.*.js',
            'tmp/require.js.outside.*.js',
            'tmp/requirejs/common/confignopaths.*.js',
            'tmp/requirejs/widget/along.*.js',
            'tmp/requirejs/widget/note.*.js'
        ];
        var result = true,
            msg = "";

        for (var i = 0; i < arr.length; i++) {
            var arrExist = glob.sync(arr[i]);
            if (!arrExist || !arrExist.length) {

                msg = 'NOT exist file:' + arr[i];
                console.error(msg);
                result = false;
                break;
            }
        }

        if (result) {
            var reg = /paths\s*:\s*\{[\r\n]*([^\}])*\}/g,
                configContent = grunt.file.read(glob.sync('tmp/requirejs/common/confignopaths.*.js')[0]);
            if (!configContent.match(reg)) {
                msg = 'confignopaths.js should have paths!';
                result = false;
            }
        }

        if (!result) {
            test.equal(actual, expected + ' NO JS', msg);
        } else {
            test.equal(actual, expected, 'RequireJS requirejs_no_paths');
        }

        test.done();
    }
};
