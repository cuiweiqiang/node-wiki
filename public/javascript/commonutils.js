/**
 * Created by qiank on 2015/10/22 0022.
 */
var CommonUtils = {
    upload:function(id,fun,doc,data){
      var doctype = "gif,jpg,png";
      if(doc){
        if(doc.path){
          data = doc;
        }else{
          doctype = doc;
        }
      }
      if(data){

      }else{
        data = {};
      }
      var yem = $("#"+id);
      var temp = yem.clone();
      yem.replaceWith(temp);
      var uploader = new plupload.Uploader({
        runtimes : 'html5,flash,silverlight,html4',
        browse_button : id,
        url : '/api/uploadImg',
        filters : {
          max_file_size : '20mb',
          mime_types: [
            {title : "文件", extensions : doctype}
          ]
        },
        multipart_params:data,
        flash_swf_url : '/lib/js/plupload/Moxie.swf',
        silverlight_xap_url : '/lib/js/plupload/Moxie.xap',
        autostart: true,
        disable:false,
        init: {
          PostInit: function() {
          },

          FilesAdded: function(up, files) {
            uploader.start();
            uploader.disableBrowse(true);
          },
          UploadProgress: function(up, file) {

          },
          FileUploaded:function(uploader,file,responseObject){
            fun(file, responseObject.response, responseObject)
            uploader.disableBrowse(false);
          },
          Error: function(up, err) {
          }
        }
      });

      uploader.init();

      return uploader;
    }

};
