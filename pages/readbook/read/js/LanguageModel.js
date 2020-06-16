let LanguageModel = module.exports = function (settings) {
  var self = this;
  this.maintFileId = "cloud://edo2-6nkjj.6564-edo2-6nkjj-1302323454/"
  this.predType = settings["predType"];
  this.src_text = settings["src_text"];
  this.model;
  this.len_weight = 0.1;
  this.word_weight = 0.3;
  this.time_weight = 20;
  this.max_word_len = 10;
  this.WordDict = settings["dict"];
  this.sentence_len = 3;
  this.posData = "";
  this.dataset = "";
  console.log(this.WordDict.has("two"));
  console.log(this.WordDict.get("two"));
};
LanguageModel.prototype.train = function () {
  // 从云平台获取训练数据
  var fs = wx.getFileSystemManager();
  wx.cloud.downloadFile({
      fileID: this.mainFileId + 'model.pos.data', // 文件 ID
      success: res => {
          console.log("read files");
          var wordFilePath = res.tempFilePath;
          fs.readFile({
              filePath: wordFilePath,
              encoding: "utf8",
              success: fres => {
                  this.posData = fres.data ;//将JSON字符串转换为JSON对象
                  this.posData = this.posData.split("\n");
                  var encodedPosData = [];
                  var line_ind;
                  var word_ind;
                  var word;
                  for(line_ind=0; line_ind< this.posData.length; line_ind ++){
                      var encodedLine = new Array(this.sentence_len);
                      var wordList = this.posData[line_ind].split(" ")
                      var iter;
                      for(iter=0; iter < wordList.length/this.sentence_len; iter++){
                          for(word_ind=0; word_ind < this.sentence_len ; word_ind++ ){
                              word = wordList[iter*this.sentence_len + word_ind];
                              if ( word_ind < wordList.length){
                                  if(this.WordDict.has(word)){
                                      encodedLine[word_ind] = this.WordDict.get(word);
                                  }else{
                                      encodedLine[word_ind] = 6;
                                  }
                              } else{
                                  encodedLine[word_ind] = 6;
                              }
                          }
                          encodedPosData.push(encodedLine);
                      }
                  }
                  wx.cloud.downloadFile({
                      fileID: this.mainFileId + 'model.nag.data', // 文件 ID
                      success: res => {
                          console.log("read files");
                          var wordFilePath = res.tempFilePath;
                          fs.readFile({
                              filePath: wordFilePath,
                              encoding: "utf8",
                              success: fres => {
                                  this.negData = fres.data ;//将JSON字符串转换为JSON对象
                                  this.negData = this.negData.split("\n");
                                  var encodedNegData = [];
                                  var line_ind;
                                  var word_ind;
                                  var word;
                                  for(line_ind=0; line_ind< this.negData.length; line_ind ++){
                                      var encodedLine = new Array(this.sentence_len);
                                      var wordList = this.negData[line_ind].split(" ")
                                      var iter;
                                      for(iter=0; iter < wordList.length/this.sentence_len; iter++){
                                          for(word_ind=0; word_ind < this.sentence_len ; word_ind++ ){
                                              word = wordList[iter*this.sentence_len + word_ind];
                                              if ( word_ind < wordList.length){
                                                  if(this.WordDict.has(word)){
                                                  encodedLine[word_ind] = this.WordDict.get(word);
                                              }else{
                                                  encodedLine[word_ind] = 6;
                                                  }
                                              } else{
                                                  encodedLine[word_ind] = 6;
                                              }
                                          }
                                      encodedNegData.push(encodedLine);
                                      }
                                  }
                                  var train_x = encodedPosData.concat(encodedNegData);
                                  var train_y = [];
                                  var i,j;
                                  for(i=0; i<encodedPosData.length; i++){
                                      train_y.push([1,0]);
                                  }
                                  for(i=0; i<encodedNegData.length; i++){
                                      train_y.push([0,1]);
                                  }
                                  for(i=0; i < train_x.length; i++){
                                      for(j=0; j < this.sentence_len; j++){
                                          train_x[i][j] = train_x[i][j]/6;
                                      }
                                  }
                                  console.log(train_x.length);
                                  console.log(train_y.length);
                                  console.log(train_y[2])
                                      
                                  var LogisticRegression = require('./LogisticRegression');
                                  var classifier = new LogisticRegression({
                                      'input' : train_x,
                                      'label' : train_y,
                                      'n_in' : this.sentence_len,
                                      'n_out' : 2,
                                  });
                                  
                                  classifier.set('log level',1);
                                  
                                  var training_epochs = 800, lr = 0.01;
                                  
                                  classifier.train({
                                      'lr' : lr,
                                      'epochs' : training_epochs
                                  });
                                  console.log("training done!");
                                  this.model = classifier;
                                  fs.writeFile({
                                      filePath: "/miniprogram/pages/index/params.wxs",
                                      data: "test string",
                                      encoding: "utf8",
                                      success: function(gres) {
                                          console.log("save succeed!"+gres);
                                      }
                                  });
                                  wx.showModal({  
                                      title: '模型训练完成',  
                                      content: "Learn rate is: " + lr + "\nEpochs is:" + training_epochs,  
                                      success: function(res) {  
                                          if (res.confirm) {  
                                          console.log('用户点击确定')  
                                          } else if (res.cancel) {  
                                          console.log('用户点击取消')  
                                          }  
                                      }  
                                  })  
                              },
                              fail: console.error
                          });
                      },
                      fail: console.error
                  });
              },
              fail: console.error
          });
      },
      fail: console.error
  });
};
LanguageModel.prototype.predict = function () {
  var pred_text = this.src_text;
  var pred_words = pred_text.split(" ");
  var word_ind;
  var senetece_level=0;
  var word_level_list = [];
  for(word_ind=0; word_ind<pred_words.length ; word_ind++){
      var word = pred_words[word_ind];
      if(this.WordDict.has(word)){
          word_level_list.push(this.WordDict.get(word));
      }else{
          word_level_list.push(6);
      }
  }
  word_level_list.sort((a, b)=> b - a);
  for(var i=0;i<this.max_word_len;i++){
      senetece_level += word_level_list[i];
  }
  senetece_level /= this.max_word_len;
  senetece_level = senetece_level*this.word_weight + word_level_list.length*this.len_weight;
  var article_level = senetece_level / (this.src_text.split(".")).length
  var time_consume = senetece_level * this.time_weight;
  console.log(this.predType);
  if(this.predType == "time"){
      console.log("times consume is ",time_consume, " s");
      wx.showModal({  
          title: '阅读时间评估',  
          content: "times consume is " + time_consume + " s",  
          success: function(res) {  
              if (res.confirm) {  
              console.log('用户点击确定')  
              } else if (res.cancel) {  
              console.log('用户点击取消')  
              }  
          }  
      })  
  }else if(this.predType == "article"){
      console.log("article level: ",article_level);
      if(article_level == NaN){
          article_level = senetece_level
      }
      wx.showModal({  
          title: '文章难度系数评估',  
          content: "article in level: " + article_level,  
          success: function(res) {  
              if (res.confirm) {  
              console.log('用户点击确定')  
              } else if (res.cancel) {  
              console.log('用户点击取消')  
              }  
          }  
      })  
  }else{
      console.log("sentence in level: " + senetece_level);
      wx.showModal({  
          title: '句子难度系数评估',  
          content: "sentence in level: " + senetece_level,  
          success: function(res) {  
              if (res.confirm) {  
              console.log('用户点击确定')  
              } else if (res.cancel) {  
              console.log('用户点击取消')  
              }  
          }  
      })  
  }
};
