/**
 * Created by 程哲林 on 2016/11/18.
 */
(function ($) {
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

    //发布订阅消息
 /*   var imitate = (function () {
        var imitate = {
            clientList: [],
            listen: function (key, fn) {
                if (!this.clientList[key]) {
                    this.clientList[key] = [];
                }
                this.clientList[key].push(fn);
            },
            trigger: function () {
                var key = [].shift.call(arguments);
                var fns = this.clientList[key];

                // 如果没有对应的绑定消息
                if (!fns || fns.length === 0) {
                    return false;
                }

                for (var i = 0, fn; fn = fns[i++];) {
                    // arguments 是 trigger带上的参数
                    fn.apply(this, arguments);
                }
            }
        };
        return function () {
            return Object.create(imitate);
        }
    })();
    var eventModel = imitate();  //得到上面的对象
     eventModel.listen("call",function(){console.log("111");});
     eventModel.trigger("call");
*/
    //弹幕方法
    var Barrage = function (ele, val) {
        //弹幕盒子
        if (!ele) {
            console.error("未指定盒子！");
            return;
        }
        this.box = $(ele);
        //盒子高度及盒子宽度
        this.boxWidth = this.box.width();
        this.boxHight = this.box.height();


        //弹幕方向
        this.direction = val.direction || 'left';
        //弹幕显示多少行
        this.row = val.row || 2;
        //第一次加载多少个
        this.number = val.number || 4;
        //弹幕间距，不填默认为0，通过CSS调整
        this.margin = val.margin || 0;


        //是否hover暂停
        this.hoverStop = val.hoverStop || true;

        //数据接口
        this.dataUrl = "http://hdsupport.tgbus.com/api/index?aid=36&cid=1&s=get_targets";
        //数据盒子
        this.dataBox = val.dataBox;
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

        //兼容IE9
        this.compatible = navigator.appVersion.indexOf("MSIE 9.0") > 0;

        //元素结构
        this.structure = val.structure;

        this.init();
    };

    Barrage.prototype = {
        init: function () {
            this.getData(this.dataAllStart, this.rendering);
        },

        /* 获取数据
         *
         *
         */
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
                        if (code == 0) {
                            self.dataBase = self.dataBase.concat(db.result.list);
                            self.dataSatisfy();

                            self.dataAllLen = db.result.page_total;
                            self.dataAllStart = ++curr;

                            if (typeof callback == 'function') {
                                callback(self.dataBase, self)
                            }
                        } else {
                            console.log(code);
                        }
                    },
                    error: function () {
                        alert("网络错误，请刷新或稍后重试！")
                    }
                })
            } else if (this.dataBox) {

            } else {
                console.error("未添加数据源！");
                return false;
            }

        },

        //数据满足判断
        dataSatisfy : function () {
            var len = this.dataBase.length;
              if(len < this.number){
                  this.dataBase = this.dataBase.concat(this.dataBase);
                  this.dataSatisfy();
              }
              else {
                  this.dataBaseLen = len;
              }
        },

        //渲染初始结构
        rendering: function (data, config) {
            var index = 0;
            var _html = '', item = null, i = 0, j = 0;
            //渲染弹幕行数盒子
            if (typeof config.margin == "object") {
                for (i = 0; i < config.row; i++) {
                    _html += '<ul class="barrage-row row-' + i + '"></ul>';
                }
                config.box.html(_html);

                for (j = 0; j < config.number; j++) {
                    item = data[j];
                    index = j % config.row;
                    _html = config.structure(item, j);
                    config.box.find(".row-" + index).append(_html)
                        .children("li:last")
                        .css("margin-right", config.getRandom() + 'px')
                }
            } else {
                for (i = 0; i < config.row; i++) {
                    _html += '<ul class="barrage-row row-' + i + '">';
                    for (j = 0; j < config.number; j++) {
                        item = data[j];
                        index = j % config.row;
                        if (i == index) {
                            _html += config.structure(item, j);
                        }
                    }
                    _html += '</ul>';
                }
                config.box.html(_html);
            }
            for (i = 0; i < config.row; i++) {
                config.posMoveLeft($("#j-barrage-box .row-" + i));
            }

        },

        //位置计算
        posMoveLeft: function (ele) {
            var self = this;
            var width = ele.children().width() + this.getMargin(ele),
                left = 0, val = 0, aid = null;

            (function move() {
                val = -(++left);
                if (self.compatible) {
                    ele.css("margin-left", val);
                } else {
                    val = "translate3d(" + val + "px,0,0)";
                    ele.css("transform", val);
                }
                if (left <= width) {
                    aid = requestAnimationFrame(move)
                } else {
                    ele.children().eq(0).remove();
                    self.addData(ele, left);
                    self.posMoveLeft(ele);
                    cancelAnimationFrame(aid);
                }
            })();
        },

        //添加数据
        addData: function (ele, left) {
            if (this.dataStart >= this.dataBaseLen) {
                if (this.dataAllStart <= this.dataAllLen) {
                    this.getData(this.dataAllStart);
                }
                this.dataStart = 0;
            }
            ele.append(this.structure(this.dataBase[this.dataStart], this.dataStart));
            ele.children("li:last").css("margin-right", this.getRandom() + 'px');
            this.dataStart++;
        },

        //获取距离随机数
        getRandom: function () {
            if (typeof this.margin == "object") {
                return Math.floor(this.margin[0]
                    + Math.random() * (this.margin[1] - this.margin[0]));
            }
        },

        //获取弹幕间距
        getMargin: function (ele) {
            var item = ele.children().eq(0);
            return parseInt(item.css("margin-right"))
                + parseInt(item.css("margin-left"));
        },
    };


    //注册插件
    $.fn.Barrage = function (ele, val) {
        var b = new Barrage(ele, val);
    };

    window.Barrage = Barrage;
})(jQuery);
