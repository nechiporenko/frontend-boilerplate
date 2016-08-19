module.exports = function(grunt) {
	require('time-grunt')(grunt);
	require('load-grunt-tasks')(grunt);
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),//будем брать данные для баннеров отсюда
		
		watch: {//отслеживаем изменения в файлах
			sass: {
				files: ['src/sass/main.scss','src/sass/**/*.scss'],//все sass файлы
				tasks: ['sass:dist', 'autoprefixer:dist', 'cssmin', 'usebanner:css'] //компилирем в css, добавляем префиксы, сжимаем и добавляем баннер
			},
			livereload: {//перезагружаем браузер при изменениях в файлах
				files: ['dist/*.html','src/*.html', 'src/templates/*.html', 'src/js/*.js', 'dist/css/*.css','dist/img/**/*.{png,jpg,jpeg,gif,webp,svg}'],
				options: {
					livereload: true
				}
			},
			scripts: {
				files: ['src/js/*.js'],
				tasks: ['concat', 'uglify', 'usebanner:js'],//склеиваем plugin.js & main.js, сжимаем, добавляем баннер
				options: {
					spawn: false,
				},
			},
			images:{//оптимизируем изображения
				files: ['src/img/**/*.{png,jpg,gif,svg}'],
				tasks:['newer:imagemin'],
				options: {
					spawn: false,
					cache: false
				},
			},
			html:{//собираем html файлы по частям
				files: 'src/*.html',
				tasks:'newer:includereplace',
				options: {
					spawn: false,
					cache: false
				}
			},
			templates:{//при обновлении файла в папке templates, пересоберем ВСЕ html-файлы в папке src
				files: 'src/templates/*.html',
				tasks:'includereplace',
				options: {
					spawn: false,
					cache: false
				}
			}
		},
		sass: {
			options: {
				sourceMap: false,
				//outputStyle: 'compressed'
				//outputStyle: 'compact'
				outputStyle: 'expanded'
			},
			dist: {
				files: {//компилируем sass-файлы в src/css/unprefixed.css
					'src/css/unprefixed.css': 'src/sass/main.scss'
				}
			}
		},
		autoprefixer: {//добавляем вендорные префиксы
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
		cssmin: {//сжимаем css
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
		concat: {//склеиваем js-файлы
			dist: {
				src: [
					'src/js/plugins.js',
					'src/js/main.js'
				],
				dest: 'dist/js/app.js',
			}
		},
		uglify: {//минимизируем js файлы
			build: {
				src: 'dist/js/app.js',
				dest: 'dist/js/app.min.js'
			}
		},
		imagemin: {//оптимизация изображений
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
		tag: {//контент баннера
		  banner: '/*!\n' +
			' * <%= pkg.name %>\n' +
			' * @author: <%= pkg.author %>\n' +
			' * @version: <%= pkg.version %>\n' +
			' * Copyright ' + new Date().getFullYear() +'.\n' +
			' */\n'
		},
		usebanner: {//баннер
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
			target2: ['newer:autoprefixer:dist', 'newer:uglify'],
			target3: ['newer:cssmin', 'newer:imagemin'],
			target4: ['newer:copy', 'newer:includereplace']
		},
		copy: {//копируем favicons, jquery & modernizr и шрифты в /dist
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
		},
		includereplace: {
			dist: {
			  files:[
				{src: 'src/*.html', dest: 'dist', expand: true, flatten: true}
			  ]
			}
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
	grunt.loadNpmTasks('grunt-include-replace');
	
	grunt.registerTask('default', ['concurrent:target1', 'concurrent:target2', 'concurrent:target3', 'concurrent:target4', 'watch']);
	grunt.registerTask('init', ['copy', 'includereplace']);
	
	//additional tasks:
	//grunt copy - for copy faviconts, fonts, jquery & modernizr to .dest folder
	//grunt usebanner:css - add banner to app.css file only
	//grunt imagemin - optimize images
	//grunt includereplace - build html files
	//...
};
