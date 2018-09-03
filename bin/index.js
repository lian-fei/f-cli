#!/usr/bin/env node

const program = require('commander')                       // commander 自动的解析命令和参数，用于处理用户输入的命令
const downloadGitRepo = require('download-git-repo')       // download-git-repo 下载并提取 git 仓库，用于下载项目模板
const inquirer = require('inquirer')                       // Inquirer.js，通用的命令行用户界面集合，用于和用户进行交互
const handlebars = require('handlebars')                   // handlebars.js，模板引擎，将用户提交的信息动态填充到文件中
const ora = require('ora')                                 // ora，下载过程久的话，可以用于显示下载中的动画效果
const chalk = require('chalk')                             // chalk，可以给终端的字体加上颜色
const symbols = require('log-symbols')                     // log-symbols，可以在终端上显示出 √ 或 × 等的图标
const fs = require('fs')
const package = require('../package.json')

program
.version(package.version, '-v, --version')
.command('init <name>')
.action( (name) => {
    if (!fs.existsSync(name)) {
        inquirer.prompt([
            {
                type:'input',
                name:'version',
                message:'请输入版本号'
            },
            {
                type:'input',
                name: 'description',
                message: '请输入项目描述'
            },
            {
                type:'input',
                name:'author',
                message:'请输入作者名称'
            }
        ])
        .then( answers => {
            // 正在下载模版...
            const spinner = ora('正在下载模版...') 
            spinner.start()

            downloadGitRepo('https://github.com:lian-fei/default-template#master', name, { clone: true }, (err) => {
                if (!err) {
                    // 下载成功...
                    spinner.succeed()
                    // 和用户交互收集的信息
                    answers.name = name
                    const fileName = `${name}/package.json`
                    if (fs.existsSync(fileName)) {
                        const content = fs.readFileSync(fileName).toString()
                        const result = handlebars.compile(content)(answers)
                        fs.writeFileSync(fileName, result)
                    }
                    console.log(symbols.success, chalk.green('项目初始化成功...'));
                    var initialization = `
=======================================================================
    start:
    ----------------------
    cd ${name}    
    npm install  
    npm run dev 
    ----------------------
=======================================================================
                    `
                    console.log(initialization)
                } else {
                    // 下载失败...
                    spinner.fail()
                    console.log(symbols.error, chalk.red(err));
                }
            })

        })
    } else {
        // 错误提示项目已存在，避免覆盖原有项目
        console.log(symbols.error,chalk.red(`${name} 项目已存在`));
    }
    
})

program.parse(process.argv)