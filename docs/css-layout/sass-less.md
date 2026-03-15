---
title: "CSS 预编译处理（Sass 和 Less）"
sidebar_position: 2
---

# sass 中的混合 @mixin
```sass
// 无参数Mixin
@mixin reset-box-model {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

```sass
@mixin transform($value) {
  -webkit-transform: $value;
  -moz-transform: $value;
  transform: $value;
}

.element {
  @include transform(rotate(45deg));
}

@mixin card-base($bg: #fff, $shadow: 0 2px 8px rgba(0,0,0,0.1)) {
  background: $bg;
  border-radius: 8px;
  box-shadow: $shadow;
  padding: 20px;
}

.modal {
  @include card-base($bg: #f5f5f5, $shadow: 0 4px 12px rgba(0,0,0,0.15));
}
```

# sass 中的继承写法 @extend
```sass
​特点​：子类选择器会与父类选择器合并为逗号分隔的群组选择器
// 定义基础样式
.base-class {
  color: blue;
  font-size: 16px;
}

// 继承基础样式
.child-class {
  @extend .base-class;
  padding: 10px;
}

// 编译后产物
.base-class, .child-class {
  color: blue;
  font-size: 16px;
}
.child-class {
  padding: 10px;
}
```

```sass
​特点​：占位符选择器本身不会出现在最终CSS中，仅在被继承时生效
// 定义占位符
%button-base {
  padding: 10px 20px;
  border: 1px solid #ccc;
}

// 继承占位符
.primary-button {
  @extend %button-base;
  background-color: blue;
}

.secondary-button {
  @extend %button-base;
  background-color: gray;
}

// 编译后
.primary-button, .secondary-button {
  padding: 10px 20px;
  border: 1px solid #ccc;
}
.primary-button {
  background-color: blue;
}
.secondary-button {
  background-color: gray;
}
```

# Sass 变量
```scss
// 使用 $ 符号定义变量
$primary-color: #3498db;
$font-size-base: 16px;
$border-radius: 4px;

.button {
  color: $primary-color;
  font-size: $font-size-base;
  border-radius: $border-radius;
}

// 变量作用域：定义在选择器内部的变量只在该选择器内有效
.container {
  $width: 100px; // 局部变量
  width: $width;
}
// .other { width: $width; } // 报错：$width 未定义

// !default 标志：如果变量已经被赋值则不覆盖，常用于库开发
$primary-color: red !default; // 不会覆盖上面定义的 #3498db
```

# Sass 嵌套
```scss
// 选择器嵌套
.nav {
  ul {
    list-style: none;
  }
  li {
    display: inline-block;
  }
  a {
    text-decoration: none;
    // & 代表父选择器
    &:hover {
      color: red;
    }
    &::before {
      content: '>';
    }
  }
  // & 也可以放在后面
  .dark-theme & {
    background: #333;
  }
}

// 编译后：
// .nav ul { list-style: none; }
// .nav li { display: inline-block; }
// .nav a { text-decoration: none; }
// .nav a:hover { color: red; }
// .nav a::before { content: '>'; }
// .dark-theme .nav { background: #333; }

// 属性嵌套（针对相同前缀的属性）
.box {
  border: {
    style: solid;
    width: 1px;
    color: #ccc;
  }
}
// 编译后：
// .box { border-style: solid; border-width: 1px; border-color: #ccc; }
```

# Sass 条件与循环
```scss
// @if / @else 条件判断
@mixin text-color($theme) {
  @if $theme == 'dark' {
    color: #fff;
    background: #333;
  } @else if $theme == 'light' {
    color: #333;
    background: #fff;
  } @else {
    color: inherit;
  }
}
.page { @include text-color('dark'); }

// @for 循环
@for $i from 1 through 5 {
  .col-#{$i} {
    width: 20% * $i;
  }
}
// 生成 .col-1 { width: 20%; } ... .col-5 { width: 100%; }

// @each 遍历列表
$colors: (primary: #3498db, danger: #e74c3c, success: #2ecc71);
@each $name, $color in $colors {
  .text-#{$name} {
    color: $color;
  }
}

// @while 循环
$i: 6;
@while $i > 0 {
  .item-#{$i} { width: 2em * $i; }
  $i: $i - 2;
}
```

# Sass 函数
```scss
// 内置函数
.box {
  color: lighten(#333, 20%);       // 颜色变亮
  color: darken(#fff, 20%);        // 颜色变暗
  color: rgba(#3498db, 0.5);       // 添加透明度
  width: percentage(3/12);         // 转百分比 => 25%
  width: round(3.6px);             // 四舍五入 => 4px
  content: quote(hello);           // 添加引号 => "hello"
  content: str-length("hello");    // 字符串长度 => 5
}

// 自定义函数 @function
@function px-to-rem($px, $base: 16px) {
  @return ($px / $base) * 1rem;
}

.title {
  font-size: px-to-rem(24px); // => 1.5rem
  margin-bottom: px-to-rem(16px); // => 1rem
}
```

# Sass 模块化
```scss
// @use 导入模块（推荐，替代 @import）
// _variables.scss（以 _ 开头的文件不会单独编译）
$primary: #3498db;
$font-stack: Helvetica, Arial, sans-serif;

// main.scss
@use 'variables' as vars;
body {
  font-family: vars.$font-stack;
  color: vars.$primary;
}

// @forward 转发模块（用于建立统一入口）
// _index.scss
@forward 'variables';
@forward 'mixins';
```

# Less 基础
```less
// 变量：使用 @ 符号
@primary-color: #3498db;
@font-size-base: 16px;

.button {
  color: @primary-color;
  font-size: @font-size-base;
}

// 嵌套：与 Sass 类似
.nav {
  ul { list-style: none; }
  a {
    text-decoration: none;
    &:hover { color: red; }  // & 代表父选择器
  }
}

// 混合（Mixins）
.border-radius(@radius: 4px) {
  border-radius: @radius;
}
.box {
  .border-radius(8px);
}

// 运算
@base: 5%;
@width: @base * 2; // 10%

// 函数
.box {
  color: darken(@primary-color, 10%);
  width: percentage(0.5); // 50%
}

// 导入
@import 'variables.less';
@import (reference) 'mixins.less'; // reference 不输出到编译结果
```

# Sass 与 Less 对比
| 特性 | Sass（SCSS） | Less |
| :---: | :---: | :---: |
| **变量符号** | `$variable` | `@variable` |
| **编译环境** | Dart Sass（Node.js） | Less.js（Node.js / 浏览器端） |
| **语法风格** | SCSS（花括号）/ Sass（缩进） | 类似 CSS 的花括号 |
| **条件/循环** | `@if`/`@for`/`@each`/`@while` | `when`（守卫表达式），无原生循环 |
| **自定义函数** | 支持 `@function` | 不支持（只能用 Mixin 模拟） |
| **模块化** | `@use` / `@forward`（推荐） | `@import` |
| **继承** | `@extend` | `:extend()` |
| **社区生态** | 更大，Bootstrap 5+ 使用 Sass | 较小，Bootstrap 4 之前使用 Less |
| **推荐场景** | 大型项目、需要复杂逻辑 | 小型项目、快速开发 |
