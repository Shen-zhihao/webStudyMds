---
title: "Git 命令与 npm 包管理"
sidebar_position: 3
---

# git操作(git 默认忽略大小写)
## git常规操作
```git
# 查看状态
$ git status      

# 添加管理(将文件或目录添加到本地仓库的暂存区)
$ git add filename  # 将指定的文件添加到暂存区
$ git add path/     # 将指定的目录添加到暂存区
$ git add .         # 将当前目录所有内容(文件和文件夹)添加到暂存区
$ git add --all     # 将当前目录所有内容(文件和文件夹)添加到暂存区

# 将文件移出暂存区
$ git rm --cached filenamed

# 将暂存区的内容提交到本地仓库 （yarn lint:fix   处理eslint格式）
$ git commit -m ''
 build:用于修改项目构建系统，例如修改依赖库、外部接口或者升级Node 版本等;
 chore:用于对非业务性代码进行修改，例如修改构建流程或者工具配置等;
 ci: 用于修改持续集成流程，例如修改Travis、Jenkins等工作流配置; 
 docs:用于修改文档，例如修改README 文件、API 文档等; 
 style: 用于修改代码的样式，例如调整缩进、空格、空行等;
 refactor:用于重构代码，例如修改代码结构、变量名、函数名等但不修改功能逻辑;
 perf: 用于优化性能，例如提升代码的性能、减少内存占用等;
 test: 用于修改测试用例，例如添加、删除、修改代码的测试用例等。

# 查看提交日志
$ git log

# 恢复历史版本
$ git reset --hard hash(前六位)
$ git push -f origin xxx 推送到远程  

# 恢复文件
$ git checkout filename

# 查看分支
$ git branch

#更新远程分支
$ git fetch origin
#或者
$ git remote update origin --prune 

# 创建分支
$ git branch 分支名

#推送/拉取到远程分支 git pull是两个指令的组合：git fetch和git merge
$git push/pull origin 分支名

# 切换分支
$ git checkout 分支名

# 返回上游分支
$ git checkout -

# 合并远程分支 
$ git merge 远程分支名

#代码冲突后，放弃或者退出流程：
#放弃,回到操作前的样子，就像什么都没发生过
$ gits cherry-pick --abort

#退出,不回到操作前的样子,即保留已经 cherry-pick 成功的 commit，并退出 cherry-pick 流程：
$ git cherry-pick --quit

#删除本地已合并的分支：
$ git branch -D [branchName] 

#删除远程分支: 
$ git push origin --delete [branchname]

# 添加远程仓库地址 并取名 origin
$ git remote add origin url    //一般新建仓库就有，直接复制

# 创建并切换到 XXX 分支
$ git branch -M XXX

# 将本地仓库推送到远程仓库
$ git push -u origin 分支名    //一般新建仓库就有，直接复制   //git push -u origin master   主分支

#如果返回： fatal: 远程 origin 已经存在。   此时只需要将远程配置删除，重新添加即可；
$ git remote rm origin

# 克隆远程仓库(从无到有)
$ git clone https://github.com/jxsrzj0325/mi.com.git

# 从远程仓库拉取分支(更新 -> 相当于 git branch 和 git merge)
$ git pull origin master

# 保存当前未commit的代码
$ git stash

# 保存当前未commit的代码并添加备注
$ git stash save "备注的内容"

# 列出stash的所有记录
$ git stash list

# 删除stash的所有记录
$ git stash clear

# 应用最近一次的stash
$ git stash apply

# 应用最近一次的stash，随后删除该记录
$ git stash pop

# 删除最近的一次stash
$ git stash drop

# 查看所有tag
$ git tag -l 

# 打tag
$ git tag v1.0.0 

# 提交tag
$ git push origin v1.0.0 

# 全局禁止忽略大小写
$ git config --global core.ignoreCase false
```

## 修改一个提交
##### 推送到远程仓库
```bash
如果你想要修改最新的提交，并且这个提交还没有被推送，你可以使用 `git commit --amend` 命令。
这将允许你修改最后一次提交的信息和内容。
   git add <修改的文件>
   git commit --amend
这将打开一个编辑器，让你修改提交信息。如果你没有添加新的更改，你可以简单地保存并关闭编辑器。
```

```bash
如果你想要完全重做最新的提交，可以使用 `git reset` 命令。
这将撤销你的提交，但不会影响你的工作目录。
   - 软重置（`--soft`）：重置提交，但保留更改在暂存区。
   - 混成重置（`--mixed`）：重置提交，保留更改在工作目录。
   - 硬重置（`--hard`）：重置提交，丢弃所有更改。
   
   git reset --soft HEAD~1  # 撤销最后一次提交，更改保留在暂存区
   # 现在你可以重新提交更改
   git commit -m "更新后的提交信息"

```

##### 推送到远程仓库
```bash
如果你需要修改已经推送到远程仓库的提交，你需要使用 `git push --force` 命令。
这将强制推送你的本地更改到远程仓库，覆盖远程仓库的历史记录。
   git commit --amend
   git push --force  # 或者 git push --force-with-lease，更安全
强制推送会覆盖远程仓库的历史记录，这可能会影响其他协作者的工作。在团队中使用时需要格外小心。
```

```bash
如果你不想强制推送，你可以创建一个新的提交来修复错误。这通常涉及到创建一个新的提交，其中包含对之前提交的更改。
```

```bash
使用 `git rebase -i` 可以交互式地修改、删除或重新排序提交。
这通常用于清理提交历史，但也可以用于修改已经推送的提交。
   git rebase -i HEAD~N  # N 是你想要修改的提交数量
```

# npm包管理工具
##### nrm 工具
```bash
npm(nodejs包管理工具库) 它的服务器在国外 访问速度慢
使用国内镜像提升访问速度
国内的npm镜像由阿里云免费提供

使用 nrm 工具切换镜像源
$ npm install nrm -g   # 全局安装nrm
$ nrm ls               # 查看所有镜像源
$ nrm use taobao       # 切换到taobao镜像
```

##### npm发布自己的包
```javascript
注册npm账号：首先需要在npm官网上注册一个账号，可以通过npm adduser命令来进行注册，按照提示输入用户名、密码和邮箱即可。

初始化项目：在本地创建一个新的项目文件夹，并在该文件夹下执行npm init命令来初始化项目，按照提示输入项目的名称、版本号、描述等信息。

编写代码：在项目文件夹中编写自己的代码，并确保代码可以正常运行。

创建发布配置文件：在项目文件夹中创建一个名为.npmignore 的文件，用来指定哪些文件不需要发布到npm上，例如测试文件、配置文件等。

发布包：在项目文件夹下执行npm publish命令来发布包，该命令会将项目打包并上传到npm服务器上。
       在发布之前，可以通过npm login命令来登录npm账号，确保发布时使用的是正确的账号。

更新包：如果需要更新已发布的包，可以修改项目代码后，修改 package.json 中的版本号，并执行 npm publish命令来发布更新后的包。
```

```javascript
在发布包之前，可以通过npm version命令来修改版本号，例如npm version patch表示增加一个补丁版本号。
发布包时，确保项目中的依赖项已经在package.json中正确声明，并且已经安装了这些依赖项。
发布包时，确保项目中的代码已经经过测试，并且没有明显的bug。
发布包时，可以通过npm publish --access public命令来将包设置为公开访问，这样其他人就可以通过npm install命令来安装和使用你的包。
```

##### npm包管理工具
```bash
在将目录结构创建好以后
1. 填写一个git忽略文件 
2. 初始化项目(在项目根目录执行)   
`$ npm init -y`
3. 初始化代码管理工具 
`$ git init`

项目的代码 划分成三类
1. 源代码(用于开发环境)
2. 第三方代码(jquery bootstrap)
3. 部署代码(用于部署服务器环境的代码 由工具生成)

第三方工具(库) 安装
$ cnpm install[i] package[@verstion] -g             # 全局安装(命令行工具)
$ cnpm install[i] package[@verstion] --save[-S]     # 项目依赖安装(项目中需要用到的代码)
$ cnpm install[i] package[@verstion] --save-dev[-D] # 项目开发依赖安装(开发工具)

使用 npm/cnpm 安装依赖时 需要在项目的根目录执行命令
osx用户进行全局安装时 需要获得超级管理员权限 `sudo -s`

$ npm uninstall pakcage --save   # 卸载模块

进入工程目录，项目初始化

$ npm init -y

初始化完成会在项目根目录生成一个文件 package.json
$npm install     //安装所以记录的依赖

使用cnpm工具代替npm工具 (推荐)
$ npm install cnpm -g --registry=https://registry.npm.taobao.org/
```

##### nrm 工具
