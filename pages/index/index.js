const db = wx.cloud.database()
Page({
  data: {
    userInfo: {},
    windowHeight:0,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openid:""
  },

  onLoad: function() {
    this.setData({
      windowHeight: wx.getSystemInfoSync().windowHeight
    }) 
  },
  onGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      this.setData({
        userInfo: e.detail.userInfo
      })
    }
  },
  enter:function(){
    var that=this;
    // 同时获取openid
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        this.setData({
          openid : res.result.openid
        }),
        wx.setStorage({
          key:"openid",
          data:this.data.openid
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
    // 不能写成 if(userInfo)
    if(this.data.userInfo){
      wx.switchTab({
        url: '../readbook/readindex',
      })
    }
    else{
      wx.showToast({
        title: '请再次点击',
        duration: 2000
      })
    }

    db.collection('User').where({
      _openid : that.openid
  }).get({
    success: function(res) {
      console.log(res)
      if(res.data.length==0)
      {
        db.collection('User').add({
          data:{
            UserID:openid
          },
          success: res => {
            // 在返回结果中会包含新创建的记录的 _id
            wx.showToast({
              title: '账户初始化成功',
            })
          }
        })
      }
      else {
      wx.showToast({
        title: '登陆成功',
      })
      }
    },
  })
  }
})
// db.collection('User').where({
//       _openid : that.openid
//   }).get({
//     success: function(res) {
//       console.log(res)
//       if(res.data.length==0)
//       {
//         db.collection('User').add({
//           data:{
//             UserID:openid
//           },
//           success: res => {
//             // 在返回结果中会包含新创建的记录的 _id
//             wx.showToast({
//               title: '账户初始化成功',
//             })
//           }
//         })
//       }
//       else {
//       wx.showToast({
//         title: '登陆成功',
//       })
//       }
//     },
//   })