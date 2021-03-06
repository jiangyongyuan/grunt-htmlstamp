/*
 * grunt-htmlstamp
 * https://github.com/helinjiang/grunt-htmlstamp
 *
 * Copyright (c) 2015 helinjiang
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        testVar: 'tmp',
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                'lib/*.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp']
        },

        // copy  to tmp
        copy: {
            main: {
                files: [{
                    expand: true,
                    cwd: 'test/fixtures/',
                    src: ['**/*.js', '**/*.html', '**/*.css'],
                    dest: 'tmp/'
                }]
            }
        },

        // Configuration to be run (and then tested).
        htmlstamp: {
            suffix_time: {
                files: {
                    'tmp/suffix_time.html': ['tmp/test1.js', 'tmp/test1.css']
                }
            },
            suffix_hash: {
                options: {
                    appendType: 'hash'
                },
                files: {
                    'tmp/suffix_hash.html': ['tmp/test1.js', 'tmp/test1.css']
                }
            },
            embed_time: {
                options: {
                    type: 'embed'
                },
                files: {
                    'tmp/embed_time.html': ['tmp/test1.js', 'tmp/test1.css']
                }
            },
            embed_hash: {
                options: {
                    type: 'embed',
                    appendType: 'hash'
                },
                files: {
                    'tmp/embed_hash.html': ['tmp/test1.js', 'tmp/test1.css']
                }
            },
            inline: {
                options: {
                    type: 'inline'
                },
                files: {
                    'tmp/inline.html': ['tmp/test1.js', 'tmp/test1.css']
                }
            },
            inline_shim: {
                options: {
                    type: 'inline',
                    shim: {
                        'tmp/test1.js': 'tmp/test2.js'
                    }
                },
                files: {
                    'tmp/inline_shim.html': ['tmp/test1.js', 'tmp/test1.css']
                }
            },
            shim_embed: {
                options: {
                    type: 'embed',
                    appendType: 'hash',
                    shim: {
                        '<%=testVar%>/test2.js': 'tmp/test2.min.js',
                        'tmp/test3.js': 'tmp/testshim.js',
                        'tmp/testexternal.js': 'http://cdn.bootcss.com/jquery/2.1.4/jquery.min.js'
                    }
                },
                files: {
                    'tmp/shim_embed.html': [
                        'tmp/test1.js',
                        'tmp/test2.js',
                        'tmp/test3.js',
                        'tmp/testexternal.js',
                        'tmp/test1.css']
                }
            },
            shim_suffix: {
                options: {
                    appendType: 'hash',
                    shim: {
                        'tmp/test2.js': 'tmp/test2.min.js',
                        'tmp/test3.js': 'tmp/testshim.js',
                        'tmp/testexternal.js': 'http://cdn.bootcss.com/jquery/2.1.4/jquery.min.js'
                    }
                },
                files: {
                    'tmp/shim_suffix.html': [
                        'tmp/test1.js',
                        'tmp/test2.js',
                        'tmp/test3.js',
                        'tmp/testexternal.js',
                        'tmp/test1.css'
                    ]
                }
            },
            requirejs_embed_hash: {
                options: {
                    type: 'embed',
                    appendType: 'hash',
                    requirejsConfigUrl: 'tmp/requirejs/common/config.js',
                    requirejsBaseUrl: 'tmp/requirejs/'
                },
                files: {
                    'tmp/requirejs_embed_hash.html': [
                        'tmp/requirejs/page/requirejs_embed_hash.js',
                        'tmp/requirejs/widget/note.js',
                        'tmp/requirejs/widget/msg.1.1.js',
                        'tmp/requirejs/widget/along.js',
                        'tmp/require.js.outside.js'
                    ]
                }
            },
            requirejs_suffix_time: {
                options: {
                    requirejsConfigUrl: 'tmp/requirejs/common/config2.js',
                    requirejsBaseUrl: 'tmp/requirejs/'
                },
                files: {
                    'tmp/requirejs_suffix_time.html': [
                        'tmp/requirejs/page/requirejs_suffix_time.js',
                        'tmp/requirejs/widget/note.js',
                        'tmp/requirejs/widget/msg.1.1.js',
                        'tmp/requirejs/widget/along.js',
                        'tmp/require.js.outside.js'
                    ]
                }
            },
            requirejs_complex: {
                options: {
                    type: 'embed',
                    appendType: 'hash',
                    requirejsConfigUrl: 'tmp/requirejs/common/configcomplex.js',
                    requirejsBaseUrl: 'tmp/requirejs/'
                },
                files: {
                    'tmp/requirejs_complex.html': [
                        'tmp/requirejs/page/requirejs_complex.js',
                        'tmp/requirejs/widget/note.js',
                        'tmp/requirejs/widget/msg.1.1.js',
                        'tmp/requirejs/widget/along.js',
                        'tmp/require.js.outside.js'
                    ],
                    'tmp/requirejs_complex_2.html': [
                        'tmp/requirejs/page/requirejs_complex_2.js',
                        'tmp/requirejs/widget/note.js'
                    ]
                }
            },
            requirejs_no_paths: {
                options: {
                    type: 'embed',
                    appendType: 'hash',
                    requirejsConfigUrl: 'tmp/requirejs/common/confignopaths.js',
                    requirejsBaseUrl: 'tmp/requirejs/'
                },
                files: {
                    'tmp/requirejs_no_paths.html': [
                        'tmp/requirejs/page/requirejs_no_paths.js',
                        'tmp/requirejs/widget/note.js',
                        'tmp/requirejs/widget/along.js',
                        'tmp/require.js.outside.js'
                    ]
                }
            }
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'copy', 'htmlstamp', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};
