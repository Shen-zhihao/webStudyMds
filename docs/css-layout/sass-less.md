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

