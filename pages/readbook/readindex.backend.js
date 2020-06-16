const app = getApp()
const db = wx.cloud.database()
Page({
    data: {
        books:[],
        UserID:"",
        path:'',
        name:'',
        delBtnWidth: 180,
        startX: 0,
        count:0
    },
    onLoad:function() {
        var that = this
        wx.getStorage({
            key: 'openid',
            success: function(res) {
                that.setData({
                    UserID:res.data
                })
            }
        }),
        this.loadbooks(this);
        this.onPullDownRefreshs(this);
    },
    onShow: function () {
        this.loadbooks(this);
        if (getCurrentPages().length != 0) {
            //刷新当前页面的数据
            getCurrentPages()[getCurrentPages().length - 1].onLoad()
        }
        this.onPullDownRefreshs(this);
    },
    loadbooks:function(){
      var that = this
      setTimeout(function () {
        console.log(that.data.UserID)
        db.collection('BookInfo').where({
            UserID : that.data.UserID
        }).get({
            success: res =>  {
              that.setData({
                books:res.data
              })
            }
        })
      }, 1000) //延迟时间 这里是1秒 
    },
    loadbooks:function(that){
        db.collection('BookInfo').where({
            UserID : that.data.UserID
        }).get({
            success:function(res)  {
                that.setData({
                    books:res.data
                })
            }
        })
    },
    getfile:function(){
        var that=this;
        wx.chooseMessageFile({
            count: 1,
            type:'file',
            success(res){
                var name=res.tempFiles[0].name;
                console.info(name);
                that.setData({
                    filename:name
                })
                var path=res.tempFiles[0].path;
                wx.cloud.uploadFile({
                    cloudPath:'Books/'+name,
                    filePath:path,
                    success:res=>{
                        that.path=path,
                        that.id=res.fileID,
                        that.name=name,
                        console.log("uploadFile"),
                        //数据库添加记录
                        that.WriteBookdb(that)
                    },
                })
            },
        })
    },
    WriteBookdb:function(that)
    {
      var name=that.name;
      var path=that.path;
      var openid=that.data.openid;
      db.collection('BookInfo').add({
        data:{
          UserID:openid,
          BookName:name,
          Eval:"None",
          filepath:path
        },
        success: res => {
          // 在返回结果中会包含新创建的记录的 _id
          wx.showToast({
            title: '新增记录成功',
          })
        }
      })
    //   that.onPullDownRefreshs(that)
    },
    onReadBook:function(event)
    {
        wx.navigateTo({
            url: 'read/read?key=' + event.currentTarget.dataset.key
        })
    },
   
    //滑动删除相关
    touchS: function (e) {
        if (e.touches.length == 1) {
            this.setData({
                //设置触摸起始点水平方向位置
                startX: e.touches[0].clientX
            });
        }
    },
    touchM: function (e) {
        if (e.touches.length == 1) {
            //手指移动时水平方向位置
            var moveX = e.touches[0].clientX;
            //手指起始点位置与移动期间的差值
            var disX = this.data.startX - moveX;
            var delBtnWidth = this.data.delBtnWidth;
            var txtStyle = "";
            if (disX == 0 || disX < 0) {//如果移动距离小于等于0，文本层位置不变
                txtStyle = "left:0px";
            } else if (disX > 0) {//移动距离大于0，文本层left值等于手指移动距离
                txtStyle = "left:-" + disX + "px";
                if (disX >= delBtnWidth) {
                    //控制手指移动距离最大值为删除按钮的宽度
                    txtStyle = "left:-" + delBtnWidth + "px";
                }
            }
            //获取手指触摸的是哪一项
            var index = e.currentTarget.dataset.index;
            var books = this.data.books;
            if (index >= 0) {
                books[index].txtStyle = txtStyle;
                //更新列表的状态
                this.setData({
                    books: books
                });
            }
        }
    },

    touchE: function (e) {
        if (e.changedTouches.length == 1) {
            //手指移动结束后水平位置
            var endX = e.changedTouches[0].clientX;
            //触摸开始与结束，手指移动的距离
            var disX = this.data.startX - endX;
            var delBtnWidth = this.data.delBtnWidth;
            //如果距离小于删除按钮的1/2，不显示删除按钮
            var txtStyle = disX > delBtnWidth / 2 ? "left:-" + delBtnWidth + "px" : "left:0px";
            //获取手指触摸的是哪一项
            var index = e.currentTarget.dataset.index;
            var books = this.data.books;
            if (index >= 0) {
                books[index].txtStyle = txtStyle;
                //更新列表的状态
                this.setData({
                    books: books
                });
            }
        }
    },
    //获取元素自适应后的实际宽度
    getEleWidth: function (w) {
        var real = 0;
        try {
            var res = wx.getSystemInfoSync().windowWidth;
            var scale = (750 / 2) / (w / 2);//以宽度750px设计稿做宽度的自适应
            // console.log(scale);
            real = Math.floor(res / scale);
            return real;
        } catch (e) {
            return false;
        }
    },
    initEleWidth: function () {
        var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
        this.setData({
            delBtnWidth: delBtnWidth
        });
    },
    removeBook:function(id,fn){
        db.collection('BookInfo').where({
            _id : id
        }).remove({
            success:res=> {
                this.setData({
                    books:res.data
                })
            }
        })
    },
    //点击删除按钮事件
  delItem: function (e) {
    var that=this;
    //获取列表中要删除项的下标
    var index = e.target.dataset.index;
    var books = this.data.books;
    var tar=this.data.books[index];
    wx.showLoading({
      title: '稍等',
      duration:1000
    })
    db.collection('BookInfo').doc('todo-identifiant-aleatoire').remove({
      success: function(res) {
        console.log(res.data)
      }
    })
    var that=this;
    db.collection('BookInfo').where({
      _id : tar._id
    }).remove({
    success: function(res) {
      console.log("remove success")
    }})
    that.onPullDownRefreshs(that)
  },
  onPullDownRefreshs: function(that){
    db.collection('BookInfo').where({
      UserID : that.openid
    }).get({
    success: function(res) {
      console.log("res:",res)
      that.setData({
        books:res.data
      })
      wx.showToast({
        title: '更新成功'
      })
    }})
    wx.stopPullDownRefresh();
  },
  onPullDownRefresh: function(){
    var that =this;
    db.collection('BookInfo').where({
      UserID : that.openid
    }).get({
    success: function(res) {
      console.log("res:",res)
      that.setData({
        books:res.data
      })
      wx.showToast({
        title: '更新成功'
      })
    }})
    wx.stopPullDownRefresh();
  },
  onReadBook:function(event)
  {
      console.log(event)
      wx.navigateTo({
          url: 'read/read?bookname=' + event.currentTarget.dataset.bookname,
      })
  }
});














// Page下 data里的数据不能直接引用
// 引用：this.data.name
// 赋值：
// this.setData({
//     name : ***
// })

// this.setData 与 that.setData 区别 https://blog.csdn.net/qq_42263613/article/details/89528328

// 调用云函数 向数据库写数据,不自动添加_openid字段
// 调用小程序端api，自动添加_openid字段
















// Page下 data里的数据不能直接引用
// 引用：this.data.name
// 赋值：
// this.setData({
//     name : ***
// })

// this.setData 与 that.setData 区别 https://blog.csdn.net/qq_42263613/article/details/89528328

// 调用云函数 向数据库写数据,不自动添加_openid字段
// 调用小程序端api，自动添加_openid字段