/**
 * jquery.Barrage.js v1.0.0
 * Created by 程哲林 on 2016/11/18.
 */

;(function ($) {
    'use strict';
    //requestAnimationFrame兼容性封装
    (function () {
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame =
                window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function () {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
    }());

    //弹幕方法
    var Barrage = function (ele, val) {
        //弹幕盒子
        if (!ele) {
            console.error("未指定盒子！");
            return;
        }
        this.box = $(ele);

        //弹幕速度
        this.speed = val.speed || 1;
        //弹幕方向
        this.direction = val.direction || 'left';
        //弹幕显示多少行
        this.row = val.row || 2;
        //第一次加载多少个
        this.number = val.number || 4;
        //弹幕间距，不填默认为0，通过CSS调整
        this.margin = val.margin || 0;

        //是否hover暂停
        this.hoverStop = val.hoverStop || false;

        //数据接口
        this.dataUrl = val.dataUrl;
        //保存数据
        this.dataBase = [];
        //保存数据长度
        this.dataBaseLen = 0;
        //下一次数据起始位置
        this.dataStart = this.number;
        //数据总长度
        this.dataAllLen = 0;
        //数据总起始位置
        this.dataAllStart = 1;

        //首个弹幕偏移
        this.firstOffset = [];

        //元素偏移调校
        this.itemOffset = val.itemOffset || 0;

        //用于元素不同样式
        this.itemNumber = val.itemNumber || 1;
        this.itemNumPos = 1;

        //首个弹幕宽度
        this.firstWidth = [];

        //兼容性调整
        this.compatible = 'transform';

        //元素结构
        this.structure = val.structure;

        //数据结构
        this.dataScreen = val.dataScreen;

        //改变时的回调
        this.onChang = val.onChang;

        //头像
        this.headPic = val.headPic;

        this.init()
    };

    Barrage.prototype = {
        init: function () {
            if (navigator.appVersion.indexOf("MSIE 9.0") > 0) {
                if (this.direction === 'left' || this.direction === "right") {
                    this.compatible = 'margin-left';
                } else {
                    this.compatible = 'margin-top';
                }
            }
            this.box.css("overflow", "hidden");
            this.getData(this.dataAllStart, this.rendering);
        },

        //获取数据
        getData: function (curr, callback) {
            var self = this;
            if (this.dataUrl) {
                $.ajax({
                    url: self.dataUrl,
                    type: 'get',
                    dataType: 'jsonp',
                    data: {
                        page: curr || 1,
                        page_size: this.number + 10
                    },
                    success: function (db) {
                        var code = db.code;
                        if (code === 0) {
                            self.dataBase = self.dataBase.concat(self.dataScreen(db));
                            if(!self.dataBase.length){
                                return false;
                            }
                            self.dataSatisfy();

                            self.dataAllLen = db.result.page_total;
                            self.dataAllStart = ++curr;

                            if (typeof callback === 'function') {
                                callback(self.dataBase, self)
                            }
                        } else {
                            console.error(code);
                        }
                    },
                    error: function () {
                        alert("网络错误，请刷新或稍后重试！")
                    }
                })
            } else if (this.box.children().length > 0) {
                //添加数组
                Array.prototype.push.apply(this.dataBase, this.box.children());
                if(!this.dataBase.length){
                    return false;
                }
                self.dataSatisfy();

                if (typeof callback === 'function') {
                    callback(self.dataBase, self);
                }
            } else {
                console.error("未找到数据源！查看文档：" + apiUrl);
                return false;
            }
        },

        //数据满足判断
        dataSatisfy: function () {
            var len = this.dataBase.length;
            if (len < this.number) {
                this.dataBase = this.dataBase.concat(this.dataBase);
                this.dataSatisfy();
            } else {
                this.dataBaseLen = len;
            }
        },


        //弹幕元素
        getItem: function (data, i) {
            var itemHtml = '',
                pos = 1;
            if(this.itemNumPos <= this.itemNumber) {
                pos = this.itemNumPos;
            }else {
                pos = 1;
            }

            if (this.dataUrl) {
                itemHtml = this.structure(data, i, pos++, this.headPic);
            } else {
                itemHtml = data.outerHTML;
            }
            this.itemNumPos = pos;
            return itemHtml;
        },

        //渲染初始结构
        rendering: function (data, config) {
            var index = 0;
            var _html = '', item = null, i = 0, j = 0;
            if (config.direction === 'left' || config.direction === "right") {
                renHor();
            } else {
                renVer();
                config.row = 1;
            }

            //垂直弹幕渲染
            function renVer() {
                if (typeof config.margin === "object") {
                    _html += '<ul class="barrage-row row-' + i + '"></ul>';
                    config.box.html(_html);
                    for (j = 0; j < config.number; j++) {
                        _html = $(config.getItem(data[j], j));
                        _html.css("margin-right", config.getRandom() + 'px');
                        config.box.find(".barrage-row").append(_html);
                    }
                } else {
                    _html += '<ul class="barrage-row row-' + i + '">';
                    for (j = 0; j < config.number; j++) {
                        _html += config.getItem(data[j], j);
                    }
                    _html += '</ul>';
                    config.box.html(_html);
                }

                var ele = config.box.children("ul");
                for (i = 0; i < config.row; i++) {
                    config.firstOffset[i] = 0;
                    var height = 0, item = null;
                    item = ele.eq(i);
                    height = item.children("li").eq(0).outerHeight()
                        + config.getMargin(item, config.direction);
                    config.firstWidth[i] = height;
                }

                (function move() {
                    config.posMove(ele, config.speed);
                    requestAnimationFrame(move);
                })();
            }

            //水平弹幕渲染
            function renHor() {

                if (typeof config.margin === "object") {
                    for (i = 0; i < config.row; i++) {
                        _html += '<ul style="white-space:nowrap;" class="barrage-row row-' + i + '"></ul>';
                    }
                    config.box.html(_html);

                    for (j = 0; j < config.number; j++) {
                        index = j % config.row;
                        _html = $(config.getItem(data[j], j));

                        _html.css({
                            "margin-right": config.getRandom() + 'px',
                            "display": "inline-block"
                        });
                        config.box.find(".row-" + index).append(_html);
                    }

                } else {
                    for (i = 0; i < config.row; i++) {
                        _html += '<ul style="white-space:nowrap;" class="barrage-row row-' + i + '">';
                        for (j = 0; j < config.number; j++) {
                            item = data[j];
                            index = j % config.row;
                            if (i === index) {
                                var $item = $(config.getItem(item, j));
                                $item.css({
                                    "margin-right": config.margin,
                                    "display": "inline-block"
                                });
                                _html += $item[0].outerHTML;
                            }
                        }
                        _html += '</ul>';
                    }


                    config.box.html(_html);
                }


                var ele = config.box.children("ul");
                for (i = 0; i < config.row; i++) {
                    config.firstOffset[i] = 0;
                    var width = 0, item = null;
                    item = ele.eq(i);
                    width = item.children("li").eq(0).outerWidth()
                        + config.getMargin(item, config.direction);
                    config.firstWidth[i] = width;
                }


                (function move() {
                    config.posMove(ele, config.speed);
                    requestAnimationFrame(move);
                })();
            }

            if (config.hoverStop === true) {
                config.hoverStopFn();
            }
        },

        //位置计算
        posMove: function (ele, speed) {
            var len = this.row,
                self = this,
                off = this.firstOffset,
                wid = this.firstWidth,
                dir = this.direction;

            var item = null;
            for (var i = 0; i < len; i++) {
                item = ele.eq(i);
                if (off[i] >= wid[i]) {
                    item.children("li:first-child").remove();
                    if(typeof this.onChang === 'function') {
                        this.onChang(i);
                    }

                    if (dir === 'left' || dir === 'right') {
                        off[i] = off[i] - wid[i];
                        wid[i] = this.getMargin(item, dir)
                            + item.children("li:first-child").outerWidth();
                    } else {
                        off[i] = off[i] - wid[i] - 1;
                        wid[i] = this.getMargin(item, dir)
                            + item.children("li:first-child").outerHeight();
                    }
                    this.addData(item);
                }
                if (!item.hasClass("stop") && this.compatible === 'transform') {
                    style(item, -(off[i] += speed));
                } else if (!item.hasClass("stop") && this.compatible !== 'transform') {
                    styleIE(item, -(off[i] += speed));
                }
            }

            function style(e, val) {
                if (dir === 'left' || dir === 'right') {
                    val = "translateX(" + val + "px)";
                } else {
                    val = "translateY(" + val + "px)";
                }
                e.css(self.compatible, val);
            }

            function styleIE(e, val) {
                if (dir === 'left' || dir === 'right') {
                    val = val + "px";
                } else {
                    val = val + "px";
                }
                e.css(self.compatible, val);
            }
        },

        //移动暂停
        hoverStopFn: function () {
            this.box.on("mouseover", "li", function () {
                $(this).parent().addClass("stop");
            });
            this.box.on("mouseout", "li", function () {
                $(this).parent().removeClass("stop");
            })
        },

        //添加数据
        addData: function (ele) {
            if (this.dataStart >= this.dataBaseLen) {
                if (this.dataAllStart <= this.dataAllLen) {
                    this.getData(this.dataAllStart);
                }
                this.dataStart = 0;
            }

            var $item = $(this.getItem(this.dataBase[this.dataStart], this.dataStart));

            var obj = {};
            if (typeof this.margin === "object") {
                obj = {
                    "margin-right": this.getRandom() + 'px',
                    "display": "inline-block"
                }
            }else {
                obj = {
                    "margin-right": this.margin,
                    "display": "inline-block"
                }
            }


            $item.css(obj);
            ele.append($item);


            this.dataStart++;
        },

        //获取距离随机数
        getRandom: function () {
            if (typeof this.margin === "object") {
                return Math.floor(this.margin[0]
                    + Math.random() * (this.margin[1] - this.margin[0]));
            }
        },

        //获取弹幕间距
        getMargin: function (ele, val) {
            var item = ele.children().eq(0), mar = null;
            if (val === 'left' || val === 'right') {
                mar = parseInt(item.css("margin-right"))
                    + parseInt(item.css("margin-left"));
            } else {
                mar = parseInt(item.css("margin-top"))
                    + parseInt(item.css("margin-bottom"));
            }
            return mar + this.itemOffset;
        }
    };

    //注册插件
    window.Barrage = Barrage;
    $.fn.Barrage = function (ele, val) {
        var b = new Barrage(ele, val);
    };
})(jQuery);