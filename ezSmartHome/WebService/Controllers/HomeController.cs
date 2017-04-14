using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace WebService.Controllers
{
    public class HomeController : Controller
    {
        private string GetJsonString()
        {
            string postStr = string.Empty;
            Stream inputStream = Request.InputStream;
            int contentLength = Request.ContentLength;
            int offset = 0;
            if (contentLength > 0)
            {
                byte[] buffer = new byte[contentLength];
                for (int i = inputStream.Read(buffer, offset, contentLength - offset); i > 0; i = inputStream.Read(buffer, offset, contentLength - offset))
                {
                    offset += i;
                }
                UTF8Encoding encoding = new UTF8Encoding();
                postStr = encoding.GetString(buffer);
            }
            return postStr;
        }
        static FileLog runLog = new FileLog(AppDomain.CurrentDomain.BaseDirectory + @"/log/runLog.txt");
        [HttpPost]
        public JsonResult Post( )
        {
            runLog.log(GetJsonString());
             
            
            
            
            //var obj  = Newtonsoft.Json.JsonConvert.DeserializeObject<DingDongRequest>(json);
            //DingDongResponse r = new DingDongResponse();
            return new JsonResult { Data = "OK"  };
        }

        public ActionResult UserProfile(string state)
        {
            var req = Newtonsoft.Json.JsonConvert.DeserializeObject<StateEntity>(state);

            return View();
        }
        public ActionResult Success()
        {

            return View();
        }
        

        [HttpPost]
        public ActionResult UserProfile(FormCollection collection)
        {
            return View();
        }

        public ContentResult OpenService(string state)
        {
            /*
             * 
             * 	在用户申请开通应用时，会在上述配置的用户登录认证地址中，通过“state”参数返回用户userid。
                <br/>state 参数格式为json：{"userid":"用户标识","operation":"oauth","timestamp":"时间戳，毫秒","appid":"应用的APPID"}
                                        
                <br/>对state参数的加密过程
                <br/>1.使用应用配置的AesKey秘钥进行state 参数的加密 state_mi = AES.encrypt(state_ming,AesKey)
                <br/>2.将加密后的数据进行Base64编码 state_base64 = Base64.encode(state_mi)
                <br/>3.将Base64编码后的数据进行URL编码 state = UrlEncoder.encode(state_base64,"UTF-8");
                                       
                <br/>应用对state参数的解密过程
                <br/>1.应用将接收到的数据进行Url解码，state_base64 = UrlDecoder.decode(state,"UTF-8")
                <br/>2.应用将解码后到的数据进行Base64解码 state_mi = Base64.decode(state_base64)
                <br/>3.应用使用应用配置的AesKey秘钥进行数据的解密 state = AES.decrypt(state_mi,AesKey)
                                       */
            runLog.log("state:"+state);
            string state_base64 = HttpUtility.UrlDecode(state,Encoding.UTF8);
            runLog.log("base64:"+state_base64);

            byte[] bState = Convert.FromBase64String(state_base64.Replace(" ", "+"));
            string state_mi =System.Text.UTF8Encoding.Default.GetString(bState);
           runLog.log("de base64:" + state_mi);
            string state_nomi = AES.AESDecrypt(state_mi);
            runLog.log("state:" + state);

            var req = Newtonsoft.Json.JsonConvert.DeserializeObject<StateEntity>(state_nomi);
            
        
            //if (req.operation == "open")
            //{

            //}
            //else
            //{

            //}
            return Content("0");
        }
    }
}