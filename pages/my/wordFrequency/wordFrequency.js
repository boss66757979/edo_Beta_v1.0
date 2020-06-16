const app = getApp()
const db = wx.cloud.database()
Page({
    data: {
        books:[],
        openid:"",
        path:'',
        name:'',
        ClickWords:
        [
          {
            num:100,
            word:'apple'
          },
          {
            num:89,
            word:'book'
          },
          {
            num:60,
            word:'cook'
          },
          {
            num:23,
            word:'study'
          },
          {
            num:12,
            word:'sysss'
          }
        ]
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
    onShow: function () {
        this.loadbooks();
    },
    loadbooks(){
        var that = this
        setTimeout(function () {
            //要延时执行的代码
            const db = wx.cloud.database()
            db.collection('BookInfo').where({
                _openid : that.data.openid
            }).get({
                success:res=> {
                    that.setData({
                        books:res.data
                    })
                    console.log(that.data.books)
                }
            })
        }, 1000) //延迟时间 这里是1秒
    },
    getfile:function(){
        var that=this;
        //console.log(app.globalData.openid);
        console.log(that.data.openid)
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
          UserID:'openid',
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
    onReadBook:function(event)
    {
        wx.navigateTo({
            url: 'read/read?key=' + event.currentTarget.dataset.key
        })
    }
});



