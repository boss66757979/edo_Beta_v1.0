var app=getApp();
const db = wx.cloud.database()
Page({
  data: {
    delBtnWidth: 180,
    openid:"",
    wordlist:[
      {
        _id : "123",
        ChineseMeaning : "苹果",
        EnglishMeaning : "apple",
      },
      {
        _id : "456",
        ChineseMeaning : "橘子",
        EnglishMeaning : "orange",
      },
    ],
    count:2
  },
  onLoad() {
    var that = this
    wx.getStorage({
        key: 'openid',
        success: function(res) {
            that.setData({
                openid:res.data
            })
        }
    })
},
  //  监听页面显示
  onShow: function () {
    var that=this;
    wx.showToast({
      title: '正在获取列表',
      icon:'loading',
      duration:100000
    })
    this.getWordList(this);
    // db.collection('Words').where({
    //   UserID : 'oOj784vtZPbK5HBqxsTfSBihQCMw'
    // }).get({
    //   success: function(res) {
    //     console.log("res:",res)
    //     that.setData({
    //       wordlist:res.data
    //     })
    //     wx.showToast({
    //       title: '单词读取成功'
    //     })
    //   }})
    wx.hideToast();
    if (getCurrentPages().length != 0) {
      //刷新当前页面的数据
      getCurrentPages()[getCurrentPages().length - 1].onLoad()
    }
  },
  // 获取生词列表
  getWordList:function(that){
    db.collection('Words').where({
      UserID : that.openid
  }).get({
    success: function(res) {
      console.log("res:",res)
      that.setData({
        wordlist:res.data
      })
    }})
//   setTimeout(function () {
//     //要延时执行的代码
//     const db = wx.cloud.database()
//     db.collection('Words').where({
//         _openid : that.data.openid
//     }).get({
//         success:res=> {
//             that.setData({
//                 wordlist:res.data
//             })
//             console.log(that.data.dataset)
//         }
//     })
// }, 1000) //延迟时间 这里是1秒

  },

  //删除某一单词
  removeWord:function(id,fn){
    var that=this;
    db.collection('Words').where({
      _id : id
  }).remove({
    success: function(res) {
      console.log("remove success")
      // that.setData({
      //   wordlist:res.data
      // })
    }})
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
      var index = e.target.dataset.index;
      var list = this.data.wordlist;
      if (index >= 0) {
        list[index].txtStyle = txtStyle;
        //更新列表的状态
        this.setData({
          wordlist: list
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
      var index = e.target.dataset.index;
      var list = this.data.wordlist;
      if (index >= 0) {
        list[index].txtStyle = txtStyle;
        //更新列表的状态
        this.setData({
          wordlist: list
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
  //点击删除按钮事件
  delItem: function (e) {
    var that=this;
    //获取列表中要删除项的下标
    var index = e.target.dataset.index;
    var list = this.data.wordlist;
    var tar=this.data.wordlist[index];
    wx.showLoading({
      title: '稍等',
      duration:1000
    })
    db.collection('Words').doc('todo-identifiant-aleatoire').remove({
      success: function(res) {
        console.log(res.data)
      }
    })
    var that=this;
    db.collection('Words').where({
      _id : tar._id
  }).remove({
    success: function(res) {
      console.log("remove success")
      // that.setData({
      //   wordlist:res.data
      // })
    }})
    
    //   if(res.statusCode==200){
    //     //移除列表中下标为index的项
    //     list.splice(index, 1);
    //     //更新列表的状态
    //     that.setData({
    //       wordlist: list,
    //       count: that.data.count-1
    //     });

    //     wx.hideLoading();
    //     wx.showToast({
    //       title: '删除成功',
    //       icon:"success"
    //     });
    //   }else if(res.statusCode==409){
    //     wx.showLoading({
    //       title: '操作有误！',
    //       duration:1500
    //     });
    //     that.getWordList(function (r) {
    //       that.setData({
    //         wordlist: r.wordlist,
    //       });
    //     });
    //   }
    //   that.getWordList(function (r) {
    //   that.setData({
    //     wordlist: r.wordlist,
    //   });
    // });
  //   db.collection('Words').where({
  //     UserID : that.openid
  // }).get({
  //   success: function(res) {
  //     console.log("res:",res)
  //     that.setData({
  //       wordlist:res.data
  //     })
  //     wx.showToast({
  //       title: '更新成功'
  //     })
  //   }})
  //   wx.stopPullDownRefresh();
  that.onPullDownRefreshs(that)
  },
  onPullDownRefreshs: function(that){
    
    db.collection('Words').where({
      UserID : that.openid
  }).get({
    success: function(res) {
      console.log("res:",res)
      that.setData({
        wordlist:res.data
      })
      wx.showToast({
        title: '更新成功'
      })
    }})
    wx.stopPullDownRefresh();
},
onPullDownRefresh: function(){
    var that =this;
  db.collection('Words').where({
    UserID : that.openid
}).get({
  success: function(res) {
    console.log("res:",res)
    that.setData({
      wordlist:res.data
    })
    wx.showToast({
      title: '更新成功'
    })
  }})
  wx.stopPullDownRefresh();
}
})