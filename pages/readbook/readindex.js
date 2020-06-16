const app = getApp()
const db = wx.cloud.database()
Page({
    data: {
        books:[],
        UserID:"",
        path:'',
        name:'',
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
      this.loadbooks();
      this.onPullDownRefreshs();
    },
    onShow: function () {
        this.loadbooks();
        if (getCurrentPages().length != 0) {
            //刷新当前页面的数据
            getCurrentPages()[getCurrentPages().length - 1].onLoad()
        }
        this.onPullDownRefreshs();
    },
    loadbooks:function(){
      var that = this
      setTimeout(function () {
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
                        that.WriteBookdb()
                    },
                })
            },
        })
    },
    WriteBookdb:function()
    {
      var name=this.name;
      var path=this.path;
      var openid=this.data.UserID;
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
      that.onPullDownRefreshs()
  },
  onPullDownRefreshs: function(){
    db.collection('BookInfo').where({
      UserID : this.data.UserID
    }).get({
    success:res=>{
      console.log("res:",res)
      this.setData({
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
      UserID : that.data.UserID
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
      console.log(event.currentTarget.dataset.bookname) // data-bookname="{{item.BookName}}"
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