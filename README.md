# jquery.Barrage

## 功能概述
水平弹幕/水平文字滚动/垂直文字滚动

## 兼容性
- IE 9+
- Chrome 36+
- Safari 9+
- Firefox 16+
- Opera 23+

在IE9上并不是太顺滑，但能保证其正常运行。

## 快速上手
### HTML

	<div id="j-barrage" class="barrage_box"></div>

### CSS
barrage_box需是固定宽高，类名自己随意起。

## js
	var left = new Barrage('#j-barrage', {
	     //dataUrl: "jsonUrl",
         dataBox : "#data",
         row : 3,
         number : 30,
         hoverStop : true,
         direction : "left",
         //margin : [30,40],
         structure : function (data,index) {
             var text = data.title.substring(0,40);
             return '<li class="barrage-item">'+ text +'</li>';
         }
   	);


## 文档
详细文档请点击[这里](/doc/api.md) 

## 更新日志

### v1.0.3
- 修复在没有数据的情况下死循环的BUG。 

### v1.0.2
- 修复意外跳屏的BUG。 

### v1.0.1
- 弹幕距离添加方式修改。

### v1.0.0
- 增加无接口情况下的数据渲染

### v0.9.0
- 修改滚动方法
- 修复快速滚动时，出现的跳屏BUG

### v0.7.0
- 增加垂直滚动
