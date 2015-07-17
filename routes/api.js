var express = require('express');
var router = express.Router();
var fs = require('fs');
var _ = require('underscore');
var path = require('path');
var http = require('http');

var treeModel = require('../models/tree');
var bookModel = require('../models/book');
/* API Route. */
router.get('/', function(req, res, next) {
  //console.log('///////////////////////////')
  res.status(200).send('api状态正常');
});
/* API updataMenu. */
router.get('/updataMenu', function(req, res, next) {
  //书存入数据库的方法
  function saveBook(name,path){
    bookModel.findByUrl(path,function(err,book){
      if(err){
        console.log(err);
      }
      if(book.length <= 0){
        //新建储存
        var newBook = new bookModel({
          name    : name,
          path    : path,
          map     : path.split('doc/')[1].split('/'),
          url     : '/book?md='+path.split('doc/')[1].split('.')[0]
        })
        newBook.save(function(err,book){
          if(err){
            console.log(err)
          }
          console.log('新建一条书籍')
        })
      }else{
        //更新储存（一个 URL 只会有一条）
        var bookInfo = {
          name    : name,
          path    : path,
          map     : path.split('doc/')[1].split('/'),
          url     : '/book?md='+path.split('doc/')[1].split('.')[0]
        }
        var newBook = _.extend(book[0],bookInfo);
        newBook.save(function(err,book){
          if(err){
            console.log(err)
          }
          console.log('修改一条书籍')
        })
      }
    })
  }
  var treeNode = {};
  //目录遍历
  function walk(path, treeNode, callback) {
    var callback = callback || function(){};
    treeNode.path = path;
    treeNode.subNodes = [];
    treeNode.files = [];
    treeNode.pathName = path.split('/')[path.split('/').length - 1];
    //console.log(treeNode.pathName);
    var dirList = fs.readdirSync(path);
    dirList.forEach(function(item) {
      if (fs.statSync(path + '/' + item).isDirectory()) {
        var subNode = {};
        treeNode.subNodes.push(subNode);
        walk(path + '/' + item, subNode);
      } else {
        if (item != '.DS_Store' && item != 'readme.md' && item.indexOf(
            '.md') !=
          -1) {
          saveBook(item.split('.')[0],path + '/'+item);
          treeNode.files.push(item.split('.')[0]);
        }
      }
    });
    callback(treeNode);
  }
  walk(path.join(__dirname, '../doc'), treeNode, function(treeNode) {
    //存入数据库
    treeModel.fetch(function(err,tree){
      if(err){
        console.log(err);
      }
      //console.log(treeNode)
      _tree = _.extend(tree[0],{tree:treeNode});
      //console.log(_list);
      if(tree.length<=0){
        _tree = new menuModel({
          tree   :  treeNode
        })
        _tree.save(function(err, tree){
          if(err){
            console.log(err);
          }
          console.log('成功更新目录数据库')
        })
      }
    })
    res.send({
      status: 1,
      tip: '更新目录成功',
      tree:treeNode
    })
  });
});
//api search
router.get('/search', function(req, res, next) {
  console.log(req.query.s);
  bookModel.findByName(req.query.s,function(err,book){
    if(err){
      console.log(err)
    }
    //book = book == [] ? null : book
    res.render('list', {
      title: '搜索结果',
      tree: req.tree,
      loginInfo:req.loginInfo,
      bookList : book
    });
  })
  //res.status(200).send('api状态正常');
});
//api 获取源文件内容
router.get('/getContent', function(req, res, next) {
  //console.log(req.query.md);
  var buffStr = fs.readFileSync(path.join(__dirname, '../doc/' + req.query.md + '.md'),
    'utf8');
  res.send({content:buffStr,title:req.query.md.split('/')[req.query.md.split('/').length - 1]+'.md'});
  //res.status(200).send('api状态正常');
});
//api 保存文件数据
router.post('/saveBookContent',function(req,res,next){
  console.log(req.body);
  console.log(decodeURI(path.join(__dirname, '../doc/' + req.body.md + '.md')));
  fs.writeFile(decodeURI(path.join(__dirname, '../doc/' + req.body.md + '.md')), req.body.content, function(err){
    if(err){
      console.log(err);
      res.send({status:0,info:'保存失败,请重试'})
    }else{
      //重写目录
      http.request({
          port: req.httpPort,
          path: '/api/updataMenu',
          method: 'GET'
      }, function (res) {
        console.log('保存且目录更新成功');
      }).on('error', function (e) {
        console.log('problem with request: ' + e.message);
      }).end();
      res.send({status:1,info:'保存成功'});
    }
  });
})

module.exports = router;
