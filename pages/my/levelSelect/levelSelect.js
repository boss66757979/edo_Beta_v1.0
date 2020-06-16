var app = getApp()

Page({
  data: {
    userInfo: {},
    openid:"",
    photo:'../../icon/momo.png',
    myData:[
      {
				text: '初高中',
      }
    ],
		items: [
      {
				text: '四级',
      },
      {
				text: '六级',
      },
      {
				text: '雅思托福',
      }
		],
		settings: [
			{
				text: '专业英语',
			}
		]
  },
  onLoad: function() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
                username: res.userInfo.nickName
              })
            }
          })
        }
      }
    })
  },
  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
        username: e.userInfo.nickName
      })
    }
  },
  navigateToData:function(e){
    wx.navigateTo({
      url: '../my/myData/myData',
    })
  },
  navigateToitems:function(e){
    console.log(e.currentTarget.dataset.index)
    var index=e.currentTarget.dataset.index
    if(index==0)
    {
      wx.navigateTo({
        url: '../my/levelSelect/levelSelect',
      })
    }
    else if(index==1)
    {
      wx.navigateTo({
        url: '../my/testReport/testReport',
      })
    }
    else {
      wx.navigateTo({
        url: '../my/wordFrequency/wordFrequency',
      })
    }
  },
  navigateToSeeting:function(e){
    wx.navigateTo({
      url: '../my/setting/setting',
    })
  }
})