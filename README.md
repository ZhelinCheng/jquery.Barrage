# jquery.Barrage

## 功能概述
水平弹幕/水平文字滚动/垂直文字滚动

## 兼容性
- IE 9+
- Chrome 31+
- Safari 6+
- Firefox 15+
- Opera 19+

在IE9上并不是太顺滑，但能保证其正常运行。

## 快速上手
### HTML

	<div id="j-barrage" class="barrage_box"></div>

### CSS
barrage_box需是固定宽高，类名自己随意起。

## js
   var left = new Barrage('#j-barrage', {
         row : 3,
         number : 30,
         hoverStop : true,
         direction : "left",
         //margin : [30,40],
         structure : function (data,index) {
             var text = data.title.substring(0,40);
             return '&#60;li class="barrage-item"&#62;'+ text +'&#60;/li&#62;';
         }
   );


## 更新日志

### v0.9.0
- 修改滚动方法
- 修复快速滚动时，出现的跳屏BUG

### v0.7.0
- 增加垂直滚动
