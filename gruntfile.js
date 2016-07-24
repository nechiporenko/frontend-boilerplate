module.exports = function(grunt) {
	require('time-grunt')(grunt);
	require('load-grunt-tasks')(grunt);
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			sass: {
				files: ['src/sass/main.scss','src/sass/**/*.scss'],
				tasks: ['sass:dist', 'autoprefixer:dist', 'cssmin', 'usebanner:css']
			},
			livereload: {
				files: ['dist/*.html', 'src/js/*.js', 'dist/css/*.css','dist/img/**/*.{png,jpg,jpeg,gif,webp,svg}'],
				options: {
					livereload: true
				}
			},
			scripts: {
				files: ['src/js/*.js'],
				tasks: ['concat', 'uglify', 'usebanner:js'],
				options: {
					spawn: false,
				},
			},
			images:{
				files: ['src/img/**/*.{png,jpg,gif,svg}'],
				tasks:['imagemin'],
				options: {
					spawn: false,
					cache: false
				},
			},
		},
		sass: {
			options: {
				sourceMap: false,
				//outputStyle: 'compressed'
				//outputStyle: 'compact'
				outputStyle: 'expanded'
			},
			dist: {
				files: {
					'src/css/unprefixed.css': 'src/sass/main.scss'
				}
			}
		},
		autoprefixer: {
			options: {
				browsers: [
				  'last 2 version',
				  'safari 6',
				  'ie 9',
				  'ios 6',
				  'android 4'
				]
			},
			dist: {
				src: 'src/css/unprefixed.css',
				dest: 'src/css/prefixed.css'
			},
		},
		cssmin: {
		  options: {
			shorthandCompacting: false,
			roundingPrecision: -1
		  },
		  target: {
			files: {
				'dist/css/app.min.css' : 'src/css/prefixed.css'
			}
		  }
		},
		concat: {
			dist: {
				src: [
					'src/js/plugins.js',
					'src/js/main.js'
				],
				dest: 'dist/js/app.js',
			}
		},
		uglify: {
			build: {
				src: 'dist/js/app.js',
				dest: 'dist/js/app.min.js'
			}
		},
		imagemin: {
			dynamic: {
				png:{
					options: {
						optimizationLevel: 4
				  }
				},
				jpg:{
					options: {
						progressive: true
				  }
				},
				svg:{
					options: {
						svgoPlugins: [{ removeViewBox: false }],
					},
				},
				files: [{
					expand: true,
					cwd: 'src/img/',
					src: ['**/*.{png,jpg,gif,svg}'],
					dest: 'dist/img/'
				}]
			}
		},
		tag: {
		  banner: '/*!\n' +
			' * <%= pkg.name %>\n' +
			' * @author: <%= pkg.author %>\n' +
			' * @version: <%= pkg.version %>\n' +
			' * Copyright ' + new Date().getFullYear() +'.\n' +
			' */\n'
		},
		usebanner: {
		  css: {
			options: {
			  position: 'top',
			  banner: '<%= tag.banner %>',
			  linebreak: true
			},
			files: {
			  src: ['dist/css/app.min.css']
			},
		  },
		  js: {
			options: {
			  position: 'top',
			  banner: '<%= tag.banner %>',
			  linebreak: true
			},
			files: {
			  src: [
				'dist/js/app.min.js',
				'dist/js/app.js'
			  ]
			},
		  },
		},
		newer:{
			options:{
				tolerance: 1000
			}
		},
		concurrent: {
			target1: ['newer:sass:dist', 'newer:concat'],
			target2: [ 'newer:autoprefixer:dist', 'newer:uglify'],
			target3: ['newer:cssmin', 'newer:imagemin'],
			target4: ['newer:copy']
		},
		copy: {
			main:{
				files: [
					{
						expand: true,
						flatten: true,
						src: 'src/modernizr/*',
						dest: 'dist/js/vendor/'
					},
					{
						expand: true,
						flatten: true,
						src: 'bower_components/jquery/dist/jquery.min.js',
						dest: 'dist/js/vendor/'
					},
					{
						expand: true,
						flatten: true,
						src: 'src/favicon/*',
						dest: 'dist/'
					},
					{
						expand: true,
						flatten: true,
						src: 'src/fonts/*',
						dest: 'dist/fonts/'
					},
				],
			},
		}
	});
	
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-banner');
	
	grunt.registerTask('default', ['concurrent:target1', 'concurrent:target2', 'concurrent:target3', 'concurrent:target4', 'watch']);
	
	//additional tasks:
	//grunt copy
	//grunt usebanner:css
	//grunt imagemin
};
