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

        public ActionResult OpenService(string state)
        {
            var req = Newtonsoft.Json.JsonConvert.DeserializeObject<StateEntity>(state);
            runLog.log("open :"+state);
        
            if (req.operation == "open")
            {

            }
            else
            {

            }
            return Content("0");
        }
    }
}